import { Hono } from 'hono';
import { ApiResponseError } from '../../shared/controller/ApiResponseError';
import { ApiResponseSuccess } from '../../shared/controller/ApiResponseSuccess';
import { appContext } from '../../shared/controller/appContext';
import { anuncioArchiveManyController } from './controllers/anuncioArchiveManyController';
import { anuncioAutocompleteController } from './controllers/anuncioAutocompleteController';
import { anuncioCreateController } from './controllers/anuncioCreateController';
import { anuncioDeleteManyController } from './controllers/anuncioDeleteManyController';
import { anuncioFindController } from './controllers/anuncioFindController';
import { anuncioFindManyController } from './controllers/anuncioFindManyController';
import { anuncioImporterController } from './controllers/anuncioImporterController';
import { anuncioPublicFindManyController } from './controllers/anuncioPublicFindManyController';
import { anuncioPublicGetController } from './controllers/anuncioPublicGetController';
import { anuncioRestoreManyController } from './controllers/anuncioRestoreManyController';
import { anuncioUpdateController } from './controllers/anuncioUpdateController';
import { parseHonoQuery } from '../../shared/lib/parseHonoQuery';

export const anuncioRoutes = new Hono();

anuncioRoutes.get('/public', async (c) => {
  try {
    return c.json(await anuncioPublicFindManyController(c));
  } catch (error) {
    return c.json({ error: 'Unable to load public listings' }, 500);
  }
});

anuncioRoutes.get('/public/:slug', async (c) => {
  try {
    const payload = await anuncioPublicGetController(c);
    if (payload == null) {
      return c.json({ error: 'Property not found' }, 404);
    }
    return c.json(payload);
  } catch (error) {
    return c.json({ error: 'Unable to load property' }, 500);
  }
});

anuncioRoutes.get('/', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const query = parseHonoQuery(c.req.query());
    const payload = await anuncioFindManyController(query, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

anuncioRoutes.get('/autocomplete', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const query = parseHonoQuery(c.req.query());
    const payload = await anuncioAutocompleteController(query, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

anuncioRoutes.post('/', async (c) => {
  let context;
  try {
    const body = await c.req.json();
    context = await appContext(c);
    const payload = await anuncioCreateController(body, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

anuncioRoutes.post('/importer', async (c) => {
  let context;
  try {
    const body = await c.req.json();
    context = await appContext(c);
    const payload = await anuncioImporterController(body, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

anuncioRoutes.put('/archive', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const body = await c.req.json();
    await anuncioArchiveManyController(body, context);
    const payload = true;
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

anuncioRoutes.put('/restore', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const body = await c.req.json();
    await anuncioRestoreManyController(body, context);
    const payload = true;
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

anuncioRoutes.delete('/', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const query = parseHonoQuery(c.req.query());
    await anuncioDeleteManyController(query, context);
    const payload = true;
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

anuncioRoutes.get('/:id', async (c) => {
  let context;
  try {
    const id = c.req.param('id');
    context = await appContext(c);
    const payload = await anuncioFindController({ id }, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

anuncioRoutes.put('/:id', async (c) => {
  let context;
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    context = await appContext(c);
    const payload = await anuncioUpdateController({ id }, body, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});
