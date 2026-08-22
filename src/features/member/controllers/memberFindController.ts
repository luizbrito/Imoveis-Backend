import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { memberFindSchema } from '../memberSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const memberFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/member/{id}',
  params: memberFindSchema,
  response: 'Member',
};

export const memberFindMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'member_find',
  description: dictionary.member.mcpDescription.get,
  requiredPermissions: { member: ['read'] },
  schema: toMcpJsonSchema(memberFindSchema),
  handler: async (params, context) => {
    return await memberFindController(params, context);
  },
});

export async function memberFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      member: ['read'],
    },
    context,
  );

  const { id } = memberFindSchema.parse(params);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      let member = await tx.member.findUnique({
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

      member = await filePopulateDownloadUrlInTree(member);

      return member;
    },
  );
}
