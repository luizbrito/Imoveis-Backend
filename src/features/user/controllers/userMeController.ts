import { z } from 'zod';
import { prismaDangerouslyBypassRLS } from '../../../prisma';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { Dictionary } from '../../../translation/locales';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { McpTool } from '../../mcp/mcpTypes';

export const userMeApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/user/me',
  response: '{ members: Member[], activeSubscriptions: Subscription[] }',
};

export const userMeMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'user_me',
  description: dictionary.user.mcpDescription.me,
  requiredPermissions: {},
  schema: toMcpJsonSchema(z.object({})),
  handler: async (params, context) => {
    return await userMeController(context);
  },
});

export async function userMeController(context: AppContext) {
  if (!context.currentUser) {
    return {
      members: [],
      activeSubscriptions: [],
    };
  }

  const members = await prismaDangerouslyBypassRLS.member.findMany({
    where: {
      userId: context.currentUser.id,
    },
    include: {
      organization: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const activeSubscriptions =
    await prismaDangerouslyBypassRLS.subscription.findMany({
      where: {
        OR: [
          // User-level subscriptions
          {
            userId: context.currentUser.id,
            organizationId: null,
            status: {
              in: ['active', 'trialing'],
            },
          },
          // Organization-level subscriptions for user's organizations
          {
            organizationId: {
              in: members.map((m) => m.organizationId),
            },
            status: {
              in: ['active', 'trialing'],
            },
          },
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

  return {
    members,
    activeSubscriptions,
  };
}
