import { Hono } from 'hono';
import { ApiResponseError } from '../../shared/controller/ApiResponseError';
import { ApiResponseSuccess } from '../../shared/controller/ApiResponseSuccess';
import { appContext } from '../../shared/controller/appContext';
import { ocorrenciaImovelArchiveManyController } from './controllers/ocorrenciaImovelArchiveManyController';
import { ocorrenciaImovelAutocompleteController } from './controllers/ocorrenciaImovelAutocompleteController';
import { ocorrenciaImovelCreateController } from './controllers/ocorrenciaImovelCreateController';
import { ocorrenciaImovelDeleteManyController } from './controllers/ocorrenciaImovelDeleteManyController';
import { ocorrenciaImovelFindController } from './controllers/ocorrenciaImovelFindController';
import { ocorrenciaImovelFindManyController } from './controllers/ocorrenciaImovelFindManyController';
import { ocorrenciaImovelImporterController } from './controllers/ocorrenciaImovelImporterController';
import { ocorrenciaImovelRestoreManyController } from './controllers/ocorrenciaImovelRestoreManyController';
import { ocorrenciaImovelUpdateController } from './controllers/ocorrenciaImovelUpdateController';
import { parseHonoQuery } from '../../shared/lib/parseHonoQuery';

export const ocorrenciaImovelRoutes = new Hono();

ocorrenciaImovelRoutes.get('/', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const query = parseHonoQuery(c.req.query());
    const payload = await ocorrenciaImovelFindManyController(query, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

ocorrenciaImovelRoutes.get('/autocomplete', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const query = parseHonoQuery(c.req.query());
    const payload = await ocorrenciaImovelAutocompleteController(
      query,
      context,
    );
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

ocorrenciaImovelRoutes.post('/', async (c) => {
  let context;
  try {
    const body = await c.req.json();
    context = await appContext(c);
    const payload = await ocorrenciaImovelCreateController(body, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

ocorrenciaImovelRoutes.post('/importer', async (c) => {
  let context;
  try {
    const body = await c.req.json();
    context = await appContext(c);
    const payload = await ocorrenciaImovelImporterController(body, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

ocorrenciaImovelRoutes.put('/archive', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const body = await c.req.json();
    await ocorrenciaImovelArchiveManyController(body, context);
    const payload = true;
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

ocorrenciaImovelRoutes.put('/restore', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const body = await c.req.json();
    await ocorrenciaImovelRestoreManyController(body, context);
    const payload = true;
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

ocorrenciaImovelRoutes.delete('/', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const query = parseHonoQuery(c.req.query());
    await ocorrenciaImovelDeleteManyController(query, context);
    const payload = true;
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

ocorrenciaImovelRoutes.get('/:id', async (c) => {
  let context;
  try {
    const id = c.req.param('id');
    context = await appContext(c);
    const payload = await ocorrenciaImovelFindController({ id }, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

ocorrenciaImovelRoutes.put('/:id', async (c) => {
  let context;
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    context = await appContext(c);
    const payload = await ocorrenciaImovelUpdateController(
      { id },
      body,
      context,
    );
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});
