import { SubscriptionMode } from '../../../prisma/generated/client';
import Stripe from 'stripe';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { getFrontendUrl } from '../../../shared/lib/getFrontendUrl';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  StripeCustomerMetadata,
  subscriptionCheckoutInputSchema,
  subscriptionCheckoutOutputSchema,
} from '../subscriptionSchemas';
import { subscriptionIsValidStripePriceId } from '../subscriptionIsValidStripePriceId';
import { subscriptionSelectAndValidateDefaultMode } from '../subscriptionSelectAndValidateDefaultMode';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { env } from '../../../env';

export const subscriptionCheckoutApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/subscription/checkout',
  body: subscriptionCheckoutInputSchema,
  response: subscriptionCheckoutOutputSchema,
};

export const subscriptionCheckoutMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'subscription_checkout',
  description: dictionary.subscription.mcpDescription.checkout,
  requiredPermissions: { subscription: ['create'] },
  schema: toMcpJsonSchema(subscriptionCheckoutInputSchema),
  handler: async (params, context) => {
    return await subscriptionCheckoutController(params, context);
  },
});

export async function subscriptionCheckoutController(
  query: unknown,
  context: AppContext,
): Promise<z.output<typeof subscriptionCheckoutOutputSchema>> {
  const { stripePriceId } = subscriptionCheckoutInputSchema.parse(query);

  if (!(await subscriptionIsValidStripePriceId(stripePriceId))) {
    throw new Error400(
      dictionaryFormat(
        context.dictionary.shared.errors.invalid,
        'stripePriceId',
      ),
    );
  }

  await authGuardBackend(
    {
      subscription: ['create'],
    },
    context,
  );

  if (context.currentSubscription) {
    throw new Error400(
      context.dictionary.subscription.errors.alreadyExistsActive,
    );
  }

  if (!env.STRIPE_SECRET_KEY) {
    throw new Error400(
      context.dictionary.subscription.errors.stripeNotConfigured,
    );
  }

  const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-04-22.dahlia',
  });

  const customer = await _findOrCreateStripeCustomer(stripe, context);

  const frontendUrl = getFrontendUrl(context.currentOrganization?.slug);

  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price: stripePriceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${frontendUrl}/subscription`,
    cancel_url: `${frontendUrl}/subscription`,
    customer: customer.id,
  });

  if (!session.url) {
    throw new Error400(
      context.dictionary.subscription.errors.stripeNotConfigured,
    );
  }

  return { url: session.url };
}

async function _findOrCreateStripeCustomer(
  stripe: Stripe,
  context: AppContext,
) {
  const subscriptionMode = subscriptionSelectAndValidateDefaultMode(context);

  const customers = await stripe.customers.list({
    email: context?.currentUser?.email,
    limit: 100,
  });

  let customer = customers?.data?.find((customer) => {
    const metadata: StripeCustomerMetadata = customer.metadata;

    if (subscriptionMode === SubscriptionMode.organization) {
      return (
        metadata.organizationId === context.currentOrganization?.id &&
        !metadata.memberId
      );
    }

    if (subscriptionMode === SubscriptionMode.member) {
      return (
        metadata.organizationId === context.currentOrganization?.id &&
        metadata.memberId === context.currentMember?.id
      );
    }

    return !metadata.organizationId && !metadata.memberId;
  });

  if (!customer) {
    let metadata: StripeCustomerMetadata = {
      userId: context.currentUser?.id || null,
    };

    if (subscriptionMode === SubscriptionMode.organization) {
      metadata.organizationId = context.currentOrganization?.id || null;
    }

    if (subscriptionMode === SubscriptionMode.member) {
      metadata.organizationId = context.currentOrganization?.id || null;
      metadata.memberId = context.currentMember?.id || null;
    }

    customer = await stripe.customers.create({
      email: context?.currentUser?.email,
      metadata: {
        ...metadata,
      },
    });
  }

  return customer;
}
