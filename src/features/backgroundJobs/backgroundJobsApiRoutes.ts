import { Hono } from 'hono';
import { processBackgroundJobsController } from './controllers/processBackgroundJobsController';

export const backgroundJobsRoutes = new Hono();

backgroundJobsRoutes.get('/process', processBackgroundJobsController);
