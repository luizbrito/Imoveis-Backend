import { Hono } from 'hono';
import { ApiResponseError } from '../../shared/controller/ApiResponseError';
import { ApiResponseSuccess } from '../../shared/controller/ApiResponseSuccess';
import { appContext } from '../../shared/controller/appContext';
import { condicaoComercialRuralArchiveManyController } from './controllers/condicaoComercialRuralArchiveManyController';
import { condicaoComercialRuralAutocompleteController } from './controllers/condicaoComercialRuralAutocompleteController';
import { condicaoComercialRuralCreateController } from './controllers/condicaoComercialRuralCreateController';
import { condicaoComercialRuralDeleteManyController } from './controllers/condicaoComercialRuralDeleteManyController';
import { condicaoComercialRuralFindController } from './controllers/condicaoComercialRuralFindController';
import { condicaoComercialRuralFindManyController } from './controllers/condicaoComercialRuralFindManyController';
import { condicaoComercialRuralImporterController } from './controllers/condicaoComercialRuralImporterController';
import { condicaoComercialRuralRestoreManyController } from './controllers/condicaoComercialRuralRestoreManyController';
import { condicaoComercialRuralUpdateController } from './controllers/condicaoComercialRuralUpdateController';
import { parseHonoQuery } from '../../shared/lib/parseHonoQuery';

export const condicaoComercialRuralRoutes = new Hono();

condicaoComercialRuralRoutes.get('/', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const query = parseHonoQuery(c.req.query());
    const payload = await condicaoComercialRuralFindManyController(
      query,
      context,
    );
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

condicaoComercialRuralRoutes.get('/autocomplete', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const query = parseHonoQuery(c.req.query());
    const payload = await condicaoComercialRuralAutocompleteController(
      query,
      context,
    );
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

condicaoComercialRuralRoutes.post('/', async (c) => {
  let context;
  try {
    const body = await c.req.json();
    context = await appContext(c);
    const payload = await condicaoComercialRuralCreateController(body, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

condicaoComercialRuralRoutes.post('/importer', async (c) => {
  let context;
  try {
    const body = await c.req.json();
    context = await appContext(c);
    const payload = await condicaoComercialRuralImporterController(
      body,
      context,
    );
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

condicaoComercialRuralRoutes.put('/archive', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const body = await c.req.json();
    await condicaoComercialRuralArchiveManyController(body, context);
    const payload = true;
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

condicaoComercialRuralRoutes.put('/restore', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const body = await c.req.json();
    await condicaoComercialRuralRestoreManyController(body, context);
    const payload = true;
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

condicaoComercialRuralRoutes.delete('/', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const query = parseHonoQuery(c.req.query());
    await condicaoComercialRuralDeleteManyController(query, context);
    const payload = true;
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

condicaoComercialRuralRoutes.get('/:id', async (c) => {
  let context;
  try {
    const id = c.req.param('id');
    context = await appContext(c);
    const payload = await condicaoComercialRuralFindController({ id }, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

condicaoComercialRuralRoutes.put('/:id', async (c) => {
  let context;
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    context = await appContext(c);
    const payload = await condicaoComercialRuralUpdateController(
      { id },
      body,
      context,
    );
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});
