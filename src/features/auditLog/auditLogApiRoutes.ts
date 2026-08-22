import { Hono } from 'hono';
import { auditLogActivityChartController } from './controllers/auditLogActivityChartController';
import { auditLogFindManyController } from './controllers/auditLogFindManyController';
import { appContext } from '../../shared/controller/appContext';
import { ApiResponseSuccess } from '../../shared/controller/ApiResponseSuccess';
import { ApiResponseError } from '../../shared/controller/ApiResponseError';
import { parseHonoQuery } from '../../shared/lib/parseHonoQuery';

export const auditLogRoutes = new Hono();

auditLogRoutes.get('/', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const query = parseHonoQuery(c.req.query());
    const payload = await auditLogFindManyController(query, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

auditLogRoutes.get('/activity-chart', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const query = parseHonoQuery(c.req.query());
    const payload = await auditLogActivityChartController(query, context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});
