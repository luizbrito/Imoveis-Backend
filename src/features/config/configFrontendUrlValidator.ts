import { z } from 'zod';

/**
 * Validates FRONTEND_URL format based on organization mode configuration.
 * In multi-domain subdomain mode, FRONTEND_URL must use wildcard pattern
 * to support dynamic organization subdomains (e.g., org1.example.com, org2.example.com).
 */
export const configFrontendUrlValidator = z
  .string()
  .optional()
  .superRefine((value, ctx) => {
    if (process.env.NODE_ENV === 'test') {
      return;
    }

    const organizationMode = process.env.ORGANIZATION_MODE;
    const organizationMultiDomainMode =
      process.env.ORGANIZATION_MULTI_DOMAIN_MODE;

    if (
      organizationMode === 'multi-domain' &&
      organizationMultiDomainMode === 'subdomain'
    ) {
      if (value && !value.includes('*')) {
        ctx.addIssue({
          code: 'custom',
          message:
            `must use wildcard format (https://*.yourdomain.com) when ORGANIZATION_MODE=multi-domain and ORGANIZATION_MULTI_DOMAIN_MODE=subdomain\n\n` +
            `     Current value: ${value}\n` +
            `     Required format: https://*.yourdomain.com\n\n` +
            `     Example configuration:\n` +
            `       FRONTEND_URL=https://*.project.localhost\n\n` +
            `     This enables subdomain-based multi-tenancy where each organization\n` +
            `     gets its own subdomain (e.g., acme.project.localhost, corp.project.localhost)`,
        });
      }
    }
  });
