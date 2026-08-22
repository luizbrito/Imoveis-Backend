import { Prisma } from '../../../prisma/generated/client';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { memberFindManyInputSchema } from '../memberSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { prisma } from '../../../prisma';

export const memberFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/member',
  query: memberFindManyInputSchema,
  response: '{ members: Member[], count: number }',
};

export const memberFindManyMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'member_list',
  description: dictionary.member.mcpDescription.list,
  requiredPermissions: { member: ['read'] },
  schema: toMcpJsonSchema(memberFindManyInputSchema),
  handler: async (params, context) => {
    return await memberFindManyController(params, context);
  },
});

export async function memberFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      member: ['read'],
    },
    context,
  );

  let { filter, orderBy, skip, take } = memberFindManyInputSchema.parse(query);

  // Transform flat user_email sort key to nested Prisma relation syntax
  if (orderBy?.['user_email']) {
    orderBy = {
      user: {
        email: orderBy['user_email'] === 'asc' ? 'asc' : 'desc',
      },
    };
  }

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.MemberWhereInput> = [];

      whereAnd.push({
        organizationId: currentOrganization.id,
      });

      if (filter?.email) {
        whereAnd.push({
          user: { email: { contains: filter?.email, mode: 'insensitive' } },
        });
      }

      if (filter?.fullName) {
        whereAnd.push({
          fullName: { contains: filter?.fullName, mode: 'insensitive' },
        });
      }

      if (filter?.firstName) {
        whereAnd.push({
          firstName: { contains: filter?.firstName, mode: 'insensitive' },
        });
      }

      if (filter?.lastName) {
        whereAnd.push({
          lastName: { contains: filter?.lastName, mode: 'insensitive' },
        });
      }

      if (filter?.roles?.length) {
        whereAnd.push({
          role: { in: filter.roles },
        });
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

      if (filter?.status !== undefined) {
        whereAnd.push({
          disabled: filter.status === 'disabled',
        });
      }

      let members = await tx.member.findMany({
        where: {
          AND: whereAnd,
        },
        include: {
          user: {
            select: {
              email: true,
              emailVerified: true,
            },
          },
          createdByMember: {
            select: {
              id: true,
              fullName: true,
              firstName: true,
              lastName: true,
            },
          },
          updatedByMember: {
            select: {
              id: true,
              fullName: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        skip,
        take,
        orderBy,
      });

      const count = await tx.member.count({
        where: {
          AND: whereAnd,
        },
      });

      members = await filePopulateDownloadUrlInTree(members);

      return { members, count };
    },
  );
}
