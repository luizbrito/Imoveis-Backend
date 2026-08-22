import { prisma } from '../../prisma';
import { subscriptionStatuses } from './subscriptionStatuses';

import Stripe from 'stripe';
import { dictionary as enDictionary } from '../../translation/en/en';
import { env } from '../../env';

export async function subscriptionCancelOnStripe({
  organizationId,
  userId,
}: {
  organizationId: string;
  userId?: string;
}) {
  if (!env.STRIPE_SECRET_KEY) {
    console.warn(enDictionary.subscription.errors.stripeNotConfigured);
    return;
  }

  const subscriptions = await prisma.subscription.findMany({
    where: {
      organizationId,
      ...(userId ? { userId } : {}),
    },
  });

  const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-04-22.dahlia',
  });

  for (let subscription of subscriptions) {
    const isActive = subscriptionStatuses.active.some(
      (activeStatus) => activeStatus === subscription.status,
    );

    if (isActive) {
      await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
    }
  }
}
