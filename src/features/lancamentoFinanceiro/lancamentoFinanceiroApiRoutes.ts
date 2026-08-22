import { Hono } from 'hono';
import { ApiResponseError } from '../../shared/controller/ApiResponseError';
import { ApiResponseSuccess } from '../../shared/controller/ApiResponseSuccess';
import { appContext } from '../../shared/controller/appContext';
import { lancamentoFinanceiroArchiveManyController } from './controllers/lancamentoFinanceiroArchiveManyController';
import { lancamentoFinanceiroAutocompleteController } from './controllers/lancamentoFinanceiroAutocompleteController';
import { lancamentoFinanceiroCreateController } from './controllers/lancamentoFinanceiroCreateController';
import { lancamentoFinanceiroDeleteManyController } from './controllers/lancamentoFinanceiroDeleteManyController';
import { lancamentoFinanceiroFindController } from './controllers/lancamentoFinanceiroFindController';
import { lancamentoFinanceiroFindManyController } from './controllers/lancamentoFinanceiroFindManyController';
import { lancamentoFinanceiroImporterController } from './controllers/lancamentoFinanceiroImporterController';
import { lancamentoFinanceiroRestoreManyController } from './controllers/lancamentoFinanceiroRestoreManyController';
import { lancamentoFinanceiroUpdateController } from './controllers/lancamentoFinanceiroUpdateController';
import { parseHonoQuery } from '../../shared/lib/parseHonoQuery';

export const lancamentoFinanceiroRoutes = new Hono();

lancamentoFinanceiroRoutes.get('/', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const query = parseHonoQuery(c.req.query());
    const payload = await lancamentoFinanceiroFindManyController(
      query,
      context,
    );
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

lancamentoFinanceiroRoutes.get('/autocomplete', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const query = parseHonoQuery(c.req.query());
    const payload = await lancamentoFinanceiroAutocompleteController(
      query,
      context,
    );
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

lancamentoFinanceiroRoutes.post('/', async (c) => {
  let context;
  try {
    const body = await c.req.json();
    context = await appContext(c);
    const payload = await lancamentoFinanceiroCreateController(body, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

lancamentoFinanceiroRoutes.post('/importer', async (c) => {
  let context;
  try {
    const body = await c.req.json();
    context = await appContext(c);
    const payload = await lancamentoFinanceiroImporterController(body, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

lancamentoFinanceiroRoutes.put('/archive', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const body = await c.req.json();
    await lancamentoFinanceiroArchiveManyController(body, context);
    const payload = true;
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

lancamentoFinanceiroRoutes.put('/restore', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const body = await c.req.json();
    await lancamentoFinanceiroRestoreManyController(body, context);
    const payload = true;
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

lancamentoFinanceiroRoutes.delete('/', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const query = parseHonoQuery(c.req.query());
    await lancamentoFinanceiroDeleteManyController(query, context);
    const payload = true;
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

lancamentoFinanceiroRoutes.get('/:id', async (c) => {
  let context;
  try {
    const id = c.req.param('id');
    context = await appContext(c);
    const payload = await lancamentoFinanceiroFindController({ id }, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

lancamentoFinanceiroRoutes.put('/:id', async (c) => {
  let context;
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    context = await appContext(c);
    const payload = await lancamentoFinanceiroUpdateController(
      { id },
      body,
      context,
    );
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});
