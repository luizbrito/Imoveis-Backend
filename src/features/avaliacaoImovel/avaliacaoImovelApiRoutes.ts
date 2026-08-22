import { Hono } from 'hono';
import { ApiResponseError } from '../../shared/controller/ApiResponseError';
import { ApiResponseSuccess } from '../../shared/controller/ApiResponseSuccess';
import { appContext } from '../../shared/controller/appContext';
import { avaliacaoImovelArchiveManyController } from './controllers/avaliacaoImovelArchiveManyController';
import { avaliacaoImovelAutocompleteController } from './controllers/avaliacaoImovelAutocompleteController';
import { avaliacaoImovelCreateController } from './controllers/avaliacaoImovelCreateController';
import { avaliacaoImovelDeleteManyController } from './controllers/avaliacaoImovelDeleteManyController';
import { avaliacaoImovelFindController } from './controllers/avaliacaoImovelFindController';
import { avaliacaoImovelFindManyController } from './controllers/avaliacaoImovelFindManyController';
import { avaliacaoImovelImporterController } from './controllers/avaliacaoImovelImporterController';
import { avaliacaoImovelRestoreManyController } from './controllers/avaliacaoImovelRestoreManyController';
import { avaliacaoImovelUpdateController } from './controllers/avaliacaoImovelUpdateController';
import { parseHonoQuery } from '../../shared/lib/parseHonoQuery';

export const avaliacaoImovelRoutes = new Hono();

avaliacaoImovelRoutes.get('/', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const query = parseHonoQuery(c.req.query());
    const payload = await avaliacaoImovelFindManyController(query, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

avaliacaoImovelRoutes.get('/autocomplete', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const query = parseHonoQuery(c.req.query());
    const payload = await avaliacaoImovelAutocompleteController(query, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

avaliacaoImovelRoutes.post('/', async (c) => {
  let context;
  try {
    const body = await c.req.json();
    context = await appContext(c);
    const payload = await avaliacaoImovelCreateController(body, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

avaliacaoImovelRoutes.post('/importer', async (c) => {
  let context;
  try {
    const body = await c.req.json();
    context = await appContext(c);
    const payload = await avaliacaoImovelImporterController(body, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

avaliacaoImovelRoutes.put('/archive', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const body = await c.req.json();
    await avaliacaoImovelArchiveManyController(body, context);
    const payload = true;
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

avaliacaoImovelRoutes.put('/restore', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const body = await c.req.json();
    await avaliacaoImovelRestoreManyController(body, context);
    const payload = true;
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

avaliacaoImovelRoutes.delete('/', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const query = parseHonoQuery(c.req.query());
    await avaliacaoImovelDeleteManyController(query, context);
    const payload = true;
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

avaliacaoImovelRoutes.get('/:id', async (c) => {
  let context;
  try {
    const id = c.req.param('id');
    context = await appContext(c);
    const payload = await avaliacaoImovelFindController({ id }, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

avaliacaoImovelRoutes.put('/:id', async (c) => {
  let context;
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    context = await appContext(c);
    const payload = await avaliacaoImovelUpdateController(
      { id },
      body,
      context,
    );
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});
