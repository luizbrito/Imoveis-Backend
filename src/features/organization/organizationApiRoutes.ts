import { Hono } from 'hono';
import { ApiResponseError } from '../../shared/controller/ApiResponseError';
import { ApiResponseSuccess } from '../../shared/controller/ApiResponseSuccess';
import { appContext } from '../../shared/controller/appContext';
import { organizationFindController } from './controllers/organizationFindController';
import { organizationCreateController } from './controllers/organizationCreateController';
import { organizationUpdateController } from './controllers/organizationUpdateController';
import { organizationDeleteController } from './controllers/organizationDeleteController';
import { organizationSetActiveController } from './controllers/organizationSetActiveController';
import { organizationLeaveController } from './controllers/organizationLeaveController';

export const organizationRoutes = new Hono();

organizationRoutes.post('/', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const body = await c.req.json();
    const payload = await organizationCreateController(body, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

organizationRoutes.get('/:id', async (c) => {
  let context;
  try {
    const id = c.req.param('id');
    context = await appContext(c);
    const payload = await organizationFindController({ id }, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

organizationRoutes.put('/:id', async (c) => {
  let context;
  try {
    const id = c.req.param('id');
    context = await appContext(c);
    const body = await c.req.json();
    const payload = await organizationUpdateController({ id }, body, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

organizationRoutes.delete('/:id', async (c) => {
  let context;
  try {
    const id = c.req.param('id');
    context = await appContext(c);
    const payload = await organizationDeleteController({ id }, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

organizationRoutes.post('/:id/set-active', async (c) => {
  let context;
  try {
    const id = c.req.param('id');
    // Exempt from org 2FA enforcement: a multi-org user blocked in an
    // enforcing org must still be able to switch to a non-enforcing one.
    context = await appContext(c, { skipTwoFactorEnforcement: true });
    const payload = await organizationSetActiveController({ id }, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

organizationRoutes.post('/:id/leave', async (c) => {
  let context;
  try {
    const id = c.req.param('id');
    context = await appContext(c);
    const payload = await organizationLeaveController({ id }, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});
