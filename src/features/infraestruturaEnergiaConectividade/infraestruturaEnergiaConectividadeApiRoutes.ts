import { Hono } from 'hono';
import { ApiResponseError } from '../../shared/controller/ApiResponseError';
import { ApiResponseSuccess } from '../../shared/controller/ApiResponseSuccess';
import { appContext } from '../../shared/controller/appContext';
import { infraestruturaEnergiaConectividadeArchiveManyController } from './controllers/infraestruturaEnergiaConectividadeArchiveManyController';
import { infraestruturaEnergiaConectividadeAutocompleteController } from './controllers/infraestruturaEnergiaConectividadeAutocompleteController';
import { infraestruturaEnergiaConectividadeCreateController } from './controllers/infraestruturaEnergiaConectividadeCreateController';
import { infraestruturaEnergiaConectividadeDeleteManyController } from './controllers/infraestruturaEnergiaConectividadeDeleteManyController';
import { infraestruturaEnergiaConectividadeFindController } from './controllers/infraestruturaEnergiaConectividadeFindController';
import { infraestruturaEnergiaConectividadeFindManyController } from './controllers/infraestruturaEnergiaConectividadeFindManyController';
import { infraestruturaEnergiaConectividadeImporterController } from './controllers/infraestruturaEnergiaConectividadeImporterController';
import { infraestruturaEnergiaConectividadeRestoreManyController } from './controllers/infraestruturaEnergiaConectividadeRestoreManyController';
import { infraestruturaEnergiaConectividadeUpdateController } from './controllers/infraestruturaEnergiaConectividadeUpdateController';
import { parseHonoQuery } from '../../shared/lib/parseHonoQuery';

export const infraestruturaEnergiaConectividadeRoutes = new Hono();

infraestruturaEnergiaConectividadeRoutes.get('/', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const query = parseHonoQuery(c.req.query());
    const payload = await infraestruturaEnergiaConectividadeFindManyController(
      query,
      context,
    );
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

infraestruturaEnergiaConectividadeRoutes.get('/autocomplete', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const query = parseHonoQuery(c.req.query());
    const payload =
      await infraestruturaEnergiaConectividadeAutocompleteController(
        query,
        context,
      );
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

infraestruturaEnergiaConectividadeRoutes.post('/', async (c) => {
  let context;
  try {
    const body = await c.req.json();
    context = await appContext(c);
    const payload = await infraestruturaEnergiaConectividadeCreateController(
      body,
      context,
    );
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

infraestruturaEnergiaConectividadeRoutes.post('/importer', async (c) => {
  let context;
  try {
    const body = await c.req.json();
    context = await appContext(c);
    const payload = await infraestruturaEnergiaConectividadeImporterController(
      body,
      context,
    );
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

infraestruturaEnergiaConectividadeRoutes.put('/archive', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const body = await c.req.json();
    await infraestruturaEnergiaConectividadeArchiveManyController(
      body,
      context,
    );
    const payload = true;
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

infraestruturaEnergiaConectividadeRoutes.put('/restore', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const body = await c.req.json();
    await infraestruturaEnergiaConectividadeRestoreManyController(
      body,
      context,
    );
    const payload = true;
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

infraestruturaEnergiaConectividadeRoutes.delete('/', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const query = parseHonoQuery(c.req.query());
    await infraestruturaEnergiaConectividadeDeleteManyController(
      query,
      context,
    );
    const payload = true;
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

infraestruturaEnergiaConectividadeRoutes.get('/:id', async (c) => {
  let context;
  try {
    const id = c.req.param('id');
    context = await appContext(c);
    const payload = await infraestruturaEnergiaConectividadeFindController(
      { id },
      context,
    );
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

infraestruturaEnergiaConectividadeRoutes.put('/:id', async (c) => {
  let context;
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    context = await appContext(c);
    const payload = await infraestruturaEnergiaConectividadeUpdateController(
      { id },
      body,
      context,
    );
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});
