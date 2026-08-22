import { Hono } from 'hono';
import { ApiResponseError } from '../../shared/controller/ApiResponseError';
import { ApiResponseSuccess } from '../../shared/controller/ApiResponseSuccess';
import { appContext } from '../../shared/controller/appContext';
import { parseHonoQuery } from '../../shared/lib/parseHonoQuery';
import { invitationFindManyController } from './controllers/invitationFindManyController';
import { invitationFindController } from './controllers/invitationFindController';
import { invitationResendController } from './controllers/invitationResendController';
import { invitationCancelController } from './controllers/invitationCancelController';
import { invitationFindMyController } from './controllers/invitationFindMyController';
import { invitationAcceptController } from './controllers/invitationAcceptController';
import { invitationRejectController } from './controllers/invitationRejectController';

export const invitationRoutes = new Hono();

invitationRoutes.get('/my', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const payload = await invitationFindMyController(context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

invitationRoutes.get('/', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const query = parseHonoQuery(c.req.query());
    const payload = await invitationFindManyController(query, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

invitationRoutes.post('/:id/accept', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const id = c.req.param('id');
    const payload = await invitationAcceptController({ id }, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

invitationRoutes.post('/:id/reject', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const id = c.req.param('id');
    const payload = await invitationRejectController({ id }, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

invitationRoutes.post('/:id/resend', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const id = c.req.param('id');
    const payload = await invitationResendController({ id }, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

invitationRoutes.get('/:id', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const id = c.req.param('id');
    const payload = await invitationFindController({ id }, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

invitationRoutes.delete('/:id', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const id = c.req.param('id');
    const payload = await invitationCancelController({ id }, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});
