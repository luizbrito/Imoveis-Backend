import { env } from '../../env';

/**
 * Strips wildcard prefix from URL if present
 * Example: 'https://*.project.localhost' -> 'https://project.localhost'
 */
function stripWildcardFromUrl(url: string): string {
  return url.replace(/^(https?:\/\/)\*\./, '$1');
}

/**
 * Constructs the frontend URL based on organization mode and slug.
 *
 * @param organizationSlug - The organization slug (optional)
 * @returns The full frontend URL
 *
 * @example
 * // ORGANIZATION_MODE = 'single' or 'multi'
 * // FRONTEND_URL = 'https://mycompany.com'
 * getFrontendUrl() // => 'https://mycompany.com'
 *
 * @example
 * // ORGANIZATION_MODE = 'multi-domain'
 * // ORGANIZATION_MULTI_DOMAIN_MODE = 'subdomain'
 * // FRONTEND_URL = 'https://mycompany.com' or 'https://*.mycompany.com'
 * getFrontendUrl('acme') // => 'https://acme.mycompany.com'
 *
 * @example
 * // ORGANIZATION_MODE = 'multi-domain'
 * // ORGANIZATION_MULTI_DOMAIN_MODE = 'domain'
 * // FRONTEND_URL = 'https://mycompany.com'
 * getFrontendUrl('acme.example.com') // => 'https://acme.example.com'
 */
export function getFrontendUrl(organizationSlug?: string | null): string {
  const rawFrontendUrl = env.FRONTEND_URL || 'http://localhost:5173';
  const baseFrontendUrl = stripWildcardFromUrl(rawFrontendUrl);

  const organizationMode = env.ORGANIZATION_MODE || 'multi';
  const multiDomainMode = env.ORGANIZATION_MULTI_DOMAIN_MODE;

  if (organizationMode !== 'multi-domain') {
    return baseFrontendUrl;
  }

  if (!organizationSlug) {
    return baseFrontendUrl;
  }

  const url = new URL(baseFrontendUrl);

  if (multiDomainMode === 'subdomain') {
    // Subdomain mode: 'acme' + 'mycompany.com' => 'acme.mycompany.com'
    url.hostname = `${organizationSlug}.${url.hostname}`;
  } else if (multiDomainMode === 'domain') {
    // Full domain mode: 'acme.example.com' => 'acme.example.com'
    url.hostname = organizationSlug;
  }

  return url.toString().replace(/\/$/, '');
}
