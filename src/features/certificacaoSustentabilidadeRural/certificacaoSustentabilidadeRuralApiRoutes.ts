import { Hono } from 'hono';
import { ApiResponseError } from '../../shared/controller/ApiResponseError';
import { ApiResponseSuccess } from '../../shared/controller/ApiResponseSuccess';
import { appContext } from '../../shared/controller/appContext';
import { certificacaoSustentabilidadeRuralArchiveManyController } from './controllers/certificacaoSustentabilidadeRuralArchiveManyController';
import { certificacaoSustentabilidadeRuralAutocompleteController } from './controllers/certificacaoSustentabilidadeRuralAutocompleteController';
import { certificacaoSustentabilidadeRuralCreateController } from './controllers/certificacaoSustentabilidadeRuralCreateController';
import { certificacaoSustentabilidadeRuralDeleteManyController } from './controllers/certificacaoSustentabilidadeRuralDeleteManyController';
import { certificacaoSustentabilidadeRuralFindController } from './controllers/certificacaoSustentabilidadeRuralFindController';
import { certificacaoSustentabilidadeRuralFindManyController } from './controllers/certificacaoSustentabilidadeRuralFindManyController';
import { certificacaoSustentabilidadeRuralImporterController } from './controllers/certificacaoSustentabilidadeRuralImporterController';
import { certificacaoSustentabilidadeRuralRestoreManyController } from './controllers/certificacaoSustentabilidadeRuralRestoreManyController';
import { certificacaoSustentabilidadeRuralUpdateController } from './controllers/certificacaoSustentabilidadeRuralUpdateController';
import { parseHonoQuery } from '../../shared/lib/parseHonoQuery';

export const certificacaoSustentabilidadeRuralRoutes = new Hono();

certificacaoSustentabilidadeRuralRoutes.get('/', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const query = parseHonoQuery(c.req.query());
    const payload = await certificacaoSustentabilidadeRuralFindManyController(
      query,
      context,
    );
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

certificacaoSustentabilidadeRuralRoutes.get('/autocomplete', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const query = parseHonoQuery(c.req.query());
    const payload =
      await certificacaoSustentabilidadeRuralAutocompleteController(
        query,
        context,
      );
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

certificacaoSustentabilidadeRuralRoutes.post('/', async (c) => {
  let context;
  try {
    const body = await c.req.json();
    context = await appContext(c);
    const payload = await certificacaoSustentabilidadeRuralCreateController(
      body,
      context,
    );
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

certificacaoSustentabilidadeRuralRoutes.post('/importer', async (c) => {
  let context;
  try {
    const body = await c.req.json();
    context = await appContext(c);
    const payload = await certificacaoSustentabilidadeRuralImporterController(
      body,
      context,
    );
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

certificacaoSustentabilidadeRuralRoutes.put('/archive', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const body = await c.req.json();
    await certificacaoSustentabilidadeRuralArchiveManyController(body, context);
    const payload = true;
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

certificacaoSustentabilidadeRuralRoutes.put('/restore', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const body = await c.req.json();
    await certificacaoSustentabilidadeRuralRestoreManyController(body, context);
    const payload = true;
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

certificacaoSustentabilidadeRuralRoutes.delete('/', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const query = parseHonoQuery(c.req.query());
    await certificacaoSustentabilidadeRuralDeleteManyController(query, context);
    const payload = true;
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

certificacaoSustentabilidadeRuralRoutes.get('/:id', async (c) => {
  let context;
  try {
    const id = c.req.param('id');
    context = await appContext(c);
    const payload = await certificacaoSustentabilidadeRuralFindController(
      { id },
      context,
    );
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

certificacaoSustentabilidadeRuralRoutes.put('/:id', async (c) => {
  let context;
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    context = await appContext(c);
    const payload = await certificacaoSustentabilidadeRuralUpdateController(
      { id },
      body,
      context,
    );
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});
