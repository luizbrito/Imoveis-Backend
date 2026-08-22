import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { prisma } from '../../../prisma';
import { memberCanRemoveAdminWithContext } from '../memberCanRemoveAdmin';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { subscriptionCancelOnStripe } from '../../subscription/subscriptionCancelOnStripe';
import { invalidateMember } from '../../auth/authCache';
import { Error404 } from '../../../shared/errors/Error404';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';

export const memberDisableApiDoc: RouteConfig = {
  method: 'patch',
  path: '/api/member/{id}/disable',
  params: z.object({
    id: z.string(),
  }),
  response: 'boolean',
};

export const memberDisableMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'member_disable',
  description: dictionary.member.mcpDescription.disable,
  requiredPermissions: { member: ['delete'] },
  schema: {
    type: 'object',
    properties: {
      id: { type: 'string', description: 'Member ID to disable' },
    },
    required: ['id'],
  },
  handler: async (params, context) => {
    return await memberDisableController(params, context);
  },
});

export async function memberDisableController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization, currentMember } = await authGuardBackend(
    {
      member: ['delete'],
    },
    context,
  );

  const { id } = z.object({ id: z.string() }).parse(params);

  let member;

  await prisma.$withRLS({ organization: currentOrganization }, async (tx) => {
    member = await tx.member.findFirst({
      where: {
        id,
      },
    });

    if (!member) {
      throw new Error404(context.dictionary.member.errors.notFound);
    }

    await memberCanRemoveAdminWithContext(member, context);

    const oldData = { ...member };

    await tx.member.update({
      where: { id },
      data: {
        disabled: true,
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
      newData: { ...member, disabled: true },
      tx,
    });
  });

  await invalidateMember(member!.userId, currentOrganization.id);

  await subscriptionCancelOnStripe({
    organizationId: currentOrganization.id,
    userId: member!.userId,
  });

  return true;
}
