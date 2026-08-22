import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { prisma } from '../../../prisma';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { invalidateMember } from '../../auth/authCache';
import { Error404 } from '../../../shared/errors/Error404';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';

export const memberRestoreApiDoc: RouteConfig = {
  method: 'patch',
  path: '/api/member/{id}/restore',
  params: z.object({
    id: z.string(),
  }),
  response: 'boolean',
};

export const memberRestoreMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'member_restore',
  description: dictionary.member.mcpDescription.restore,
  requiredPermissions: { member: ['create'] },
  schema: {
    type: 'object',
    properties: {
      id: { type: 'string', description: 'Member ID to restore' },
    },
    required: ['id'],
  },
  handler: async (params, context) => {
    return await memberRestoreController(params, context);
  },
});

export async function memberRestoreController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization, currentMember } = await authGuardBackend(
    {
      member: ['create'],
    },
    context,
  );

  const { id } = z.object({ id: z.string() }).parse(params);

  let member;

  await prisma.$withRLS({ organization: currentOrganization }, async (tx) => {
    member = await tx.member.findFirst({
      where: {
        id,
        disabled: true,
      },
    });

    if (!member) {
      throw new Error404(
        context.dictionary.member.errors.disabledMemberNotFound,
      );
    }

    const oldData = { ...member };

    await tx.member.update({
      where: { id },
      data: {
        disabled: false,
        updatedByUserId: context.currentUser?.id,
        updatedByMemberId: currentMember?.id,
      },
    });

    await auditLogCreate({
      entityId: member.id,
      entityName: 'Member',
      operation: auditLogOperations.update,
      organizationId: currentOrganization.id,
      userId: context.currentUser!.id,
      memberId: currentMember!.id,
      oldData,
      newData: { ...member, disabled: false },
      tx,
    });
  });

  await invalidateMember(member!.userId, currentOrganization.id);

  return true;
}
