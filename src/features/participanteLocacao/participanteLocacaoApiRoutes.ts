import { Hono } from 'hono';
import { ApiResponseError } from '../../shared/controller/ApiResponseError';
import { ApiResponseSuccess } from '../../shared/controller/ApiResponseSuccess';
import { appContext } from '../../shared/controller/appContext';
import { participanteLocacaoArchiveManyController } from './controllers/participanteLocacaoArchiveManyController';
import { participanteLocacaoAutocompleteController } from './controllers/participanteLocacaoAutocompleteController';
import { participanteLocacaoCreateController } from './controllers/participanteLocacaoCreateController';
import { participanteLocacaoDeleteManyController } from './controllers/participanteLocacaoDeleteManyController';
import { participanteLocacaoFindController } from './controllers/participanteLocacaoFindController';
import { participanteLocacaoFindManyController } from './controllers/participanteLocacaoFindManyController';
import { participanteLocacaoImporterController } from './controllers/participanteLocacaoImporterController';
import { participanteLocacaoRestoreManyController } from './controllers/participanteLocacaoRestoreManyController';
import { participanteLocacaoUpdateController } from './controllers/participanteLocacaoUpdateController';
import { parseHonoQuery } from '../../shared/lib/parseHonoQuery';

export const participanteLocacaoRoutes = new Hono();

participanteLocacaoRoutes.get('/', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const query = parseHonoQuery(c.req.query());
    const payload = await participanteLocacaoFindManyController(query, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

participanteLocacaoRoutes.get('/autocomplete', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const query = parseHonoQuery(c.req.query());
    const payload = await participanteLocacaoAutocompleteController(
      query,
      context,
    );
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

participanteLocacaoRoutes.post('/', async (c) => {
  let context;
  try {
    const body = await c.req.json();
    context = await appContext(c);
    const payload = await participanteLocacaoCreateController(body, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

participanteLocacaoRoutes.post('/importer', async (c) => {
  let context;
  try {
    const body = await c.req.json();
    context = await appContext(c);
    const payload = await participanteLocacaoImporterController(body, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

participanteLocacaoRoutes.put('/archive', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const body = await c.req.json();
    await participanteLocacaoArchiveManyController(body, context);
    const payload = true;
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

participanteLocacaoRoutes.put('/restore', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const body = await c.req.json();
    await participanteLocacaoRestoreManyController(body, context);
    const payload = true;
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

participanteLocacaoRoutes.delete('/', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const query = parseHonoQuery(c.req.query());
    await participanteLocacaoDeleteManyController(query, context);
    const payload = true;
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

participanteLocacaoRoutes.get('/:id', async (c) => {
  let context;
  try {
    const id = c.req.param('id');
    context = await appContext(c);
    const payload = await participanteLocacaoFindController({ id }, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

participanteLocacaoRoutes.put('/:id', async (c) => {
  let context;
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    context = await appContext(c);
    const payload = await participanteLocacaoUpdateController(
      { id },
      body,
      context,
    );
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});
