import { Prisma } from '../../../prisma/generated/client';
import { AppContext } from '../../../shared/controller/appContext';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { invitationFindManyInputSchema } from '../invitationSchemas';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { prisma } from '../../../prisma';
import {
  invitationComputeStatus,
  invitationStatusToWhere,
} from '../invitationComputedStatus';

export const invitationFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/member/invitation',
  query: invitationFindManyInputSchema,
  response: '{ invitations: Invitation[], count: number }',
};

export async function invitationFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      invitation: ['read'],
    },
    context,
  );

  let { filter, orderBy, skip, take } =
    invitationFindManyInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.InvitationWhereInput> = [];

      whereAnd.push({
        organizationId: currentOrganization.id,
      });

      if (filter?.email) {
        whereAnd.push({
          email: { contains: filter?.email, mode: 'insensitive' },
        });
      }

      if (filter?.roles?.length) {
        whereAnd.push({
          role: { in: filter.roles },
        });
      }

      if (filter?.statuses?.length) {
        const statusWhere = invitationStatusToWhere(filter.statuses);
        if (statusWhere) {
          whereAnd.push(statusWhere);
        }
      }

      if (filter?.createdAtRange?.length) {
        const start = filter.createdAtRange?.[0];
        const end = filter.createdAtRange?.[1];

        if (start != null) {
          whereAnd.push({
            createdAt: {
              gte: start,
            },
          });
        }

        if (end != null) {
          whereAnd.push({
            createdAt: {
              lte: end,
            },
          });
        }
      }

      const invitations = await tx.invitation.findMany({
        where: {
          AND: whereAnd,
        },
        include: {
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        skip,
        take,
        orderBy: orderBy || { createdAt: 'desc' },
      });

      const count = await tx.invitation.count({
        where: {
          AND: whereAnd,
        },
      });

      const invitationsWithStatus = invitations.map((invitation) => ({
        ...invitation,
        status: invitationComputeStatus(invitation),
      }));

      return { invitations: invitationsWithStatus, count };
    },
  );
}
