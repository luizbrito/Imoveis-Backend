import { serve } from '@hono/node-server';
import app from './app';
import { env } from './env';
import { dictionaryIntegrityCheck } from './translation/dictionaryIntegrityCheck';

const port = env.PORT || '3000';

// Check dictionary integrity on startup
dictionaryIntegrityCheck();

console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port: Number(port),
});
