import { Hono } from 'hono';
import { configPublicController } from './configController';

export const configRoutes = new Hono();

// Public endpoint - no authentication required
configRoutes.get('/public', configPublicController);
