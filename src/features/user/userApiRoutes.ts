import { Hono } from 'hono';
import { ApiResponseError } from '../../shared/controller/ApiResponseError';
import { ApiResponseSuccess } from '../../shared/controller/ApiResponseSuccess';
import { appContext } from '../../shared/controller/appContext';
import { userMeController } from './controllers/userMeController';

export const userRoutes = new Hono();

userRoutes.get('/me', async (c) => {
  let context;
  try {
    context = await appContext(c, { skipTwoFactorEnforcement: true });
    const payload = await userMeController(context);
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});
