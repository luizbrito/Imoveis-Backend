import { APIError } from 'better-auth';
import { env } from '../../../env';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryEnumerator } from '../../../translation/dictionaryEnumerator';
import { authBackend } from '../../auth/authBackend';
import { authGuardBackend } from '../../auth/authGuardBackend';
import {
  organizationUpdateInputSchema,
  organizationUpdateInputSchemaStatic,
} from '../organizationSchemas';

export const organizationUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/organization/{id}',
  params: z.object({
    id: z.string(),
  }),
  body: organizationUpdateInputSchemaStatic,
  response: 'Organization',
};

export async function organizationUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      organization: ['update'],
    },
    context,
  );

  const organizationMultiDomainMode = env.ORGANIZATION_MULTI_DOMAIN_MODE;
  const organizationMode = env.ORGANIZATION_MODE;

  const { id } = z.object({ id: z.string() }).parse(params);
  const data = organizationUpdateInputSchema(
    organizationMode,
    organizationMultiDomainMode,
    context.dictionary,
  ).parse(body);

  const isMultiDomain = organizationMode === 'multi-domain';
  const isSubdomainMode = organizationMultiDomainMode === 'subdomain';

  try {
    const updateData: any = {};

    if (data.name !== undefined) {
      updateData.name = data.name;
    }

    if (isMultiDomain && data.slug !== undefined) {
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

          if (reservedSlug && data.slug === reservedSlug) {
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

      updateData.slug = data.slug;
    }

    if (data.logosLight !== undefined) {
      updateData.logosLight = data.logosLight.length
        ? JSON.stringify(data.logosLight)
        : null;
    }

    if (data.logosDark !== undefined) {
      updateData.logosDark = data.logosDark.length
        ? JSON.stringify(data.logosDark)
        : null;
    }

    if (data.backgroundImageLight !== undefined) {
      updateData.backgroundImageLight = data.backgroundImageLight.length
        ? JSON.stringify(data.backgroundImageLight)
        : null;
    }

    if (data.backgroundImageDark !== undefined) {
      updateData.backgroundImageDark = data.backgroundImageDark.length
        ? JSON.stringify(data.backgroundImageDark)
        : null;
    }

    if (data.require2fa !== undefined) {
      // Block enabling org-wide 2FA unless the acting admin already has 2FA on
      // their own account. Otherwise the enforcement (which reads the pre-write
      // state, so this write succeeds) immediately 403s every following
      // request — including the org-update endpoint needed to revert it —
      // locking the admin out. GitHub applies the same guard.
      if (data.require2fa && !context.currentUser?.twoFactorEnabled) {
        throw new Error400(
          context.dictionary.organization.errors.require2faRequiresOwn2fa,
        );
      }
      updateData.require2fa = data.require2fa;
    }

    const result = await authBackend.api.updateOrganization({
      body: {
        organizationId: id,
        data: updateData,
      },
      headers: context.headers,
    });

    if (!result) {
      throw new Error400(context.dictionary.organization.errors.updateFailed);
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
