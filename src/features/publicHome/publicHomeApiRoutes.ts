import { Hono } from 'hono';
import { ApiResponseError } from '../../shared/controller/ApiResponseError';
import { ApiResponseSuccess } from '../../shared/controller/ApiResponseSuccess';
import { appContext } from '../../shared/controller/appContext';
import { publicHomeStatsController } from './controllers/publicHomeStatsController';
import {
  publicFavoriteListController,
  publicFavoriteToggleController,
} from './controllers/publicFavoriteControllers';
import { publicGeographyController } from './controllers/publicGeographyController';
import { publicContentController } from './controllers/publicContentController';
import { publicHomeController } from './controllers/publicHomeController';
import { anuncioPublicFindManyController } from '../anuncio/controllers/anuncioPublicFindManyController';
import { anuncioPublicGetController } from '../anuncio/controllers/anuncioPublicGetController';
import { publicPropertyContactController } from './controllers/publicPropertyContactController';

export const publicHomeRoutes = new Hono();

publicHomeRoutes.get('/home', async (c) =>
  c.json(await publicHomeController(c)),
);

publicHomeRoutes.get('/stats', async (c) =>
  c.json(await publicHomeStatsController(c)),
);

publicHomeRoutes.get('/geography', async (c) =>
  c.json(await publicGeographyController(c)),
);

publicHomeRoutes.get('/content', async (c) =>
  c.json(await publicContentController(c)),
);

publicHomeRoutes.get('/properties/search', async (c) => {
  return c.json(await anuncioPublicFindManyController(c));
});

publicHomeRoutes.get('/properties/:slug', async (c) => {
  const property = await anuncioPublicGetController(c);
  return property ? c.json(property) : c.json({ code: 'PROPERTY_NOT_FOUND' }, 404);
});

publicHomeRoutes.post('/properties/contact', async (c) => {
  const contact = await publicPropertyContactController(c);
  return contact ? c.json(contact, 201) : c.json({ code: 'PROPERTY_NOT_FOUND' }, 404);
});

publicHomeRoutes.get('/favorites', async (c) => {
  let context;
  try {
    context = await appContext(c);
    return ApiResponseSuccess(
      c,
      context,
      await publicFavoriteListController(context),
    );
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});

publicHomeRoutes.put('/favorites/:imovelId', async (c) => {
  let context;
  try {
    context = await appContext(c);
    const payload = await publicFavoriteToggleController(
      c.req.param('imovelId'),
      context,
    );
    return ApiResponseSuccess(c, context, payload);
  } catch (error: any) {
    return ApiResponseError(c, context, error);
  }
});
