import { z } from 'zod';

const organizationModeSchema = z.enum(['single', 'multi', 'multi-domain']);
export type OrganizationMode = z.infer<typeof organizationModeSchema>;

const organizationMultiDomainModeSchema = z.enum(['domain', 'subdomain']);
export type OrganizationMultiDomainMode = z.infer<
  typeof organizationMultiDomainModeSchema
>;

export const configPublicQuerySchema = z.object({
  domain: z.string().optional(),
});

export const configPublicSchema = z.object({
  organizationMode: organizationModeSchema,
  organizationMultiDomainMode: organizationMultiDomainModeSchema.optional(),
  subscriptionMode: z.enum(['disabled', 'organization', 'member']),
  subscriptionPlans: z
    .array(
      z.object({
        stripePriceId: z.string(),
        name: z.string(),
        description: z.string().nullable(),
        currency: z.string(),
        unitAmount: z.number(),
        interval: z.enum(['day', 'week', 'month', 'year']),
        intervalCount: z.number(),
        marketingFeatures: z.array(z.object({ name: z.string() })),
        unitLabel: z.string().nullable(),
        active: z.boolean(),
      }),
    )
    .optional(),
  stripePublishableKey: z.string().optional(),
  recaptchaSiteKey: z.string().optional(),
  bypassEmailVerification: z.boolean().optional(),
  isChatbotEnabled: z.boolean(),
  isPushNotificationsEnabled: z.boolean(),
  vapidPublicKey: z.string().optional(),
  organizationDefaultRole: z.string().optional(),
  organizationForBranding: z
    .object({
      id: z.string(),
      name: z.string(),
      slug: z.string(),
      logosDark: z.any().nullable(),
      logosLight: z.any().nullable(),
      backgroundImageDark: z.any().nullable(),
      backgroundImageLight: z.any().nullable(),
    })
    .optional(),
});

export type ConfigPublic = z.output<typeof configPublicSchema>;
