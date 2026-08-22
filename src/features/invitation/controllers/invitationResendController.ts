import { APIError } from 'better-auth';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { Error404 } from '../../../shared/errors/Error404';
import { dictionaryEnumerator } from '../../../translation/dictionaryEnumerator';
import { authBackend } from '../../auth/authBackend';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { rolesIds } from '../../permissions';
import { invitationResendInputSchema } from '../invitationSchemas';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { prisma } from '../../../prisma';

export const invitationResendApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/member/invitation/resend',
  body: invitationResendInputSchema,
  response: '{ success: boolean }',
};

export async function invitationResendController(
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      invitation: ['resend'],
    },
    context,
  );

  const { id } = invitationResendInputSchema.parse(body);

  const invitation = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      return await tx.invitation.findFirst({
        where: {
          id,
          organizationId: currentOrganization.id,
        },
      });
    },
  );

  if (!invitation) {
    throw new Error404();
  }

  try {
    // Better Auth extends expiration and triggers email on resend: true
    const result = await authBackend.api.createInvitation({
      body: {
        email: invitation.email,
        role: invitation.role as keyof typeof rolesIds,
        organizationId: currentOrganization.id,
        resend: true,
      },
      headers: context.headers,
    });

    if (!result) {
      throw new Error400(context.dictionary.invitation.errors.resendFailed);
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
