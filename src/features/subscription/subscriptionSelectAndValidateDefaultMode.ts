import { SubscriptionMode } from '../../prisma/generated/client';
import { env } from '../../env';
import { AppContext } from '../../shared/controller/appContext';
import { Error400 } from '../../shared/errors/Error400';

export function subscriptionSelectAndValidateDefaultMode(context: AppContext) {
  const subscriptionMode = env.SUBSCRIPTION_MODE;

  if (!Object.values(SubscriptionMode).includes(subscriptionMode)) {
    throw new Error400(context.dictionary.subscription.errors.disabled);
  }

  return subscriptionMode;
}
