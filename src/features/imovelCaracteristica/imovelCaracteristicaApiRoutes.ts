import { Hono } from 'hono';
import { ApiResponseError } from '../../shared/controller/ApiResponseError';
import { ApiResponseSuccess } from '../../shared/controller/ApiResponseSuccess';
import { appContext } from '../../shared/controller/appContext';
import { imovelCaracteristicaArchiveManyController } from './controllers/imovelCaracteristicaArchiveManyController';
import { imovelCaracteristicaAutocompleteController } from './controllers/imovelCaracteristicaAutocompleteController';
import { imovelCaracteristicaCreateController } from './controllers/imovelCaracteristicaCreateController';
import { imovelCaracteristicaDeleteManyController } from './controllers/imovelCaracteristicaDeleteManyController';
import { imovelCaracteristicaFindController } from './controllers/imovelCaracteristicaFindController';
import { imovelCaracteristicaFindManyController } from './controllers/imovelCaracteristicaFindManyController';
import { imovelCaracteristicaImporterController } from './controllers/imovelCaracteristicaImporterController';
import { imovelCaracteristicaRestoreManyController } from './controllers/imovelCaracteristicaRestoreManyController';
import { imovelCaracteristicaUpdateController } from './controllers/imovelCaracteristicaUpdateController';
import { parseHonoQuery } from '../../shared/lib/parseHonoQuery';

export const imovelCaracteristicaRoutes = new Hono();

imovelCaracteristicaRoutes.get('/', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const query = parseHonoQuery(c.req.query());
    const payload = await imovelCaracteristicaFindManyController(
      query,
      context,
    );
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

imovelCaracteristicaRoutes.get('/autocomplete', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const query = parseHonoQuery(c.req.query());
    const payload = await imovelCaracteristicaAutocompleteController(
      query,
      context,
    );
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

imovelCaracteristicaRoutes.post('/', async (c) => {
  let context;
  try {
    const body = await c.req.json();
    context = await appContext(c);
    const payload = await imovelCaracteristicaCreateController(body, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

imovelCaracteristicaRoutes.post('/importer', async (c) => {
  let context;
  try {
    const body = await c.req.json();
    context = await appContext(c);
    const payload = await imovelCaracteristicaImporterController(body, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

imovelCaracteristicaRoutes.put('/archive', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const body = await c.req.json();
    await imovelCaracteristicaArchiveManyController(body, context);
    const payload = true;
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

imovelCaracteristicaRoutes.put('/restore', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const body = await c.req.json();
    await imovelCaracteristicaRestoreManyController(body, context);
    const payload = true;
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

imovelCaracteristicaRoutes.delete('/', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const query = parseHonoQuery(c.req.query());
    await imovelCaracteristicaDeleteManyController(query, context);
    const payload = true;
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

imovelCaracteristicaRoutes.get('/:id', async (c) => {
  let context;
  try {
    const id = c.req.param('id');
    context = await appContext(c);
    const payload = await imovelCaracteristicaFindController({ id }, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

imovelCaracteristicaRoutes.put('/:id', async (c) => {
  let context;
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    context = await appContext(c);
    const payload = await imovelCaracteristicaUpdateController(
      { id },
      body,
      context,
    );
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});
