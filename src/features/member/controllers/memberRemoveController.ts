import { APIError } from 'better-auth';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryEnumerator } from '../../../translation/dictionaryEnumerator';
import { authBackend } from '../../auth/authBackend';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { McpTool } from '../../mcp/mcpTypes';
import { Dictionary } from '../../../translation/locales';

export const memberRemoveApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/member/{id}',
  params: z.object({
    id: z.string(),
  }),
  response: 'boolean',
};

export const memberRemoveMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'member_remove',
  description: dictionary.member.mcpDescription.remove,
  requiredPermissions: { member: ['delete'] },
  schema: {
    type: 'object',
    properties: {
      id: { type: 'string', description: 'Member ID to permanently remove' },
    },
    required: ['id'],
  },
  handler: async (params, context) => {
    return await memberRemoveController(params, context);
  },
});

export async function memberRemoveController(
  params: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      member: ['delete'],
    },
    context,
  );

  const { id } = z.object({ id: z.string() }).parse(params);

  try {
    const result = await authBackend.api.removeMember({
      body: {
        memberIdOrEmail: id,
        organizationId: currentOrganization.id,
      },
      headers: context.headers,
    });

    if (!result) {
      throw new Error400(context.dictionary.member.errors.removeFailed);
    }

    return true;
  } catch (error) {
    if (error instanceof APIError) {
      throw new Error400(
        dictionaryEnumerator(
          context.dictionary.auth.errors,
          error.body?.code,
        ) ||
          error?.body?.message ||
          context.dictionary.shared.errors.unknown,
      );
    }

    throw error;
  }
}
