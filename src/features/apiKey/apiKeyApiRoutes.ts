import { Hono } from 'hono';
import { ApiResponseError } from '../../shared/controller/ApiResponseError';
import { ApiResponseSuccess } from '../../shared/controller/ApiResponseSuccess';
import { appContext } from '../../shared/controller/appContext';
import { parseHonoQuery } from '../../shared/lib/parseHonoQuery';
import { apiKeyCreateController } from './controllers/apiKeyCreateController';
import { apiKeyUpdateController } from './controllers/apiKeyUpdateController';
import { apiKeyDeleteController } from './controllers/apiKeyDeleteController';
import { apiKeyListController } from './controllers/apiKeyListController';
import { apiKeyFindController } from './controllers/apiKeyFindController';

export const apiKeyRoutes = new Hono();

apiKeyRoutes.get('/', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const payload = await apiKeyListController(
      parseHonoQuery(c.req.query()),
      context,
    );
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

apiKeyRoutes.get('/:id', async (c) => {
  let context;
  try {
    const id = c.req.param('id');
    context = await appContext(c);
    const payload = await apiKeyFindController({ id }, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

apiKeyRoutes.post('/', async (c) => {
  let context;
  try {
    const body = await c.req.json();
    context = await appContext(c);
    const payload = await apiKeyCreateController(body, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

apiKeyRoutes.put('/:id', async (c) => {
  let context;
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    context = await appContext(c);
    const payload = await apiKeyUpdateController(id, body, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

apiKeyRoutes.delete('/:id', async (c) => {
  let context;
  try {
    const id = c.req.param('id');
    context = await appContext(c);
    const payload = await apiKeyDeleteController(id, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});
