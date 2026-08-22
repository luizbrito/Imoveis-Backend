import { getFrontendUrl } from '../../shared/lib/getFrontendUrl';
import { env } from '../../env';

/**
 * Strips wildcard prefix from URL if present
 * Example: 'https://*.project.localhost' -> 'https://project.localhost'
 */
function stripWildcardFromUrl(url: string): string {
  return url.replace(/^(https?:\/\/)\*\./, '$1');
}

/**
 * Get trusted origins for CORS based on organization mode configuration
 *
 * In multi-domain subdomain mode, returns wildcard pattern to allow all subdomains
 * In multi-domain domain mode, returns trusted origins from env variable
 * In other modes, returns the base frontend URL
 */
export function authTrustedOrigins(): string[] {
  const isMultiDomainSubdomain =
    env.ORGANIZATION_MODE === 'multi-domain' &&
    env.ORGANIZATION_MULTI_DOMAIN_MODE === 'subdomain';

  const isMultiDomainDomain =
    env.ORGANIZATION_MODE === 'multi-domain' &&
    env.ORGANIZATION_MULTI_DOMAIN_MODE === 'domain';

  if (isMultiDomainSubdomain) {
    // For subdomain mode, use wildcard pattern for subdomains
    const rawFrontendUrl = env.FRONTEND_URL || 'http://localhost:5173';

    // Strip wildcard if present to get base URL
    const baseFrontendUrl = stripWildcardFromUrl(rawFrontendUrl);
    const baseUrl = new URL(baseFrontendUrl);

    // Return array with base domain and wildcard for subdomains
    return [
      baseFrontendUrl,
      `${baseUrl.protocol}//*.${baseUrl.hostname}${baseUrl.port ? `:${baseUrl.port}` : ''}`,
    ];
  }

  if (isMultiDomainDomain) {
    // For domain mode, return trusted origins from env variable
    const trustedOrigins = env.ORGANIZATION_DOMAIN_TRUSTED_ORIGINS || [];
    const frontendUrl = getFrontendUrl();

    // Always include the base frontend URL along with trusted origins
    return [frontendUrl, ...trustedOrigins];
  }

  // For all other modes, return single frontend URL
  return [getFrontendUrl()];
}

/**
 * Exported constant for Better Auth configuration
 */
export const trustedOrigins = authTrustedOrigins();
