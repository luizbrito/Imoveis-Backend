import { Hono } from 'hono';
import { ApiResponseError } from '../../shared/controller/ApiResponseError';
import { ApiResponseSuccess } from '../../shared/controller/ApiResponseSuccess';
import { appContext } from '../../shared/controller/appContext';
import { restricaoTerritorialRuralArchiveManyController } from './controllers/restricaoTerritorialRuralArchiveManyController';
import { restricaoTerritorialRuralAutocompleteController } from './controllers/restricaoTerritorialRuralAutocompleteController';
import { restricaoTerritorialRuralCreateController } from './controllers/restricaoTerritorialRuralCreateController';
import { restricaoTerritorialRuralDeleteManyController } from './controllers/restricaoTerritorialRuralDeleteManyController';
import { restricaoTerritorialRuralFindController } from './controllers/restricaoTerritorialRuralFindController';
import { restricaoTerritorialRuralFindManyController } from './controllers/restricaoTerritorialRuralFindManyController';
import { restricaoTerritorialRuralImporterController } from './controllers/restricaoTerritorialRuralImporterController';
import { restricaoTerritorialRuralRestoreManyController } from './controllers/restricaoTerritorialRuralRestoreManyController';
import { restricaoTerritorialRuralUpdateController } from './controllers/restricaoTerritorialRuralUpdateController';
import { parseHonoQuery } from '../../shared/lib/parseHonoQuery';

export const restricaoTerritorialRuralRoutes = new Hono();

restricaoTerritorialRuralRoutes.get('/', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const query = parseHonoQuery(c.req.query());
    const payload = await restricaoTerritorialRuralFindManyController(
      query,
      context,
    );
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

restricaoTerritorialRuralRoutes.get('/autocomplete', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const query = parseHonoQuery(c.req.query());
    const payload = await restricaoTerritorialRuralAutocompleteController(
      query,
      context,
    );
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

restricaoTerritorialRuralRoutes.post('/', async (c) => {
  let context;
  try {
    const body = await c.req.json();
    context = await appContext(c);
    const payload = await restricaoTerritorialRuralCreateController(
      body,
      context,
    );
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

restricaoTerritorialRuralRoutes.post('/importer', async (c) => {
  let context;
  try {
    const body = await c.req.json();
    context = await appContext(c);
    const payload = await restricaoTerritorialRuralImporterController(
      body,
      context,
    );
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

restricaoTerritorialRuralRoutes.put('/archive', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const body = await c.req.json();
    await restricaoTerritorialRuralArchiveManyController(body, context);
    const payload = true;
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

restricaoTerritorialRuralRoutes.put('/restore', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const body = await c.req.json();
    await restricaoTerritorialRuralRestoreManyController(body, context);
    const payload = true;
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

restricaoTerritorialRuralRoutes.delete('/', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const query = parseHonoQuery(c.req.query());
    await restricaoTerritorialRuralDeleteManyController(query, context);
    const payload = true;
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

restricaoTerritorialRuralRoutes.get('/:id', async (c) => {
  let context;
  try {
    const id = c.req.param('id');
    context = await appContext(c);
    const payload = await restricaoTerritorialRuralFindController(
      { id },
      context,
    );
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

restricaoTerritorialRuralRoutes.put('/:id', async (c) => {
  let context;
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    context = await appContext(c);
    const payload = await restricaoTerritorialRuralUpdateController(
      { id },
      body,
      context,
    );
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});
