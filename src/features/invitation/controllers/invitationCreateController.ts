import { APIError } from 'better-auth';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryEnumerator } from '../../../translation/dictionaryEnumerator';
import { authBackend } from '../../auth/authBackend';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { invitationCreateInputSchema } from '../invitationSchemas';

export const invitationCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/member/invite',
  body: invitationCreateInputSchema,
  response: 'Invitation',
};

export async function invitationCreateController(
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      member: ['create'],
    },
    context,
  );

  const data = invitationCreateInputSchema.parse(body);

  try {
    const result = await authBackend.api.createInvitation({
      body: {
        email: data.email,
        role: data.role,
        organizationId: currentOrganization.id,
      },
      headers: context.headers,
    });

    if (!result) {
      throw new Error400(context.dictionary.invitation.errors.createFailed);
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
