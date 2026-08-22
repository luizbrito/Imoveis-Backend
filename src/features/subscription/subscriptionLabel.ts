import { Subscription } from '../../prisma/generated/client';

export function subscriptionLabel(subscription?: Subscription | null) {
  return subscription?.stripePriceId;
}
