import { Hono } from 'hono';
import { ApiResponseError } from '../../shared/controller/ApiResponseError';
import { ApiResponseSuccess } from '../../shared/controller/ApiResponseSuccess';
import { appContext } from '../../shared/controller/appContext';
import { referenciaClimaticaRuralArchiveManyController } from './controllers/referenciaClimaticaRuralArchiveManyController';
import { referenciaClimaticaRuralAutocompleteController } from './controllers/referenciaClimaticaRuralAutocompleteController';
import { referenciaClimaticaRuralCreateController } from './controllers/referenciaClimaticaRuralCreateController';
import { referenciaClimaticaRuralDeleteManyController } from './controllers/referenciaClimaticaRuralDeleteManyController';
import { referenciaClimaticaRuralFindController } from './controllers/referenciaClimaticaRuralFindController';
import { referenciaClimaticaRuralFindManyController } from './controllers/referenciaClimaticaRuralFindManyController';
import { referenciaClimaticaRuralImporterController } from './controllers/referenciaClimaticaRuralImporterController';
import { referenciaClimaticaRuralRestoreManyController } from './controllers/referenciaClimaticaRuralRestoreManyController';
import { referenciaClimaticaRuralUpdateController } from './controllers/referenciaClimaticaRuralUpdateController';
import { parseHonoQuery } from '../../shared/lib/parseHonoQuery';

export const referenciaClimaticaRuralRoutes = new Hono();

referenciaClimaticaRuralRoutes.get('/', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const query = parseHonoQuery(c.req.query());
    const payload = await referenciaClimaticaRuralFindManyController(
      query,
      context,
    );
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

referenciaClimaticaRuralRoutes.get('/autocomplete', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const query = parseHonoQuery(c.req.query());
    const payload = await referenciaClimaticaRuralAutocompleteController(
      query,
      context,
    );
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

referenciaClimaticaRuralRoutes.post('/', async (c) => {
  let context;
  try {
    const body = await c.req.json();
    context = await appContext(c);
    const payload = await referenciaClimaticaRuralCreateController(
      body,
      context,
    );
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

referenciaClimaticaRuralRoutes.post('/importer', async (c) => {
  let context;
  try {
    const body = await c.req.json();
    context = await appContext(c);
    const payload = await referenciaClimaticaRuralImporterController(
      body,
      context,
    );
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

referenciaClimaticaRuralRoutes.put('/archive', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const body = await c.req.json();
    await referenciaClimaticaRuralArchiveManyController(body, context);
    const payload = true;
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

referenciaClimaticaRuralRoutes.put('/restore', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const body = await c.req.json();
    await referenciaClimaticaRuralRestoreManyController(body, context);
    const payload = true;
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

referenciaClimaticaRuralRoutes.delete('/', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const query = parseHonoQuery(c.req.query());
    await referenciaClimaticaRuralDeleteManyController(query, context);
    const payload = true;
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

referenciaClimaticaRuralRoutes.get('/:id', async (c) => {
  let context;
  try {
    const id = c.req.param('id');
    context = await appContext(c);
    const payload = await referenciaClimaticaRuralFindController(
      { id },
      context,
    );
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

referenciaClimaticaRuralRoutes.put('/:id', async (c) => {
  let context;
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    context = await appContext(c);
    const payload = await referenciaClimaticaRuralUpdateController(
      { id },
      body,
      context,
    );
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});
