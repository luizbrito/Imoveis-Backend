import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { invitationFindSchema } from '../invitationSchemas';
import { prisma } from '../../../prisma';
import { invitationComputeStatus } from '../invitationComputedStatus';

export const invitationFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/member/invitation/{id}',
  params: invitationFindSchema,
  response: 'Invitation',
};

export async function invitationFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      invitation: ['read'],
    },
    context,
  );

  const { id } = invitationFindSchema.parse(params);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const invitation = await tx.invitation.findFirst({
        where: {
          id,
          organizationId: currentOrganization.id,
        },
        include: {
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!invitation) {
        return null;
      }

      const inviter = await prisma.user.findUnique({
        where: {
          id: invitation.inviterId,
        },
        select: {
          id: true,
          email: true,
          name: true,
        },
      });

      return {
        ...invitation,
        status: invitationComputeStatus(invitation),
        inviter,
      };
    },
  );
}
