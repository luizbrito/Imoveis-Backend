import { z } from 'zod';

export interface StripeCustomerMetadata {
  userId?: string | null;
  organizationId?: string | null;
  memberId?: string | null;
}

export const subscriptionCheckoutInputSchema = z.object({
  stripePriceId: z.string().trim(),
});

export const subscriptionCheckoutOutputSchema = z.object({
  url: z.string(),
});

export const subscriptionPortalOutputSchema = z.object({
  url: z.string(),
});

export const subscriptionWebhookOutputSchema = z.object({
  received: z.boolean(),
});

export const subscriptionPlanSchema = z.object({
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
});

export const subscriptionPlansOutputSchema = z.object({
  plans: z.array(subscriptionPlanSchema),
});
