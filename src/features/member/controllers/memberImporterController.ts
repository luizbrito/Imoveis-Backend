import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { importerOutputSchema } from '../../../shared/schemas/importerSchemas';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { memberImportInputSchema } from '../memberSchemas';
import { invitationCreateController } from '../../invitation/controllers/invitationCreateController';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';

export const memberImportApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/member/importer',
  body: z.array(memberImportInputSchema),
  response: importerOutputSchema,
};

export const memberImporterMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'member_import',
  description: dictionary.member.importer?.title || 'Import members',
  requiredPermissions: { member: ['import'] },
  schema: toMcpJsonSchema(z.array(memberImportInputSchema)),
  handler: async (params, context) => {
    return await memberImporterController(params, context);
  },
});

export async function memberImporterController(
  body: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      member: ['import'],
    },
    context,
  );

  const bodyAsArray = Array.isArray(body) ? body : [body];
  const output: z.output<typeof importerOutputSchema> = [];

  for (let row of bodyAsArray) {
    try {
      const data = memberImportInputSchema.parse(row);

      await invitationCreateController(
        {
          email: data.email,
          role: data.role,
        },
        context,
      );

      output.push({
        _status: 'success',
        _line: (row as any)._line,
      });
    } catch (error: any) {
      output.push({
        _status: 'error',
        _line: (row as any)._line,
        _errorMessages: [error.message],
      });
    }
  }

  return output;
}
