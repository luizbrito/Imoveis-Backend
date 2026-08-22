import { Context } from 'hono';
import { AppContext } from './appContext';
import { auditLogApiKeyCall } from '../../features/auditLog/auditLogApiKeyCall';

export async function ApiResponseSuccess(
  c: Context,
  context: AppContext,
  payload?: any,
) {
  if (payload === undefined) {
    payload = 'OK';
  }

  if (context.apiKey?.id) {
    await auditLogApiKeyCall(c, context, 200);
  }

  return c.json(payload);
}
