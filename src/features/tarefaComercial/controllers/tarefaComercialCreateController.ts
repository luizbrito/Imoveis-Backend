import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { tarefaComercialCreateInputSchema } from '../tarefaComercialSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const tarefaComercialCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/tarefa-comercial',
  body: tarefaComercialCreateInputSchema,
  response: 'TarefaComercial',
};

export const tarefaComercialCreateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'tarefaComercial_create',
  description: dictionary.tarefaComercial.mcpDescription.create,
  requiredPermissions: { tarefaComercial: ['create'] },
  schema: toMcpJsonSchema(tarefaComercialCreateInputSchema),
  handler: async (params, context) => {
    return await tarefaComercialCreateController(params, context);
  },
});

export async function tarefaComercialCreateController(
  body: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      tarefaComercial: ['create'],
    },
    context,
  );
  return await tarefaComercialCreate(body, context);
}

export async function tarefaComercialCreate(
  body: unknown,
  context: AppContext,
) {
  const currentOrganization = context.currentOrganization!;

  const data = tarefaComercialCreateInputSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const newTarefaComercial = await tx.tarefaComercial.create({
        data: {
          titulo: data.titulo,
          tipo: data.tipo,
          prioridade: data.prioridade,
          status: data.status,
          dataLimite: data.dataLimite,
          dataConclusao: data.dataConclusao,
          descricao: data.descricao,
          lead: prismaRelationship.connectOne(data.lead),
          corretor: prismaRelationship.connectOneOrThrow(data.corretor),
          cliente: prismaRelationship.connectOne(data.cliente),
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
          lead: {
            select: {
              id: true,
              nome: true,
            },
          },
          corretor: {
            select: {
              id: true,
              nomeCompleto: true,
            },
          },
          cliente: {
            select: {
              id: true,
              nomeRazaoSocial: true,
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
        entityId: newTarefaComercial.id,
        entityName: 'TarefaComercial',
        operation: auditLogOperations.create,
        context,
        newData: newTarefaComercial,
        tx,
      });

      const tarefaComercial =
        await filePopulateDownloadUrlInTree(newTarefaComercial);

      return tarefaComercial;
    },
  );
}
