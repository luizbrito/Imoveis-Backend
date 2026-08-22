import { APIError } from 'better-auth';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryEnumerator } from '../../../translation/dictionaryEnumerator';
import { authBackend } from '../../auth/authBackend';
import { authGuardBackend } from '../../auth/authGuardBackend';

export const organizationLeaveApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/organization/{id}/leave',
  params: z.object({
    id: z.string(),
  }),
  response: 'boolean',
};

export async function organizationLeaveController(
  params: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      organization: ['read'],
    },
    context,
  );

  const { id } = z.object({ id: z.string() }).parse(params);

  try {
    const result = await authBackend.api.leaveOrganization({
      body: {
        organizationId: id,
      },
      headers: context.headers,
    });

    if (!result) {
      throw new Error400(context.dictionary.organization.errors.leaveFailed);
    }

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
