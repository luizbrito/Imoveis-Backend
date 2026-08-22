import { fetchStripePlans } from './subscriptionFetchPlans';

export async function subscriptionIsValidStripePriceId(
  stripePriceId?: string,
): Promise<boolean> {
  if (!stripePriceId) {
    return false;
  }

  const plans = await fetchStripePlans();
  return plans.some((plan) => plan.stripePriceId === stripePriceId);
}
