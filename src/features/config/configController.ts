import { Context } from 'hono';
import { prismaDangerouslyBypassRLS } from '../../prisma';
import { fetchStripePlans } from '../subscription/subscriptionFetchPlans';
import { ConfigPublic, configPublicQuerySchema } from './configSchemas';
import { env } from '../../env';

/**
 * Returns public configuration that the frontend needs before authentication.
 * This endpoint is unauthenticated because the frontend needs access to:
 * - Organization branding (logos, backgrounds) for custom login pages
 * - Subscription plans for pricing display
 * - Feature flags (chatbot, email verification bypass) for conditional UI
 * - Third-party keys (Stripe, reCAPTCHA) that are safe to expose client-side
 */
export async function configPublicController(c: Context): Promise<Response> {
  const query = configPublicQuerySchema.parse(c.req.query());

  const config: ConfigPublic = {
    organizationMode: env.ORGANIZATION_MODE,
    organizationMultiDomainMode: env.ORGANIZATION_MULTI_DOMAIN_MODE,
    subscriptionMode: env.SUBSCRIPTION_MODE,
    isChatbotEnabled: Boolean(env.ANTHROPIC_API_KEY),
    isPushNotificationsEnabled: env.PUSH_NOTIFICATIONS_ENABLED,
    organizationDefaultRole: env.ORGANIZATION_DEFAULT_ROLE,
  };

  if (env.STRIPE_PUBLISHABLE_KEY) {
    config.stripePublishableKey = env.STRIPE_PUBLISHABLE_KEY;
  }

  if (env.RECAPTCHA_SITE_KEY) {
    config.recaptchaSiteKey = env.RECAPTCHA_SITE_KEY;
  }

  if (env.VAPID_PUBLIC_KEY && env.PUSH_NOTIFICATIONS_ENABLED) {
    config.vapidPublicKey = env.VAPID_PUBLIC_KEY;
  }

  config.bypassEmailVerification = env.AUTH_BYPASS_EMAIL_VERIFICATION;

  const brandingSelect = {
    id: true,
    name: true,
    slug: true,
    logosDark: true,
    logosLight: true,
    backgroundImageDark: true,
    backgroundImageLight: true,
  } as const;

  // Single mode is capped at 1 org, so findFirst is unambiguous.
  const brandingOrgPromise = (() => {
    if (config.organizationMode === 'single') {
      return prismaDangerouslyBypassRLS.organization.findFirst({
        select: brandingSelect,
      });
    }
    if (query.domain && config.organizationMode === 'multi-domain') {
      const slug =
        config.organizationMultiDomainMode === 'subdomain'
          ? query.domain.split('.')[0]
          : query.domain;
      return prismaDangerouslyBypassRLS.organization.findUnique({
        where: { slug },
        select: brandingSelect,
      });
    }
    return Promise.resolve(null);
  })();

  const subscriptionPlansPromise =
    config.subscriptionMode !== 'disabled'
      ? fetchStripePlans()
      : Promise.resolve(null);

  const [subscriptionPlans, brandingOrg] = await Promise.all([
    subscriptionPlansPromise,
    brandingOrgPromise,
  ]);

  if (subscriptionPlans) {
    config.subscriptionPlans = subscriptionPlans;
  }

  if (brandingOrg) {
    config.organizationForBranding = brandingOrg;
  }

  return c.json(config);
}
