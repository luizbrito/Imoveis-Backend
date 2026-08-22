import { Hono } from 'hono';
import { subscriptionCheckoutController } from './controllers/subscriptionCheckoutController';
import { subscriptionPortalController } from './controllers/subscriptionPortalController';
import { subscriptionWebhookController } from './controllers/subscriptionWebhookController';
import { subscriptionPlansController } from './controllers/subscriptionPlansController';
import { appContext } from '../../shared/controller/appContext';
import { ApiResponseSuccess } from '../../shared/controller/ApiResponseSuccess';
import { ApiResponseError } from '../../shared/controller/ApiResponseError';

export const subscriptionRoutes = new Hono();

subscriptionRoutes.post('/checkout', async (c) => {
  let context;
  try {
    const body = await c.req.json();
    context = await appContext(c);
    const payload = await subscriptionCheckoutController(body, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

subscriptionRoutes.post('/portal', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const payload = await subscriptionPortalController(context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

subscriptionRoutes.post('/webhook', async (c) => {
  let context;
  try {
    const body = await c.req.text();
    const signature = c.req.header('stripe-signature') || '';
    context = await appContext(c);
    await subscriptionWebhookController(body, signature, context);
    return ApiResponseSuccess(c, context, { received: true });
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

subscriptionRoutes.get('/plans', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const payload = await subscriptionPlansController(context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});
