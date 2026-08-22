import { Hono } from 'hono';
import { ApiResponseError } from '../../shared/controller/ApiResponseError';
import { ApiResponseSuccess } from '../../shared/controller/ApiResponseSuccess';
import { appContext } from '../../shared/controller/appContext';
import { simulacaoFinanciamentoArchiveManyController } from './controllers/simulacaoFinanciamentoArchiveManyController';
import { simulacaoFinanciamentoAutocompleteController } from './controllers/simulacaoFinanciamentoAutocompleteController';
import { simulacaoFinanciamentoCreateController } from './controllers/simulacaoFinanciamentoCreateController';
import { simulacaoFinanciamentoDeleteManyController } from './controllers/simulacaoFinanciamentoDeleteManyController';
import { simulacaoFinanciamentoFindController } from './controllers/simulacaoFinanciamentoFindController';
import { simulacaoFinanciamentoFindManyController } from './controllers/simulacaoFinanciamentoFindManyController';
import { simulacaoFinanciamentoImporterController } from './controllers/simulacaoFinanciamentoImporterController';
import { simulacaoFinanciamentoRestoreManyController } from './controllers/simulacaoFinanciamentoRestoreManyController';
import { simulacaoFinanciamentoUpdateController } from './controllers/simulacaoFinanciamentoUpdateController';
import { parseHonoQuery } from '../../shared/lib/parseHonoQuery';

export const simulacaoFinanciamentoRoutes = new Hono();

simulacaoFinanciamentoRoutes.get('/', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const query = parseHonoQuery(c.req.query());
    const payload = await simulacaoFinanciamentoFindManyController(
      query,
      context,
    );
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

simulacaoFinanciamentoRoutes.get('/autocomplete', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const query = parseHonoQuery(c.req.query());
    const payload = await simulacaoFinanciamentoAutocompleteController(
      query,
      context,
    );
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

simulacaoFinanciamentoRoutes.post('/', async (c) => {
  let context;
  try {
    const body = await c.req.json();
    context = await appContext(c);
    const payload = await simulacaoFinanciamentoCreateController(body, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

simulacaoFinanciamentoRoutes.post('/importer', async (c) => {
  let context;
  try {
    const body = await c.req.json();
    context = await appContext(c);
    const payload = await simulacaoFinanciamentoImporterController(
      body,
      context,
    );
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

simulacaoFinanciamentoRoutes.put('/archive', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const body = await c.req.json();
    await simulacaoFinanciamentoArchiveManyController(body, context);
    const payload = true;
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

simulacaoFinanciamentoRoutes.put('/restore', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const body = await c.req.json();
    await simulacaoFinanciamentoRestoreManyController(body, context);
    const payload = true;
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

simulacaoFinanciamentoRoutes.delete('/', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const query = parseHonoQuery(c.req.query());
    await simulacaoFinanciamentoDeleteManyController(query, context);
    const payload = true;
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

simulacaoFinanciamentoRoutes.get('/:id', async (c) => {
  let context;
  try {
    const id = c.req.param('id');
    context = await appContext(c);
    const payload = await simulacaoFinanciamentoFindController({ id }, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

simulacaoFinanciamentoRoutes.put('/:id', async (c) => {
  let context;
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    context = await appContext(c);
    const payload = await simulacaoFinanciamentoUpdateController(
      { id },
      body,
      context,
    );
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});
