import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { apiRoutes } from './features/apiRoutes';
import { corsConfig } from './shared/lib/corsConfig';

const app = new Hono();

app.use('*', logger());
app.use(
  '*',
  secureHeaders({
    ...(process.env.FRONTEND_URL
      ? {
          contentSecurityPolicy: {
            frameAncestors: ["'self'", process.env.FRONTEND_URL],
          },
        }
      : {}),
  }),
);
app.use('*', cors(corsConfig));

app.route('/api', apiRoutes);

export default app;
