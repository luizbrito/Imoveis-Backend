import { Prisma } from '../../../prisma/generated/client';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { prisma } from '../../../prisma';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { Dictionary } from '../../../translation/locales';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { McpTool } from '../../mcp/mcpTypes';
import {
  memberAutocompleteInputSchema,
  memberAutocompleteOutputSchema,
} from '../memberSchemas';

export const memberAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/member/autocomplete',
  query: memberAutocompleteInputSchema,
  response: z.array(memberAutocompleteOutputSchema),
};

export const memberAutocompleteMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'member_autocomplete',
  description: dictionary.member.mcpDescription.autocomplete,
  requiredPermissions: { member: ['autocomplete'] },
  schema: toMcpJsonSchema(memberAutocompleteInputSchema),
  handler: async (params, context) => {
    return await memberAutocompleteController(params, context);
  },
});

export async function memberAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      member: ['autocomplete'],
    },
    context,
  );

  const { search, exclude, take, orderBy } =
    memberAutocompleteInputSchema.parse(query);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const whereAnd: Array<Prisma.MemberWhereInput> = [];

      whereAnd.push({
        organizationId: currentOrganization.id,
      });

      if (exclude) {
        whereAnd.push({
          id: {
            notIn: exclude,
          },
        });
      }

      if (search) {
        whereAnd.push({
          OR: [
            {
              fullName: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              firstName: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              lastName: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              user: {
                email: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            },
          ],
        });
      }

      whereAnd.push({
        disabled: false,
      });

      let members = await tx.member.findMany({
        where: {
          AND: whereAnd,
        },
        take,
        orderBy,
        include: {
          user: {
            select: {
              email: true,
            },
          },
        },
      });

      return members.map((member) => {
        return {
          id: member.id,
          fullName: member.fullName,
          firstName: member.firstName,
          lastName: member.lastName,
          email: member.user.email,
          avatars: member.avatars,
        };
      });
    },
  );
}
