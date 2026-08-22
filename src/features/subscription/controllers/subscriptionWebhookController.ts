import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { SubscriptionMode } from '../../../prisma/generated/client';
import {
  StripeCustomerMetadata,
  subscriptionWebhookOutputSchema,
} from '../subscriptionSchemas';
import { prismaDangerouslyBypassRLS } from '../../../prisma';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import {
  invalidateSubscription,
  buildSubscriptionCacheKey,
} from '../../auth/authCache';
import { invalidateStripePlansCache } from '../subscriptionFetchPlans';
import { sendNotification } from '../../notification/notificationService';

import Stripe from 'stripe';
import { env } from '../../../env';

export const subscriptionWebhookApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/subscription/webhook',
  response: subscriptionWebhookOutputSchema,
};

export async function subscriptionWebhookController(
  rawBody: any,
  stripeSignature: string,
  context: AppContext,
) {
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error400(
      context.dictionary.subscription.errors.stripeNotConfigured,
    );
  }

  const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-04-22.dahlia',
  });

  const event = stripe.webhooks.constructEvent(
    rawBody,
    stripeSignature,
    env.STRIPE_WEBHOOK_SECRET || '',
  );

  if (event.type === 'checkout.session.completed') {
    await _processStripeCheckoutSessionCompleted(stripe, event, context);
  }

  if (
    event.type === 'customer.subscription.updated' ||
    event.type === 'customer.subscription.deleted'
  ) {
    await _processStripeCustomerSubscriptionUpdatedOrDeleted(
      stripe,
      event,
      context,
    );
  }

  if (
    event.type === 'product.created' ||
    event.type === 'product.updated' ||
    event.type === 'product.deleted' ||
    event.type === 'price.created' ||
    event.type === 'price.updated' ||
    event.type === 'price.deleted'
  ) {
    await _processStripeProductOrPriceChanged(event);
  }
}

function _selectModeFromCustomerMetadata(
  customerMetadata: StripeCustomerMetadata,
) {
  if (customerMetadata.memberId) {
    return SubscriptionMode.member;
  }

  if (customerMetadata.organizationId) {
    return SubscriptionMode.organization;
  }

  return SubscriptionMode.disabled;
}

async function _processStripeCheckoutSessionCompleted(
  stripe: Stripe,
  event: Stripe.Event,
  context: AppContext,
) {
  const data = event.data.object as { id: string };

  const stripeCheckoutSession = await stripe.checkout.sessions.retrieve(
    data.id,
    {
      expand: ['line_items', 'customer', 'subscription'],
    },
  );

  if (stripeCheckoutSession.mode !== 'subscription') {
    if (env.NODE_ENV !== 'test') {
      console.warn(`Skipping ${event.type} because it's not a subscription.`);
    }
    return;
  }

  const stripePriceId = stripeCheckoutSession.line_items?.data[0]?.price
    ?.id as string;

  const stripeSubscription =
    stripeCheckoutSession.subscription as Stripe.Subscription;
  const stripeCustomer = stripeCheckoutSession.customer as Stripe.Customer;
  const stripeCustomerMetadata =
    stripeCustomer.metadata as StripeCustomerMetadata;

  const mode = _selectModeFromCustomerMetadata(stripeCustomerMetadata);

  if (mode === 'disabled') {
    if (env.NODE_ENV !== 'test') {
      console.warn(
        `Skipping ${
          event.type
        } because the customer metadata is invalid: ${JSON.stringify(
          stripeCustomerMetadata,
        )}.`,
      );
    }
    return;
  }

  // Webhook operates without user context - bypass RLS for system operation
  const subscription = await prismaDangerouslyBypassRLS.$transaction(
    async (tx) => {
      const subscription = await tx.subscription.create({
        data: {
          mode,
          status: stripeSubscription.status,
          stripeSubscriptionId: stripeSubscription.id,
          stripeCustomerId: stripeCustomer.id,
          stripePriceId,
          userId: stripeCustomerMetadata.userId as string,
          organizationId: stripeCustomerMetadata.organizationId || undefined,
          memberId: stripeCustomerMetadata.memberId || undefined,
          cancelAt: stripeSubscription.cancel_at
            ? new Date(stripeSubscription.cancel_at * 1000)
            : null,
        },
      });

      // Create audit log
      await auditLogCreate({
        entityId: subscription.id,
        entityName: 'Subscription',
        operation: auditLogOperations.create,
        context,
        newData: subscription,
        tx,
      });

      return subscription;
    },
  );

  // Send notification to admin members about new subscription
  if (subscription.organizationId) {
    // Get user details
    const user = await prismaDangerouslyBypassRLS.user.findUnique({
      where: { id: subscription.userId },
    });

    if (user) {
      // Get product name from Stripe
      const product =
        stripeCheckoutSession.line_items?.data[0]?.description || 'Plan';

      await sendNotification({
        organizationId: subscription.organizationId,
        roles: ['admin'],
        payload: {
          type: 'subscriptionCreated',
          userName: user.name || user.email,
          userEmail: user.email,
          organizationName: '', // Will be populated by sendNotification
          planName: product,
        },
        senderUserId: subscription.userId,
        locale: context.locale,
      });
    }
  }

  // Invalidate subscription cache
  const subscriptionCacheKey = buildSubscriptionCacheKey(
    mode,
    stripeCustomerMetadata.userId || undefined,
    stripeCustomerMetadata.organizationId || undefined,
    stripeCustomerMetadata.memberId || undefined,
  );

  if (subscriptionCacheKey) {
    await invalidateSubscription(subscriptionCacheKey);
  }
}

