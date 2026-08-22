import { Hono } from 'hono';
import { ApiResponseError } from '../../shared/controller/ApiResponseError';
import { ApiResponseSuccess } from '../../shared/controller/ApiResponseSuccess';
import { appContext } from '../../shared/controller/appContext';
import { campanhaAnuncioArchiveManyController } from './controllers/campanhaAnuncioArchiveManyController';
import { campanhaAnuncioAutocompleteController } from './controllers/campanhaAnuncioAutocompleteController';
import { campanhaAnuncioCreateController } from './controllers/campanhaAnuncioCreateController';
import { campanhaAnuncioDeleteManyController } from './controllers/campanhaAnuncioDeleteManyController';
import { campanhaAnuncioFindController } from './controllers/campanhaAnuncioFindController';
import { campanhaAnuncioFindManyController } from './controllers/campanhaAnuncioFindManyController';
import { campanhaAnuncioImporterController } from './controllers/campanhaAnuncioImporterController';
import { campanhaAnuncioRestoreManyController } from './controllers/campanhaAnuncioRestoreManyController';
import { campanhaAnuncioUpdateController } from './controllers/campanhaAnuncioUpdateController';
import { parseHonoQuery } from '../../shared/lib/parseHonoQuery';

export const campanhaAnuncioRoutes = new Hono();

campanhaAnuncioRoutes.get('/', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const query = parseHonoQuery(c.req.query());
    const payload = await campanhaAnuncioFindManyController(query, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

campanhaAnuncioRoutes.get('/autocomplete', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const query = parseHonoQuery(c.req.query());
    const payload = await campanhaAnuncioAutocompleteController(query, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

campanhaAnuncioRoutes.post('/', async (c) => {
  let context;
  try {
    const body = await c.req.json();
    context = await appContext(c);
    const payload = await campanhaAnuncioCreateController(body, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

campanhaAnuncioRoutes.post('/importer', async (c) => {
  let context;
  try {
    const body = await c.req.json();
    context = await appContext(c);
    const payload = await campanhaAnuncioImporterController(body, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

campanhaAnuncioRoutes.put('/archive', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const body = await c.req.json();
    await campanhaAnuncioArchiveManyController(body, context);
    const payload = true;
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

campanhaAnuncioRoutes.put('/restore', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const body = await c.req.json();
    await campanhaAnuncioRestoreManyController(body, context);
    const payload = true;
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

campanhaAnuncioRoutes.delete('/', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const query = parseHonoQuery(c.req.query());
    await campanhaAnuncioDeleteManyController(query, context);
    const payload = true;
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

campanhaAnuncioRoutes.get('/:id', async (c) => {
  let context;
  try {
    const id = c.req.param('id');
    context = await appContext(c);
    const payload = await campanhaAnuncioFindController({ id }, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

campanhaAnuncioRoutes.put('/:id', async (c) => {
  let context;
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    context = await appContext(c);
    const payload = await campanhaAnuncioUpdateController(
      { id },
      body,
      context,
    );
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});
