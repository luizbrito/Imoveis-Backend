import { Hono } from 'hono';
import { ApiResponseError } from '../../shared/controller/ApiResponseError';
import { ApiResponseSuccess } from '../../shared/controller/ApiResponseSuccess';
import { appContext } from '../../shared/controller/appContext';
import { sistemaProdutivoRuralArchiveManyController } from './controllers/sistemaProdutivoRuralArchiveManyController';
import { sistemaProdutivoRuralAutocompleteController } from './controllers/sistemaProdutivoRuralAutocompleteController';
import { sistemaProdutivoRuralCreateController } from './controllers/sistemaProdutivoRuralCreateController';
import { sistemaProdutivoRuralDeleteManyController } from './controllers/sistemaProdutivoRuralDeleteManyController';
import { sistemaProdutivoRuralFindController } from './controllers/sistemaProdutivoRuralFindController';
import { sistemaProdutivoRuralFindManyController } from './controllers/sistemaProdutivoRuralFindManyController';
import { sistemaProdutivoRuralImporterController } from './controllers/sistemaProdutivoRuralImporterController';
import { sistemaProdutivoRuralRestoreManyController } from './controllers/sistemaProdutivoRuralRestoreManyController';
import { sistemaProdutivoRuralUpdateController } from './controllers/sistemaProdutivoRuralUpdateController';
import { parseHonoQuery } from '../../shared/lib/parseHonoQuery';

export const sistemaProdutivoRuralRoutes = new Hono();

sistemaProdutivoRuralRoutes.get('/', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const query = parseHonoQuery(c.req.query());
    const payload = await sistemaProdutivoRuralFindManyController(
      query,
      context,
    );
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

sistemaProdutivoRuralRoutes.get('/autocomplete', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const query = parseHonoQuery(c.req.query());
    const payload = await sistemaProdutivoRuralAutocompleteController(
      query,
      context,
    );
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

sistemaProdutivoRuralRoutes.post('/', async (c) => {
  let context;
  try {
    const body = await c.req.json();
    context = await appContext(c);
    const payload = await sistemaProdutivoRuralCreateController(body, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

sistemaProdutivoRuralRoutes.post('/importer', async (c) => {
  let context;
  try {
    const body = await c.req.json();
    context = await appContext(c);
    const payload = await sistemaProdutivoRuralImporterController(
      body,
      context,
    );
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

sistemaProdutivoRuralRoutes.put('/archive', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const body = await c.req.json();
    await sistemaProdutivoRuralArchiveManyController(body, context);
    const payload = true;
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

sistemaProdutivoRuralRoutes.put('/restore', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const body = await c.req.json();
    await sistemaProdutivoRuralRestoreManyController(body, context);
    const payload = true;
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

sistemaProdutivoRuralRoutes.delete('/', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const query = parseHonoQuery(c.req.query());
    await sistemaProdutivoRuralDeleteManyController(query, context);
    const payload = true;
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

sistemaProdutivoRuralRoutes.get('/:id', async (c) => {
  let context;
  try {
    const id = c.req.param('id');
    context = await appContext(c);
    const payload = await sistemaProdutivoRuralFindController({ id }, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

sistemaProdutivoRuralRoutes.put('/:id', async (c) => {
  let context;
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    context = await appContext(c);
    const payload = await sistemaProdutivoRuralUpdateController(
      { id },
      body,
      context,
    );
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});
