import { APIError } from 'better-auth';
import { env } from '../../../env';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { Error403 } from '../../../shared/errors/Error403';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryEnumerator } from '../../../translation/dictionaryEnumerator';
import { authBackend } from '../../auth/authBackend';
import {
  organizationFormSchema,
  organizationFormSchemaStatic,
} from '../organizationSchemas';

export const organizationCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/organization',
  body: organizationFormSchemaStatic,
  response: 'Organization',
};

export async function organizationCreateController(
  body: unknown,
  context: AppContext,
) {
  if (!context.currentUser) {
    throw new Error403();
  }

  const organizationMode = env.ORGANIZATION_MODE;
  const organizationMultiDomainMode = env.ORGANIZATION_MULTI_DOMAIN_MODE;

  const data = organizationFormSchema(
    organizationMode,
    organizationMultiDomainMode,
    context.dictionary,
  ).parse(body);

  const isMultiDomain = organizationMode === 'multi-domain';
  const isSubdomainMode = organizationMultiDomainMode === 'subdomain';

  const name = data.name || 'organization';
  let slug: string;

  if (isMultiDomain && data.slug) {
    slug = data.slug;

    const frontendUrl = env.FRONTEND_URL;
    if (frontendUrl) {
      try {
        const url = new URL(frontendUrl);
        const hostname = url.hostname;
        let reservedSlug: string | null = null;

        if (isSubdomainMode) {
          // Subdomain mode: extract first part (e.g., "app" from "app.project.localhost")
          const parts = hostname.split('.');
          if (parts.length > 0) {
            reservedSlug = parts[0];
          }
        } else {
          // Full domain mode: entire hostname is reserved
          reservedSlug = hostname;
        }

        if (reservedSlug && slug === reservedSlug) {
          throw new Error400(
            context.dictionary.organization.form.slugReserved ||
              `The ${isSubdomainMode ? 'subdomain' : 'domain'} "${reservedSlug}" is reserved for the application`,
          );
        }
      } catch (error) {
        if (error instanceof Error400) {
          throw error;
        }
        console.error('Failed to parse FRONTEND_URL:', error);
      }
    }
  } else {
    slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    slug = `${slug}-${Date.now()}`;
  }

  const logosLight = data.logosLight
    ? JSON.stringify(data.logosLight)
    : undefined;
  const logosDark = data.logosDark ? JSON.stringify(data.logosDark) : undefined;
  const backgroundImageLight = data.backgroundImageLight
    ? JSON.stringify(data.backgroundImageLight)
    : undefined;
  const backgroundImageDark = data.backgroundImageDark
    ? JSON.stringify(data.backgroundImageDark)
    : undefined;

  try {
    const result = await authBackend.api.createOrganization({
      body: {
        name: name,
        slug: slug,
        ...(logosLight ? { logosLight } : {}),
        ...(logosDark ? { logosDark } : {}),
        ...(backgroundImageLight ? { backgroundImageLight } : {}),
        ...(backgroundImageDark ? { backgroundImageDark } : {}),
      } as any,
      headers: context.headers,
    });

    if (!result) {
      throw new Error400(context.dictionary.organization.errors.createFailed);
    }

    return result;
  } catch (error) {
    if (error instanceof APIError) {
      throw new Error400(
        dictionaryEnumerator(
          context.dictionary.auth.errors,
          error.body?.code,
        ) ||
          error?.body?.message ||
          context.dictionary.shared.errors.unknown,
      );
    }

    throw error;
  }
}
