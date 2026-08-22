import { APIError } from 'better-auth';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryEnumerator } from '../../../translation/dictionaryEnumerator';
import { authBackend } from '../../auth/authBackend';
import { authGuardBackend } from '../../auth/authGuardBackend';

export const organizationDeleteApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/organization/{id}',
  params: z.object({
    id: z.string(),
  }),
  response: 'boolean',
};

export async function organizationDeleteController(
  params: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      organization: ['delete'],
    },
    context,
  );

  const { id } = z.object({ id: z.string() }).parse(params);

  try {
    const result = await authBackend.api.deleteOrganization({
      body: {
        organizationId: id,
      },
      headers: context.headers,
    });

    if (!result) {
      throw new Error400(context.dictionary.organization.errors.deleteFailed);
    }

    // Audit log, Stripe cancellation, and cache invalidation handled by beforeDeleteOrganization hook

    return true;
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
