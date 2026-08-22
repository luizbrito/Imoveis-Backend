import { z } from 'zod';

export const publicHomeStatsSchema = z.object({
  properties: z.number().int().nonnegative(),
  farms: z.number().int().nonnegative(),
  cities: z.number().int().nonnegative(),
  hectares: z.number().nonnegative(),
  featured: z.number().int().nonnegative(),
});

export type PublicHomeStats = z.infer<typeof publicHomeStatsSchema>;

export const publicFavoriteListSchema = z.object({
  imovelIds: z.array(z.string().uuid()),
});

export const publicFavoriteToggleSchema = z.object({
  imovelId: z.string().uuid(),
  isFavorite: z.boolean(),
});

export type PublicFavoriteList = z.infer<typeof publicFavoriteListSchema>;
export type PublicFavoriteToggle = z.infer<typeof publicFavoriteToggleSchema>;

export const publicRegionSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  countryId: z.string().uuid().nullable(),
  countryName: z.string().nullable(),
  stateId: z.string().uuid().nullable(),
  properties: z.number().int().nonnegative(),
  farms: z.number().int().nonnegative(),
});

export const publicLocationOptionSchema = z.object({
  id: z.string(),
  label: z.string(),
  kind: z.enum(['country', 'state', 'city', 'neighborhood', 'region']),
  countryId: z.string().uuid().nullable(),
  stateId: z.string().uuid().nullable(),
  cityId: z.string().uuid().nullable(),
});

export const publicGeographySchema = z.object({
  regions: z.array(publicRegionSummarySchema),
  locations: z.array(publicLocationOptionSchema),
});

export type PublicRegionSummary = z.infer<typeof publicRegionSummarySchema>;
export type PublicLocationOption = z.infer<typeof publicLocationOptionSchema>;
export type PublicGeography = z.infer<typeof publicGeographySchema>;

export const publicTestimonialSchema = z.object({
  id: z.string(),
  quote: z.string(),
  name: z.string(),
  profile: z.string().nullable(),
  city: z.string().nullable(),
  photoUrl: z.string().url().nullable(),
  rating: z.number().int().min(1).max(5),
});

export const publicSiteSettingsSchema = z.object({
  organizationName: z.string(),
  description: z.string().nullable(),
  phone: z.string().nullable(),
  email: z.string().email().nullable(),
  address: z.string().nullable(),
  whatsapp: z.string().nullable(),
  social: z.object({
    instagram: z.string().url().nullable(),
    facebook: z.string().url().nullable(),
    linkedin: z.string().url().nullable(),
    youtube: z.string().url().nullable(),
  }),
});

export const publicContentSchema = z.object({
  testimonials: z.array(publicTestimonialSchema),
  settings: publicSiteSettingsSchema,
});

export const publicSiteMetadataSchema = z.object({
  description: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  whatsapp: z.string().optional(),
  social: z
    .object({
      instagram: z.string().url().optional(),
      facebook: z.string().url().optional(),
      linkedin: z.string().url().optional(),
      youtube: z.string().url().optional(),
    })
    .optional(),
  testimonials: z.array(publicTestimonialSchema).optional(),
});

export type PublicTestimonial = z.infer<typeof publicTestimonialSchema>;
export type PublicSiteSettings = z.infer<typeof publicSiteSettingsSchema>;
export type PublicContent = z.infer<typeof publicContentSchema>;

const publicPropertyRequestBaseSchema = z.object({
  slug: z.string().trim().min(1).max(180),
  name: z.string().trim().min(1).max(180),
  email: z.string().trim().email().max(150),
  phone: z.string().trim().min(6).max(30),
  message: z.string().trim().max(3000).optional(),
});

export const publicPropertyContactSchema = z.discriminatedUnion('kind', [
  publicPropertyRequestBaseSchema.extend({ kind: z.literal('contact') }),
  publicPropertyRequestBaseSchema.extend({
    kind: z.literal('visit'),
    requestedAt: z.string().datetime(),
    people: z.number().int().min(1).max(50),
  }),
]);

export type PublicHomeResponse = {
  stats: PublicHomeStats;
  featuredProperties: Array<Record<string, unknown>>;
  regions: PublicRegionSummary[];
  locations: PublicLocationOption[];
  climatePreview?: { sourceLabel?: string; updatedAt?: string };
  soilPreview?: { sourceLabel?: string; updatedAt?: string };
  testimonials: PublicTestimonial[];
  settings: PublicSiteSettings;
};
