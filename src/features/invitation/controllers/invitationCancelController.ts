import { APIError } from 'better-auth';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { dictionaryEnumerator } from '../../../translation/dictionaryEnumerator';
import { authBackend } from '../../auth/authBackend';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { invitationCancelInputSchema } from '../invitationSchemas';
import { RouteConfig } from '../../../shared/openapi/routeToPath';

export const invitationCancelApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/member/invitation/cancel',
  body: invitationCancelInputSchema,
  response: '{ success: boolean }',
};

export async function invitationCancelController(
  body: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      invitation: ['cancel'],
    },
    context,
  );

  const { id } = invitationCancelInputSchema.parse(body);

  try {
    const result = await authBackend.api.cancelInvitation({
      body: {
        invitationId: id,
      },
      headers: context.headers,
    });

    if (!result) {
      throw new Error400(context.dictionary.invitation.errors.cancelFailed);
    }

    return { success: true };
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
