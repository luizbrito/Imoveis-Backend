import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { visitaCreateInputSchema } from '../visitaSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const visitaCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/visita',
  body: visitaCreateInputSchema,
  response: 'Visita',
};

export const visitaCreateMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'visita_create',
  description: dictionary.visita.mcpDescription.create,
  requiredPermissions: { visita: ['create'] },
  schema: toMcpJsonSchema(visitaCreateInputSchema),
  handler: async (params, context) => {
    return await visitaCreateController(params, context);
  },
});

export async function visitaCreateController(
  body: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      visita: ['create'],
    },
    context,
  );
  return await visitaCreate(body, context);
}

export async function visitaCreate(body: unknown, context: AppContext) {
  const currentOrganization = context.currentOrganization!;

  const data = visitaCreateInputSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const duplicatedCodigo = await tx.visita.count({
        where: {
          codigo: {
            equals: data.codigo,
            mode: 'insensitive',
          },
          organizationId: currentOrganization.id,
        },
      });

      if (duplicatedCodigo) {
        throw new Error400(
          dictionaryFormat(
            context.dictionary.shared.errors.unique,
            context.dictionary.visita.fields.codigo,
          ),
        );
      }

      const newVisita = await tx.visita.create({
        data: {
          codigo: data.codigo,
          dataInicio: data.dataInicio,
          dataFim: data.dataFim,
          status: data.status,
          tipo: data.tipo,
          pontoEncontro: data.pontoEncontro,
          feedbackCliente: data.feedbackCliente,
          interessePosVisita: data.interessePosVisita,
          observacoesInternas: data.observacoesInternas,
          lead: prismaRelationship.connectOne(data.lead),
          cliente: prismaRelationship.connectOneOrThrow(data.cliente),
          imovel: prismaRelationship.connectOneOrThrow(data.imovel),
          corretor: prismaRelationship.connectOneOrThrow(data.corretor),
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
          propostas: {
            select: {
              id: true,
              codigo: true,
            },
          },
          lead: {
            select: {
              id: true,
              nome: true,
            },
          },
          cliente: {
            select: {
              id: true,
              nomeRazaoSocial: true,
            },
          },
          imovel: {
            select: {
              id: true,
              titulo: true,
            },
          },
          corretor: {
            select: {
              id: true,
              nomeCompleto: true,
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
        entityId: newVisita.id,
        entityName: 'Visita',
        operation: auditLogOperations.create,
        context,
        newData: newVisita,
        tx,
      });

      const visita = await filePopulateDownloadUrlInTree(newVisita);

      return visita;
    },
  );
}
