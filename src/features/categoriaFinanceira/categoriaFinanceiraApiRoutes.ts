import { Hono } from 'hono';
import { ApiResponseError } from '../../shared/controller/ApiResponseError';
import { ApiResponseSuccess } from '../../shared/controller/ApiResponseSuccess';
import { appContext } from '../../shared/controller/appContext';
import { categoriaFinanceiraArchiveManyController } from './controllers/categoriaFinanceiraArchiveManyController';
import { categoriaFinanceiraAutocompleteController } from './controllers/categoriaFinanceiraAutocompleteController';
import { categoriaFinanceiraCreateController } from './controllers/categoriaFinanceiraCreateController';
import { categoriaFinanceiraDeleteManyController } from './controllers/categoriaFinanceiraDeleteManyController';
import { categoriaFinanceiraFindController } from './controllers/categoriaFinanceiraFindController';
import { categoriaFinanceiraFindManyController } from './controllers/categoriaFinanceiraFindManyController';
import { categoriaFinanceiraImporterController } from './controllers/categoriaFinanceiraImporterController';
import { categoriaFinanceiraRestoreManyController } from './controllers/categoriaFinanceiraRestoreManyController';
import { categoriaFinanceiraUpdateController } from './controllers/categoriaFinanceiraUpdateController';
import { parseHonoQuery } from '../../shared/lib/parseHonoQuery';

export const categoriaFinanceiraRoutes = new Hono();

categoriaFinanceiraRoutes.get('/', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const query = parseHonoQuery(c.req.query());
    const payload = await categoriaFinanceiraFindManyController(query, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

categoriaFinanceiraRoutes.get('/autocomplete', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const query = parseHonoQuery(c.req.query());
    const payload = await categoriaFinanceiraAutocompleteController(
      query,
      context,
    );
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

categoriaFinanceiraRoutes.post('/', async (c) => {
  let context;
  try {
    const body = await c.req.json();
    context = await appContext(c);
    const payload = await categoriaFinanceiraCreateController(body, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

categoriaFinanceiraRoutes.post('/importer', async (c) => {
  let context;
  try {
    const body = await c.req.json();
    context = await appContext(c);
    const payload = await categoriaFinanceiraImporterController(body, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

categoriaFinanceiraRoutes.put('/archive', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const body = await c.req.json();
    await categoriaFinanceiraArchiveManyController(body, context);
    const payload = true;
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

categoriaFinanceiraRoutes.put('/restore', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const body = await c.req.json();
    await categoriaFinanceiraRestoreManyController(body, context);
    const payload = true;
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

categoriaFinanceiraRoutes.delete('/', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const query = parseHonoQuery(c.req.query());
    await categoriaFinanceiraDeleteManyController(query, context);
    const payload = true;
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

categoriaFinanceiraRoutes.get('/:id', async (c) => {
  let context;
  try {
    const id = c.req.param('id');
    context = await appContext(c);
    const payload = await categoriaFinanceiraFindController({ id }, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

categoriaFinanceiraRoutes.put('/:id', async (c) => {
  let context;
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    context = await appContext(c);
    const payload = await categoriaFinanceiraUpdateController(
      { id },
      body,
      context,
    );
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});
