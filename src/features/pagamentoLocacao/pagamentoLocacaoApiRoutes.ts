import { Hono } from 'hono';
import { ApiResponseError } from '../../shared/controller/ApiResponseError';
import { ApiResponseSuccess } from '../../shared/controller/ApiResponseSuccess';
import { appContext } from '../../shared/controller/appContext';
import { pagamentoLocacaoArchiveManyController } from './controllers/pagamentoLocacaoArchiveManyController';
import { pagamentoLocacaoAutocompleteController } from './controllers/pagamentoLocacaoAutocompleteController';
import { pagamentoLocacaoCreateController } from './controllers/pagamentoLocacaoCreateController';
import { pagamentoLocacaoDeleteManyController } from './controllers/pagamentoLocacaoDeleteManyController';
import { pagamentoLocacaoFindController } from './controllers/pagamentoLocacaoFindController';
import { pagamentoLocacaoFindManyController } from './controllers/pagamentoLocacaoFindManyController';
import { pagamentoLocacaoImporterController } from './controllers/pagamentoLocacaoImporterController';
import { pagamentoLocacaoRestoreManyController } from './controllers/pagamentoLocacaoRestoreManyController';
import { pagamentoLocacaoUpdateController } from './controllers/pagamentoLocacaoUpdateController';
import { parseHonoQuery } from '../../shared/lib/parseHonoQuery';

export const pagamentoLocacaoRoutes = new Hono();

pagamentoLocacaoRoutes.get('/', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const query = parseHonoQuery(c.req.query());
    const payload = await pagamentoLocacaoFindManyController(query, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

pagamentoLocacaoRoutes.get('/autocomplete', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const query = parseHonoQuery(c.req.query());
    const payload = await pagamentoLocacaoAutocompleteController(
      query,
      context,
    );
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

pagamentoLocacaoRoutes.post('/', async (c) => {
  let context;
  try {
    const body = await c.req.json();
    context = await appContext(c);
    const payload = await pagamentoLocacaoCreateController(body, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

pagamentoLocacaoRoutes.post('/importer', async (c) => {
  let context;
  try {
    const body = await c.req.json();
    context = await appContext(c);
    const payload = await pagamentoLocacaoImporterController(body, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

pagamentoLocacaoRoutes.put('/archive', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const body = await c.req.json();
    await pagamentoLocacaoArchiveManyController(body, context);
    const payload = true;
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

pagamentoLocacaoRoutes.put('/restore', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const body = await c.req.json();
    await pagamentoLocacaoRestoreManyController(body, context);
    const payload = true;
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

pagamentoLocacaoRoutes.delete('/', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const query = parseHonoQuery(c.req.query());
    await pagamentoLocacaoDeleteManyController(query, context);
    const payload = true;
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

pagamentoLocacaoRoutes.get('/:id', async (c) => {
  let context;
  try {
    const id = c.req.param('id');
    context = await appContext(c);
    const payload = await pagamentoLocacaoFindController({ id }, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

pagamentoLocacaoRoutes.put('/:id', async (c) => {
  let context;
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    context = await appContext(c);
    const payload = await pagamentoLocacaoUpdateController(
      { id },
      body,
      context,
    );
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});
