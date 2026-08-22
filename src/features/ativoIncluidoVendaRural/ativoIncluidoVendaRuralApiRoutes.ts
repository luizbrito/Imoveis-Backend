import { Hono } from 'hono';
import { ApiResponseError } from '../../shared/controller/ApiResponseError';
import { ApiResponseSuccess } from '../../shared/controller/ApiResponseSuccess';
import { appContext } from '../../shared/controller/appContext';
import { ativoIncluidoVendaRuralArchiveManyController } from './controllers/ativoIncluidoVendaRuralArchiveManyController';
import { ativoIncluidoVendaRuralAutocompleteController } from './controllers/ativoIncluidoVendaRuralAutocompleteController';
import { ativoIncluidoVendaRuralCreateController } from './controllers/ativoIncluidoVendaRuralCreateController';
import { ativoIncluidoVendaRuralDeleteManyController } from './controllers/ativoIncluidoVendaRuralDeleteManyController';
import { ativoIncluidoVendaRuralFindController } from './controllers/ativoIncluidoVendaRuralFindController';
import { ativoIncluidoVendaRuralFindManyController } from './controllers/ativoIncluidoVendaRuralFindManyController';
import { ativoIncluidoVendaRuralImporterController } from './controllers/ativoIncluidoVendaRuralImporterController';
import { ativoIncluidoVendaRuralRestoreManyController } from './controllers/ativoIncluidoVendaRuralRestoreManyController';
import { ativoIncluidoVendaRuralUpdateController } from './controllers/ativoIncluidoVendaRuralUpdateController';
import { parseHonoQuery } from '../../shared/lib/parseHonoQuery';

export const ativoIncluidoVendaRuralRoutes = new Hono();

ativoIncluidoVendaRuralRoutes.get('/', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const query = parseHonoQuery(c.req.query());
    const payload = await ativoIncluidoVendaRuralFindManyController(
      query,
      context,
    );
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

ativoIncluidoVendaRuralRoutes.get('/autocomplete', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const query = parseHonoQuery(c.req.query());
    const payload = await ativoIncluidoVendaRuralAutocompleteController(
      query,
      context,
    );
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

ativoIncluidoVendaRuralRoutes.post('/', async (c) => {
  let context;
  try {
    const body = await c.req.json();
    context = await appContext(c);
    const payload = await ativoIncluidoVendaRuralCreateController(
      body,
      context,
    );
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

ativoIncluidoVendaRuralRoutes.post('/importer', async (c) => {
  let context;
  try {
    const body = await c.req.json();
    context = await appContext(c);
    const payload = await ativoIncluidoVendaRuralImporterController(
      body,
      context,
    );
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

ativoIncluidoVendaRuralRoutes.put('/archive', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const body = await c.req.json();
    await ativoIncluidoVendaRuralArchiveManyController(body, context);
    const payload = true;
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

ativoIncluidoVendaRuralRoutes.put('/restore', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const body = await c.req.json();
    await ativoIncluidoVendaRuralRestoreManyController(body, context);
    const payload = true;
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

ativoIncluidoVendaRuralRoutes.delete('/', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const query = parseHonoQuery(c.req.query());
    await ativoIncluidoVendaRuralDeleteManyController(query, context);
    const payload = true;
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

ativoIncluidoVendaRuralRoutes.get('/:id', async (c) => {
  let context;
  try {
    const id = c.req.param('id');
    context = await appContext(c);
    const payload = await ativoIncluidoVendaRuralFindController(
      { id },
      context,
    );
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

ativoIncluidoVendaRuralRoutes.put('/:id', async (c) => {
  let context;
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    context = await appContext(c);
    const payload = await ativoIncluidoVendaRuralUpdateController(
      { id },
      body,
      context,
    );
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});
