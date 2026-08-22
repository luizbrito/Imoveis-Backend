import { Hono } from 'hono';
import { ApiResponseError } from '../../shared/controller/ApiResponseError';
import { appContext } from '../../shared/controller/appContext';
import { chatbotSendMessageController } from './chatbotController';

export const chatbotRoutes = new Hono();

chatbotRoutes.post('/message', async (c) => {
  let context;
  try {
    const body = await c.req.json();
    context = await appContext(c);
    // chatbotSendMessageController returns a streaming response directly
    return await chatbotSendMessageController(body, context, c);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});
