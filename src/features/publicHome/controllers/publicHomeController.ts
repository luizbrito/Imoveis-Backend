import { Context } from 'hono';
import { PublicHomeResponse } from '../publicHomeSchemas';
import { anuncioPublicFindManyController } from '../../anuncio/controllers/anuncioPublicFindManyController';
import { publicContentController } from './publicContentController';
import { publicGeographyController } from './publicGeographyController';
import { publicHomeStatsController } from './publicHomeStatsController';

export async function publicHomeController(c: Context): Promise<PublicHomeResponse> {
  const [stats, featured, geography, content] = await Promise.all([
    publicHomeStatsController(c),
    anuncioPublicFindManyController(c, { featured: true, take: 12 }),
    publicGeographyController(c),
    publicContentController(c),
  ]);

  return {
    stats,
    featuredProperties: featured.anuncios,
    regions: geography.regions,
    locations: geography.locations,
    testimonials: content.testimonials,
    settings: content.settings,
  };
}
