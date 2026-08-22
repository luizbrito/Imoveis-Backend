import { subscriptionCheckoutApiDoc } from './controllers/subscriptionCheckoutController';
import { subscriptionPortalApiDoc } from './controllers/subscriptionPortalController';
import { subscriptionWebhookApiDoc } from './controllers/subscriptionWebhookController';
import { subscriptionPlansApiDoc } from './controllers/subscriptionPlansController';
import { buildPaths } from '../../shared/openapi/routeToPath';

export function getSubscriptionPaths() {
  return {
    ...buildPaths('Subscription', [
      subscriptionPortalApiDoc,
      subscriptionCheckoutApiDoc,
      subscriptionPlansApiDoc,
    ]),
    ...buildPaths('Subscription', [subscriptionWebhookApiDoc], []),
  };
}
