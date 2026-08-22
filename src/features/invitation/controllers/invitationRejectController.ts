import { APIError } from 'better-auth';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { Error403 } from '../../../shared/errors/Error403';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryEnumerator } from '../../../translation/dictionaryEnumerator';
import { authBackend } from '../../auth/authBackend';

export const invitationRejectApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/member/invitation/{id}/reject',
  params: z.object({
    id: z.string(),
  }),
  response: 'boolean',
};

export async function invitationRejectController(
  params: unknown,
  context: AppContext,
) {
  if (!context.currentUser) {
    throw new Error403();
  }

  const { id } = z.object({ id: z.string() }).parse(params);

  try {
    const result = await authBackend.api.rejectInvitation({
      body: {
        invitationId: id,
      },
      headers: context.headers,
    });

    if (!result) {
      throw new Error400(context.dictionary.invitation.errors.rejectFailed);
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
