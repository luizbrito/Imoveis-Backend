import { Hono } from 'hono';
import { notificationFindManyController } from './controllers/notificationFindManyController';
import { notificationMarkAsReadController } from './controllers/notificationMarkAsReadController';
import { notificationMarkAsUnreadController } from './controllers/notificationMarkAsUnreadController';
import { notificationUnreadCountController } from './controllers/notificationUnreadCountController';
import { notificationSendController } from './controllers/notificationSendController';
import { ApiResponseSuccess } from '../../shared/controller/ApiResponseSuccess';
import { ApiResponseError } from '../../shared/controller/ApiResponseError';
import { appContext } from '../../shared/controller/appContext';
import { parseHonoQuery } from '../../shared/lib/parseHonoQuery';

export const notificationRoutes = new Hono();

notificationRoutes.get('/', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const query = parseHonoQuery(c.req.query());
    const payload = await notificationFindManyController(query, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

notificationRoutes.get('/unread-count', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const payload = await notificationUnreadCountController(context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

notificationRoutes.post('/mark-as-read', async (c) => {
  let context;
  try {
    const body = await c.req.json();
    context = await appContext(c);
    const payload = await notificationMarkAsReadController(body, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

notificationRoutes.post('/mark-as-unread', async (c) => {
  let context;
  try {
    const body = await c.req.json();
    context = await appContext(c);
    const payload = await notificationMarkAsUnreadController(body, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

notificationRoutes.post('/send', async (c) => {
  let context;
  try {
    const body = await c.req.json();
    context = await appContext(c);
    const payload = await notificationSendController(body, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});
