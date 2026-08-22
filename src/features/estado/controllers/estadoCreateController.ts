import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { estadoCreateInputSchema } from '../estadoSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const estadoCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/estado',
  body: estadoCreateInputSchema,
  response: 'Estado',
};

export const estadoCreateMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'estado_create',
  description: dictionary.estado.mcpDescription.create,
  requiredPermissions: { estado: ['create'] },
  schema: toMcpJsonSchema(estadoCreateInputSchema),
  handler: async (params, context) => {
    return await estadoCreateController(params, context);
  },
});

export async function estadoCreateController(
  body: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      estado: ['create'],
    },
    context,
  );
  return await estadoCreate(body, context);
}

export async function estadoCreate(body: unknown, context: AppContext) {
  const currentOrganization = context.currentOrganization!;

  const data = estadoCreateInputSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const newEstado = await tx.estado.create({
        data: {
          nome: data.nome,
          sigla: data.sigla,
          codigoOficial: data.codigoOficial,
          tipoDivisao: data.tipoDivisao,
          ativo: data.ativo,
          observacoes: data.observacoes,
          pais: prismaRelationship.connectOneOrThrow(data.pais),
          importHash: data.importHash,
          organization: prismaRelationship.connectOneOrThrow(
            context.currentOrganization!.id,
          ),
          createdByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
          createdByUserId: context.currentUser?.id,
        },
        include: {
          cidades: {
            select: {
              id: true,
              nome: true,
            },
          },
          imoveisEstado: {
            select: {
              id: true,
              titulo: true,
            },
          },
          pais: {
            select: {
              id: true,
              nome: true,
            },
          },
          createdByMember: {
            select: {
              id: true,
              fullName: true,
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
          updatedByMember: {
            select: {
              id: true,
              fullName: true,
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
          archivedByMember: {
            select: {
              id: true,
              fullName: true,
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
        },
      });

      await auditLogCreate({
        entityId: newEstado.id,
        entityName: 'Estado',
        operation: auditLogOperations.create,
        context,
        newData: newEstado,
        tx,
      });

      const estado = await filePopulateDownloadUrlInTree(newEstado);

      return estado;
    },
  );
}
