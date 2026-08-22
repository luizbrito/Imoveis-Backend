import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { memberUpdateInputSchema } from '../memberSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { z } from 'zod';
import { rolesIds } from '../../permissions';
import { invalidateMember } from '../../auth/authCache';
import { memberCanRemoveAdminWithContext } from '../memberCanRemoveAdmin';
import { prisma } from '../../../prisma';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';

export const memberUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/member/{id}',
  params: z.object({
    id: z.string(),
  }),
  body: memberUpdateInputSchema,
  response: 'Member',
};

export const memberUpdateMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'member_update',
  description: dictionary.member.mcpDescription.update,
  requiredPermissions: { member: ['update'] },
  schema: {
    type: 'object',
    properties: {
      id: { type: 'string', description: 'Member ID' },
      ...toMcpJsonSchema(memberUpdateInputSchema).properties,
    },
    required: ['id'],
  },
  handler: async (params, context) => {
    const { id, ...body } = params;
    return await memberUpdateController({ id }, body, context);
  },
});

export async function memberUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      member: ['update'],
    },
    context,
  );

  const { id } = z.object({ id: z.string() }).parse(params);

  const data = memberUpdateInputSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const oldMember = await tx.member.findUniqueOrThrow({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
          createdByMember: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                },
              },
            },
          },
          updatedByMember: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      if (data.role !== undefined) {
        if (
          context.currentMember?.id === id &&
          oldMember.role === rolesIds.admin &&
          data.role !== rolesIds.admin
        ) {
          throw new Error400(
            context.dictionary.member.errors.cannotRemoveSelfAdminRole,
          );
        }

        // Verify member isn't subscription owner before removing admin role
        if (oldMember.role === rolesIds.admin && data.role !== rolesIds.admin) {
          await memberCanRemoveAdminWithContext(oldMember, context);
        }
      }

      let fullName = oldMember.fullName;
      if (data.firstName !== undefined || data.lastName !== undefined) {
        const firstName = data.firstName ?? oldMember.firstName;
        const lastName = data.lastName ?? oldMember.lastName;
        fullName = [firstName, lastName].filter(Boolean).join(' ');
      }

      let member = await tx.member.update({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        data: {
          ...(data.firstName !== undefined && { firstName: data.firstName }),
          ...(data.lastName !== undefined && { lastName: data.lastName }),
          ...(data.avatars !== undefined && { avatars: data.avatars }),
          ...(data.role !== undefined && { role: data.role }),
          fullName,
          updatedByUserId: context.currentUser?.id,
          updatedByMemberId: context.currentMember?.id,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
          createdByMember: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                },
              },
            },
          },
          updatedByMember: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      await auditLogCreate({
        entityId: id,
        entityName: 'Member',
        operation: auditLogOperations.update,
        context,
        oldData: oldMember,
        newData: member,
        tx,
      });

      await invalidateMember(member.userId, currentOrganization.id);

      member = await filePopulateDownloadUrlInTree(member);

      return member;
    },
  );
}
