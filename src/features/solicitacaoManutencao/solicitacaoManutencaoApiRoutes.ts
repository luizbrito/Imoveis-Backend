import { Hono } from 'hono';
import { ApiResponseError } from '../../shared/controller/ApiResponseError';
import { ApiResponseSuccess } from '../../shared/controller/ApiResponseSuccess';
import { appContext } from '../../shared/controller/appContext';
import { solicitacaoManutencaoArchiveManyController } from './controllers/solicitacaoManutencaoArchiveManyController';
import { solicitacaoManutencaoAutocompleteController } from './controllers/solicitacaoManutencaoAutocompleteController';
import { solicitacaoManutencaoCreateController } from './controllers/solicitacaoManutencaoCreateController';
import { solicitacaoManutencaoDeleteManyController } from './controllers/solicitacaoManutencaoDeleteManyController';
import { solicitacaoManutencaoFindController } from './controllers/solicitacaoManutencaoFindController';
import { solicitacaoManutencaoFindManyController } from './controllers/solicitacaoManutencaoFindManyController';
import { solicitacaoManutencaoImporterController } from './controllers/solicitacaoManutencaoImporterController';
import { solicitacaoManutencaoRestoreManyController } from './controllers/solicitacaoManutencaoRestoreManyController';
import { solicitacaoManutencaoUpdateController } from './controllers/solicitacaoManutencaoUpdateController';
import { parseHonoQuery } from '../../shared/lib/parseHonoQuery';

export const solicitacaoManutencaoRoutes = new Hono();

solicitacaoManutencaoRoutes.get('/', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const query = parseHonoQuery(c.req.query());
    const payload = await solicitacaoManutencaoFindManyController(
      query,
      context,
    );
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

solicitacaoManutencaoRoutes.get('/autocomplete', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const query = parseHonoQuery(c.req.query());
    const payload = await solicitacaoManutencaoAutocompleteController(
      query,
      context,
    );
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

solicitacaoManutencaoRoutes.post('/', async (c) => {
  let context;
  try {
    const body = await c.req.json();
    context = await appContext(c);
    const payload = await solicitacaoManutencaoCreateController(body, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

solicitacaoManutencaoRoutes.post('/importer', async (c) => {
  let context;
  try {
    const body = await c.req.json();
    context = await appContext(c);
    const payload = await solicitacaoManutencaoImporterController(
      body,
      context,
    );
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

solicitacaoManutencaoRoutes.put('/archive', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const body = await c.req.json();
    await solicitacaoManutencaoArchiveManyController(body, context);
    const payload = true;
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

solicitacaoManutencaoRoutes.put('/restore', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const body = await c.req.json();
    await solicitacaoManutencaoRestoreManyController(body, context);
    const payload = true;
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

solicitacaoManutencaoRoutes.delete('/', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const query = parseHonoQuery(c.req.query());
    await solicitacaoManutencaoDeleteManyController(query, context);
    const payload = true;
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

solicitacaoManutencaoRoutes.get('/:id', async (c) => {
  let context;
  try {
    const id = c.req.param('id');
    context = await appContext(c);
    const payload = await solicitacaoManutencaoFindController({ id }, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

solicitacaoManutencaoRoutes.put('/:id', async (c) => {
  let context;
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    context = await appContext(c);
    const payload = await solicitacaoManutencaoUpdateController(
      { id },
      body,
      context,
    );
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});
