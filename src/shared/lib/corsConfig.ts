import { env } from '../../env';
import { getFrontendUrl } from './getFrontendUrl';

async function corsOrigin(origin: string | undefined): Promise<string> {
  if (
    origin &&
    env.ORGANIZATION_MODE === 'multi-domain' &&
    env.ORGANIZATION_MULTI_DOMAIN_MODE === 'subdomain'
  ) {
    const baseFrontendUrl = env.FRONTEND_URL || 'http://localhost:5173';
    const strippedUrl = baseFrontendUrl.replace(/^(https?:\/\/)\*\./, '$1');
    const baseDomain = new URL(strippedUrl).hostname;
    const originUrl = new URL(origin);

    if (
      originUrl.hostname === baseDomain ||
      originUrl.hostname.endsWith(`.${baseDomain}`)
    ) {
      return origin;
    }
  }

  if (
    origin &&
    env.ORGANIZATION_MODE === 'multi-domain' &&
    env.ORGANIZATION_MULTI_DOMAIN_MODE === 'domain'
  ) {
    const trustedOrigins = env.ORGANIZATION_DOMAIN_TRUSTED_ORIGINS || [];
    if (trustedOrigins.includes(origin)) {
      return origin;
    }
  }

  const allowedOrigins = [getFrontendUrl()];
  return origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
}

// hono/cors does not export its options type, so derive it from the cors fn
export const corsConfig: NonNullable<
  Parameters<typeof import('hono/cors').cors>[0]
> = {
  origin: corsOrigin,
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowHeaders: [
    'Content-Type',
    'Authorization',
    'Accept-Language',
    'x-api-key',
    'x-captcha-response',
    'x-organization-id',
    'x-invitation-token',
  ],
};
