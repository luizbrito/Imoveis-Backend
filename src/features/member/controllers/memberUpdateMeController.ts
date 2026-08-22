import { z } from 'zod';
import { prismaDangerouslyBypassRLS } from '../../../prisma';
import { AppContext } from '../../../shared/controller/appContext';
import { Error403 } from '../../../shared/errors/Error403';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { invalidateMember } from '../../auth/authCache';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { memberUpdateMeInputSchema } from '../memberSchemas';

export const memberUpdateMeApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/member/me',
  body: memberUpdateMeInputSchema,
  response: 'Member',
};

export async function memberUpdateMeController(
  data: z.input<typeof memberUpdateMeInputSchema>,
  context: AppContext,
) {
  if (!context.currentMember) {
    throw new Error403();
  }

  return await prismaDangerouslyBypassRLS.$transaction(async (tx) => {
    const oldMember = await tx.member.findUniqueOrThrow({
      where: {
        id: context.currentMember!.id,
      },
    });

    let fullName = '';
    if (data.firstName || data.lastName) {
      fullName = [data.firstName, data.lastName].filter(Boolean).join(' ');
    }

    await tx.member.update({
      where: {
        id: context.currentMember!.id,
      },
      data: {
        fullName,
        firstName: data.firstName,
        lastName: data.lastName,
        avatars: data.avatars || [],
        updatedByUserId: context.currentUser?.id,
        updatedByMemberId: context.currentMember?.id,
      },
    });

    const updatedMember = await tx.member.findUniqueOrThrow({
      where: {
        id: context.currentMember!.id,
      },
    });

    await auditLogCreate({
      entityId: context.currentMember!.id,
      entityName: 'Member',
      operation: auditLogOperations.update,
      context,
      oldData: oldMember,
      newData: updatedMember,
      tx,
    });

    await invalidateMember(
      context.currentUser!.id,
      context.currentOrganization!.id,
    );

    let member = await filePopulateDownloadUrlInTree(updatedMember);

    return member;
  });
}