async function _processStripeCustomerSubscriptionUpdatedOrDeleted(
  stripe: Stripe,
  event: Stripe.Event,
  context: AppContext,
) {
  const stripeSubscription = event.data.object as Stripe.Subscription;
  const stripePriceId = stripeSubscription?.items?.data?.[0]?.price
    ?.id as string;

  const updatedSubscription = await prismaDangerouslyBypassRLS.$transaction(
    async (tx) => {
      const oldSubscription = await tx.subscription.findUnique({
        where: {
          stripeSubscriptionId: stripeSubscription.id,
        },
      });

      if (!oldSubscription) {
        if (env.NODE_ENV !== 'test') {
          console.warn(
            `Skipping ${event.type} because subscription with stripeSubscriptionId ${stripeSubscription.id} was not found.`,
          );
        }
        return null;
      }

      await tx.subscription.update({
        data: {
          status: stripeSubscription.status,
          stripePriceId: stripePriceId,
          cancelAt: stripeSubscription.cancel_at
            ? new Date(stripeSubscription.cancel_at * 1000)
            : null,
        },
        where: {
          stripeSubscriptionId: stripeSubscription.id,
        },
      });

      const updated = await tx.subscription.findUniqueOrThrow({
        where: {
          stripeSubscriptionId: stripeSubscription.id,
        },
      });

      await auditLogCreate({
        entityId: updated.id,
        entityName: 'Subscription',
        operation: auditLogOperations.update,
        context,
        oldData: oldSubscription,
        newData: updated,
        tx,
      });

      return updated;
    },
  );

  if (updatedSubscription) {
    const subscriptionCacheKey = buildSubscriptionCacheKey(
      updatedSubscription.mode,
      updatedSubscription.userId || undefined,
      updatedSubscription.organizationId || undefined,
      updatedSubscription.memberId || undefined,
    );

    if (subscriptionCacheKey) {
      await invalidateSubscription(subscriptionCacheKey);
    }
  }
}

async function _processStripeProductOrPriceChanged(event: Stripe.Event) {
  if (env.NODE_ENV !== 'test') {
    console.log(
      `Processing ${event.type} event. Invalidating subscription plans cache...`,
    );
  }

  await invalidateStripePlansCache();

  if (env.NODE_ENV !== 'test') {
    console.log(`Successfully invalidated cache for ${event.type}`);
  }
}
