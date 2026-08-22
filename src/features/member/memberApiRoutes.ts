import { Hono } from 'hono';
import { ApiResponseError } from '../../shared/controller/ApiResponseError';
import { ApiResponseSuccess } from '../../shared/controller/ApiResponseSuccess';
import { appContext } from '../../shared/controller/appContext';
import { parseHonoQuery } from '../../shared/lib/parseHonoQuery';
import { memberAutocompleteController } from './controllers/memberAutocompleteController';
import { memberFindController } from './controllers/memberFindController';
import { memberFindManyController } from './controllers/memberFindManyController';
import { memberUpdateController } from './controllers/memberUpdateController';
import { memberUpdateMeController } from './controllers/memberUpdateMeController';
import { invitationCreateController } from '../invitation/controllers/invitationCreateController';
import { memberRemoveController } from './controllers/memberRemoveController';
import { memberDisableController } from './controllers/memberDisableController';
import { memberRestoreController } from './controllers/memberRestoreController';
import { memberImporterController } from './controllers/memberImporterController';
import { memberSessionFindManyController } from './controllers/memberSessionFindManyController';
import { memberSessionRevokeController } from './controllers/memberSessionRevokeController';
import { memberSessionRevokeAllController } from './controllers/memberSessionRevokeAllController';
import { memberUpdateMeInputSchema } from './memberSchemas';

export const memberRoutes = new Hono();

memberRoutes.get('/', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const query = parseHonoQuery(c.req.query());
    const payload = await memberFindManyController(query, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

memberRoutes.get('/autocomplete', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const query = parseHonoQuery(c.req.query());
    const payload = await memberAutocompleteController(query, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

memberRoutes.put('/me', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const body = await c.req.json();
    const data = memberUpdateMeInputSchema.parse(body);
    const payload = await memberUpdateMeController(data, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

memberRoutes.post('/invite', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const body = await c.req.json();
    const payload = await invitationCreateController(body, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

memberRoutes.get('/:id/sessions', async (c) => {
  let context;
  try {
    const id = c.req.param('id');
    context = await appContext(c);
    const payload = await memberSessionFindManyController({ id }, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

memberRoutes.post('/:id/sessions/revoke-all', async (c) => {
  let context;
  try {
    const id = c.req.param('id');
    context = await appContext(c);
    const payload = await memberSessionRevokeAllController({ id }, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

memberRoutes.post('/:id/sessions/:sessionId/revoke', async (c) => {
  let context;
  try {
    const id = c.req.param('id');
    const sessionId = c.req.param('sessionId');
    context = await appContext(c);
    const payload = await memberSessionRevokeController(
      { id, sessionId },
      context,
    );
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

memberRoutes.get('/:id', async (c) => {
  let context;
  try {
    const id = c.req.param('id');
    context = await appContext(c);
    const payload = await memberFindController({ id }, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

memberRoutes.put('/:id', async (c) => {
  let context;
  try {
    const id = c.req.param('id');
    context = await appContext(c);
    const body = await c.req.json();
    const payload = await memberUpdateController({ id }, body, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

memberRoutes.delete('/:id', async (c) => {
  let context;
  try {
    const id = c.req.param('id');
    context = await appContext(c);
    const payload = await memberRemoveController({ id }, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

memberRoutes.patch('/:id/disable', async (c) => {
  let context;
  try {
    const id = c.req.param('id');
    context = await appContext(c);
    const payload = await memberDisableController({ id }, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

memberRoutes.patch('/:id/restore', async (c) => {
  let context;
  try {
    const id = c.req.param('id');
    context = await appContext(c);
    const payload = await memberRestoreController({ id }, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

memberRoutes.post('/importer', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const body = await c.req.json();
    const payload = await memberImporterController(body, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});
