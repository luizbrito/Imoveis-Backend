import { Hono } from 'hono';
import { ApiResponseError } from '../../shared/controller/ApiResponseError';
import { ApiResponseSuccess } from '../../shared/controller/ApiResponseSuccess';
import { appContext } from '../../shared/controller/appContext';
import { garantiaLocacaoArchiveManyController } from './controllers/garantiaLocacaoArchiveManyController';
import { garantiaLocacaoAutocompleteController } from './controllers/garantiaLocacaoAutocompleteController';
import { garantiaLocacaoCreateController } from './controllers/garantiaLocacaoCreateController';
import { garantiaLocacaoDeleteManyController } from './controllers/garantiaLocacaoDeleteManyController';
import { garantiaLocacaoFindController } from './controllers/garantiaLocacaoFindController';
import { garantiaLocacaoFindManyController } from './controllers/garantiaLocacaoFindManyController';
import { garantiaLocacaoImporterController } from './controllers/garantiaLocacaoImporterController';
import { garantiaLocacaoRestoreManyController } from './controllers/garantiaLocacaoRestoreManyController';
import { garantiaLocacaoUpdateController } from './controllers/garantiaLocacaoUpdateController';
import { parseHonoQuery } from '../../shared/lib/parseHonoQuery';

export const garantiaLocacaoRoutes = new Hono();

garantiaLocacaoRoutes.get('/', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const query = parseHonoQuery(c.req.query());
    const payload = await garantiaLocacaoFindManyController(query, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

garantiaLocacaoRoutes.get('/autocomplete', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const query = parseHonoQuery(c.req.query());
    const payload = await garantiaLocacaoAutocompleteController(query, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

garantiaLocacaoRoutes.post('/', async (c) => {
  let context;
  try {
    const body = await c.req.json();
    context = await appContext(c);
    const payload = await garantiaLocacaoCreateController(body, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

garantiaLocacaoRoutes.post('/importer', async (c) => {
  let context;
  try {
    const body = await c.req.json();
    context = await appContext(c);
    const payload = await garantiaLocacaoImporterController(body, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

garantiaLocacaoRoutes.put('/archive', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const body = await c.req.json();
    await garantiaLocacaoArchiveManyController(body, context);
    const payload = true;
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

garantiaLocacaoRoutes.put('/restore', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const body = await c.req.json();
    await garantiaLocacaoRestoreManyController(body, context);
    const payload = true;
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

garantiaLocacaoRoutes.delete('/', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const query = parseHonoQuery(c.req.query());
    await garantiaLocacaoDeleteManyController(query, context);
    const payload = true;
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

garantiaLocacaoRoutes.get('/:id', async (c) => {
  let context;
  try {
    const id = c.req.param('id');
    context = await appContext(c);
    const payload = await garantiaLocacaoFindController({ id }, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

garantiaLocacaoRoutes.put('/:id', async (c) => {
  let context;
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    context = await appContext(c);
    const payload = await garantiaLocacaoUpdateController(
      { id },
      body,
      context,
    );
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});
