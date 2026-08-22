import { Hono } from 'hono';
import { ApiResponseError } from '../../shared/controller/ApiResponseError';
import { ApiResponseSuccess } from '../../shared/controller/ApiResponseSuccess';
import { appContext } from '../../shared/controller/appContext';
import { pushTokenSaveSchema, pushTokenDeleteSchema } from './pushTokenSchemas';
import { pushTokenSaveController } from './controllers/pushTokenSaveController';
import { pushTokenDeleteController } from './controllers/pushTokenDeleteController';

export const pushTokenRoutes = new Hono();

// Save or update push token
pushTokenRoutes.post('/', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const body = await c.req.json();
    const data = pushTokenSaveSchema.parse(body);
    const payload = await pushTokenSaveController(data, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

// Delete push token
pushTokenRoutes.delete('/', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const body = await c.req.json();
    const data = pushTokenDeleteSchema.parse(body);
    const payload = await pushTokenDeleteController(data, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});
