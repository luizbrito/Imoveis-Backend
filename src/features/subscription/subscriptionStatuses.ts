import { SubscriptionStatus } from '../../prisma/generated/client';

export const subscriptionStatuses = {
  active: [
    SubscriptionStatus.active,
    SubscriptionStatus.trialing,
    SubscriptionStatus.incomplete,
    SubscriptionStatus.past_due,
  ],
  inactive: [
    SubscriptionStatus.canceled,
    SubscriptionStatus.incomplete_expired,
    SubscriptionStatus.unpaid,
    SubscriptionStatus.paused,
  ],
};
