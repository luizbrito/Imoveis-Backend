import { Hono } from 'hono';
import { ApiResponseError } from '../../shared/controller/ApiResponseError';
import { ApiResponseSuccess } from '../../shared/controller/ApiResponseSuccess';
import { appContext } from '../../shared/controller/appContext';
import { solicitacaoContatoArchiveManyController } from './controllers/solicitacaoContatoArchiveManyController';
import { solicitacaoContatoAutocompleteController } from './controllers/solicitacaoContatoAutocompleteController';
import { solicitacaoContatoCreateController } from './controllers/solicitacaoContatoCreateController';
import { solicitacaoContatoDeleteManyController } from './controllers/solicitacaoContatoDeleteManyController';
import { solicitacaoContatoFindController } from './controllers/solicitacaoContatoFindController';
import { solicitacaoContatoFindManyController } from './controllers/solicitacaoContatoFindManyController';
import { solicitacaoContatoImporterController } from './controllers/solicitacaoContatoImporterController';
import { solicitacaoContatoRestoreManyController } from './controllers/solicitacaoContatoRestoreManyController';
import { solicitacaoContatoUpdateController } from './controllers/solicitacaoContatoUpdateController';
import { parseHonoQuery } from '../../shared/lib/parseHonoQuery';

export const solicitacaoContatoRoutes = new Hono();

solicitacaoContatoRoutes.get('/', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const query = parseHonoQuery(c.req.query());
    const payload = await solicitacaoContatoFindManyController(query, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

solicitacaoContatoRoutes.get('/autocomplete', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const query = parseHonoQuery(c.req.query());
    const payload = await solicitacaoContatoAutocompleteController(
      query,
      context,
    );
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

solicitacaoContatoRoutes.post('/', async (c) => {
  let context;
  try {
    const body = await c.req.json();
    context = await appContext(c);
    const payload = await solicitacaoContatoCreateController(body, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

solicitacaoContatoRoutes.post('/importer', async (c) => {
  let context;
  try {
    const body = await c.req.json();
    context = await appContext(c);
    const payload = await solicitacaoContatoImporterController(body, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

solicitacaoContatoRoutes.put('/archive', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const body = await c.req.json();
    await solicitacaoContatoArchiveManyController(body, context);
    const payload = true;
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

solicitacaoContatoRoutes.put('/restore', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const body = await c.req.json();
    await solicitacaoContatoRestoreManyController(body, context);
    const payload = true;
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

solicitacaoContatoRoutes.delete('/', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const query = parseHonoQuery(c.req.query());
    await solicitacaoContatoDeleteManyController(query, context);
    const payload = true;
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

solicitacaoContatoRoutes.get('/:id', async (c) => {
  let context;
  try {
    const id = c.req.param('id');
    context = await appContext(c);
    const payload = await solicitacaoContatoFindController({ id }, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

solicitacaoContatoRoutes.put('/:id', async (c) => {
  let context;
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    context = await appContext(c);
    const payload = await solicitacaoContatoUpdateController(
      { id },
      body,
      context,
    );
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});
