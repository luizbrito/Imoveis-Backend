import { Hono } from 'hono';
import { ApiResponseError } from '../../shared/controller/ApiResponseError';
import { ApiResponseSuccess } from '../../shared/controller/ApiResponseSuccess';
import { appContext } from '../../shared/controller/appContext';
import { dueDiligenceRuralArchiveManyController } from './controllers/dueDiligenceRuralArchiveManyController';
import { dueDiligenceRuralAutocompleteController } from './controllers/dueDiligenceRuralAutocompleteController';
import { dueDiligenceRuralCreateController } from './controllers/dueDiligenceRuralCreateController';
import { dueDiligenceRuralDeleteManyController } from './controllers/dueDiligenceRuralDeleteManyController';
import { dueDiligenceRuralFindController } from './controllers/dueDiligenceRuralFindController';
import { dueDiligenceRuralFindManyController } from './controllers/dueDiligenceRuralFindManyController';
import { dueDiligenceRuralImporterController } from './controllers/dueDiligenceRuralImporterController';
import { dueDiligenceRuralRestoreManyController } from './controllers/dueDiligenceRuralRestoreManyController';
import { dueDiligenceRuralUpdateController } from './controllers/dueDiligenceRuralUpdateController';
import { parseHonoQuery } from '../../shared/lib/parseHonoQuery';

export const dueDiligenceRuralRoutes = new Hono();

dueDiligenceRuralRoutes.get('/', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const query = parseHonoQuery(c.req.query());
    const payload = await dueDiligenceRuralFindManyController(query, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

dueDiligenceRuralRoutes.get('/autocomplete', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const query = parseHonoQuery(c.req.query());
    const payload = await dueDiligenceRuralAutocompleteController(
      query,
      context,
    );
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

dueDiligenceRuralRoutes.post('/', async (c) => {
  let context;
  try {
    const body = await c.req.json();
    context = await appContext(c);
    const payload = await dueDiligenceRuralCreateController(body, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

dueDiligenceRuralRoutes.post('/importer', async (c) => {
  let context;
  try {
    const body = await c.req.json();
    context = await appContext(c);
    const payload = await dueDiligenceRuralImporterController(body, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

dueDiligenceRuralRoutes.put('/archive', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const body = await c.req.json();
    await dueDiligenceRuralArchiveManyController(body, context);
    const payload = true;
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

dueDiligenceRuralRoutes.put('/restore', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const body = await c.req.json();
    await dueDiligenceRuralRestoreManyController(body, context);
    const payload = true;
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

dueDiligenceRuralRoutes.delete('/', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const query = parseHonoQuery(c.req.query());
    await dueDiligenceRuralDeleteManyController(query, context);
    const payload = true;
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

dueDiligenceRuralRoutes.get('/:id', async (c) => {
  let context;
  try {
    const id = c.req.param('id');
    context = await appContext(c);
    const payload = await dueDiligenceRuralFindController({ id }, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

dueDiligenceRuralRoutes.put('/:id', async (c) => {
  let context;
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    context = await appContext(c);
    const payload = await dueDiligenceRuralUpdateController(
      { id },
      body,
      context,
    );
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});
