import { Hono } from 'hono';
import { ApiResponseError } from '../../shared/controller/ApiResponseError';
import { ApiResponseSuccess } from '../../shared/controller/ApiResponseSuccess';
import { appContext } from '../../shared/controller/appContext';
import { documentacaoRuralBrasilArchiveManyController } from './controllers/documentacaoRuralBrasilArchiveManyController';
import { documentacaoRuralBrasilAutocompleteController } from './controllers/documentacaoRuralBrasilAutocompleteController';
import { documentacaoRuralBrasilCreateController } from './controllers/documentacaoRuralBrasilCreateController';
import { documentacaoRuralBrasilDeleteManyController } from './controllers/documentacaoRuralBrasilDeleteManyController';
import { documentacaoRuralBrasilFindController } from './controllers/documentacaoRuralBrasilFindController';
import { documentacaoRuralBrasilFindManyController } from './controllers/documentacaoRuralBrasilFindManyController';
import { documentacaoRuralBrasilImporterController } from './controllers/documentacaoRuralBrasilImporterController';
import { documentacaoRuralBrasilRestoreManyController } from './controllers/documentacaoRuralBrasilRestoreManyController';
import { documentacaoRuralBrasilUpdateController } from './controllers/documentacaoRuralBrasilUpdateController';
import { parseHonoQuery } from '../../shared/lib/parseHonoQuery';

export const documentacaoRuralBrasilRoutes = new Hono();

documentacaoRuralBrasilRoutes.get('/', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const query = parseHonoQuery(c.req.query());
    const payload = await documentacaoRuralBrasilFindManyController(
      query,
      context,
    );
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

documentacaoRuralBrasilRoutes.get('/autocomplete', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const query = parseHonoQuery(c.req.query());
    const payload = await documentacaoRuralBrasilAutocompleteController(
      query,
      context,
    );
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

documentacaoRuralBrasilRoutes.post('/', async (c) => {
  let context;
  try {
    const body = await c.req.json();
    context = await appContext(c);
    const payload = await documentacaoRuralBrasilCreateController(
      body,
      context,
    );
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

documentacaoRuralBrasilRoutes.post('/importer', async (c) => {
  let context;
  try {
    const body = await c.req.json();
    context = await appContext(c);
    const payload = await documentacaoRuralBrasilImporterController(
      body,
      context,
    );
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

documentacaoRuralBrasilRoutes.put('/archive', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const body = await c.req.json();
    await documentacaoRuralBrasilArchiveManyController(body, context);
    const payload = true;
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

documentacaoRuralBrasilRoutes.put('/restore', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const body = await c.req.json();
    await documentacaoRuralBrasilRestoreManyController(body, context);
    const payload = true;
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

documentacaoRuralBrasilRoutes.delete('/', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const query = parseHonoQuery(c.req.query());
    await documentacaoRuralBrasilDeleteManyController(query, context);
    const payload = true;
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

documentacaoRuralBrasilRoutes.get('/:id', async (c) => {
  let context;
  try {
    const id = c.req.param('id');
    context = await appContext(c);
    const payload = await documentacaoRuralBrasilFindController(
      { id },
      context,
    );
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

documentacaoRuralBrasilRoutes.put('/:id', async (c) => {
  let context;
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    context = await appContext(c);
    const payload = await documentacaoRuralBrasilUpdateController(
      { id },
      body,
      context,
    );
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});
