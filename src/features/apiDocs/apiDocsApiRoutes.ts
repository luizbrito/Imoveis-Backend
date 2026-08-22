import { Hono } from 'hono';
import { dictionaryLocaleFromRequest } from '../../translation/dictionaryLocaleFromRequest';
import { getDictionary } from '../../translation/getDictionary';
import { buildApiDocs } from '../apiDocs';
import { env } from '../../env';

export const apiDocsRoutes = new Hono();

apiDocsRoutes.get('/', async (c) => {
  try {
    const locale = dictionaryLocaleFromRequest(c.req.raw);
    const dictionary = await getDictionary(locale);
    const apiDocs = buildApiDocs(dictionary);
    return c.json(apiDocs);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

apiDocsRoutes.get('/reference', async (c) => {
  try {
    const locale = dictionaryLocaleFromRequest(c.req.raw);

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body>
  <script
    id="api-reference"
    data-url="${env.BACKEND_URL || ''}/api/api-docs?locale=${locale}"
    data-configuration='${JSON.stringify({
      theme: 'default',
      layout: 'modern',
    })}'
  ></script>
  <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
</body>
</html>
    `.trim();

    return c.html(html);
  } catch (error: any) {
    return c.html(`<html><body>Error: ${error.message}</body></html>`, 500);
  }
});
