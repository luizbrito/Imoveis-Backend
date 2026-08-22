import { Hono } from 'hono';
import { ApiResponseError } from '../../shared/controller/ApiResponseError';
import { ApiResponseSuccess } from '../../shared/controller/ApiResponseSuccess';
import { appContext } from '../../shared/controller/appContext';
import { recursoHidricoRuralArchiveManyController } from './controllers/recursoHidricoRuralArchiveManyController';
import { recursoHidricoRuralAutocompleteController } from './controllers/recursoHidricoRuralAutocompleteController';
import { recursoHidricoRuralCreateController } from './controllers/recursoHidricoRuralCreateController';
import { recursoHidricoRuralDeleteManyController } from './controllers/recursoHidricoRuralDeleteManyController';
import { recursoHidricoRuralFindController } from './controllers/recursoHidricoRuralFindController';
import { recursoHidricoRuralFindManyController } from './controllers/recursoHidricoRuralFindManyController';
import { recursoHidricoRuralImporterController } from './controllers/recursoHidricoRuralImporterController';
import { recursoHidricoRuralRestoreManyController } from './controllers/recursoHidricoRuralRestoreManyController';
import { recursoHidricoRuralUpdateController } from './controllers/recursoHidricoRuralUpdateController';
import { parseHonoQuery } from '../../shared/lib/parseHonoQuery';

export const recursoHidricoRuralRoutes = new Hono();

recursoHidricoRuralRoutes.get('/', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const query = parseHonoQuery(c.req.query());
    const payload = await recursoHidricoRuralFindManyController(query, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

recursoHidricoRuralRoutes.get('/autocomplete', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const query = parseHonoQuery(c.req.query());
    const payload = await recursoHidricoRuralAutocompleteController(
      query,
      context,
    );
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

recursoHidricoRuralRoutes.post('/', async (c) => {
  let context;
  try {
    const body = await c.req.json();
    context = await appContext(c);
    const payload = await recursoHidricoRuralCreateController(body, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

recursoHidricoRuralRoutes.post('/importer', async (c) => {
  let context;
  try {
    const body = await c.req.json();
    context = await appContext(c);
    const payload = await recursoHidricoRuralImporterController(body, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

recursoHidricoRuralRoutes.put('/archive', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const body = await c.req.json();
    await recursoHidricoRuralArchiveManyController(body, context);
    const payload = true;
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

recursoHidricoRuralRoutes.put('/restore', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const body = await c.req.json();
    await recursoHidricoRuralRestoreManyController(body, context);
    const payload = true;
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

recursoHidricoRuralRoutes.delete('/', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const query = parseHonoQuery(c.req.query());
    await recursoHidricoRuralDeleteManyController(query, context);
    const payload = true;
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

recursoHidricoRuralRoutes.get('/:id', async (c) => {
  let context;
  try {
    const id = c.req.param('id');
    context = await appContext(c);
    const payload = await recursoHidricoRuralFindController({ id }, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

recursoHidricoRuralRoutes.put('/:id', async (c) => {
  let context;
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    context = await appContext(c);
    const payload = await recursoHidricoRuralUpdateController(
      { id },
      body,
      context,
    );
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});
