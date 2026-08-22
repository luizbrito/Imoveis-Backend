import { Hono } from 'hono';
import { ApiResponseError } from '../../shared/controller/ApiResponseError';
import { ApiResponseSuccess } from '../../shared/controller/ApiResponseSuccess';
import { appContext } from '../../shared/controller/appContext';
import { consentimentoLGPDArchiveManyController } from './controllers/consentimentoLGPDArchiveManyController';
import { consentimentoLGPDAutocompleteController } from './controllers/consentimentoLGPDAutocompleteController';
import { consentimentoLGPDCreateController } from './controllers/consentimentoLGPDCreateController';
import { consentimentoLGPDDeleteManyController } from './controllers/consentimentoLGPDDeleteManyController';
import { consentimentoLGPDFindController } from './controllers/consentimentoLGPDFindController';
import { consentimentoLGPDFindManyController } from './controllers/consentimentoLGPDFindManyController';
import { consentimentoLGPDImporterController } from './controllers/consentimentoLGPDImporterController';
import { consentimentoLGPDRestoreManyController } from './controllers/consentimentoLGPDRestoreManyController';
import { consentimentoLGPDUpdateController } from './controllers/consentimentoLGPDUpdateController';
import { parseHonoQuery } from '../../shared/lib/parseHonoQuery';

export const consentimentoLGPDRoutes = new Hono();

consentimentoLGPDRoutes.get('/', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const query = parseHonoQuery(c.req.query());
    const payload = await consentimentoLGPDFindManyController(query, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

consentimentoLGPDRoutes.get('/autocomplete', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const query = parseHonoQuery(c.req.query());
    const payload = await consentimentoLGPDAutocompleteController(
      query,
      context,
    );
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

consentimentoLGPDRoutes.post('/', async (c) => {
  let context;
  try {
    const body = await c.req.json();
    context = await appContext(c);
    const payload = await consentimentoLGPDCreateController(body, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

consentimentoLGPDRoutes.post('/importer', async (c) => {
  let context;
  try {
    const body = await c.req.json();
    context = await appContext(c);
    const payload = await consentimentoLGPDImporterController(body, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

consentimentoLGPDRoutes.put('/archive', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const body = await c.req.json();
    await consentimentoLGPDArchiveManyController(body, context);
    const payload = true;
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

consentimentoLGPDRoutes.put('/restore', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const body = await c.req.json();
    await consentimentoLGPDRestoreManyController(body, context);
    const payload = true;
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

consentimentoLGPDRoutes.delete('/', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const query = parseHonoQuery(c.req.query());
    await consentimentoLGPDDeleteManyController(query, context);
    const payload = true;
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

consentimentoLGPDRoutes.get('/:id', async (c) => {
  let context;
  try {
    const id = c.req.param('id');
    context = await appContext(c);
    const payload = await consentimentoLGPDFindController({ id }, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

consentimentoLGPDRoutes.put('/:id', async (c) => {
  let context;
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    context = await appContext(c);
    const payload = await consentimentoLGPDUpdateController(
      { id },
      body,
      context,
    );
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});
