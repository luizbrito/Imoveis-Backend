import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { seguroImovelCreateInputSchema } from '../seguroImovelSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const seguroImovelCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/seguro-imovel',
  body: seguroImovelCreateInputSchema,
  response: 'SeguroImovel',
};

export const seguroImovelCreateMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'seguroImovel_create',
  description: dictionary.seguroImovel.mcpDescription.create,
  requiredPermissions: { seguroImovel: ['create'] },
  schema: toMcpJsonSchema(seguroImovelCreateInputSchema),
  handler: async (params, context) => {
    return await seguroImovelCreateController(params, context);
  },
});

export async function seguroImovelCreateController(
  body: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      seguroImovel: ['create'],
    },
    context,
  );
  return await seguroImovelCreate(body, context);
}

export async function seguroImovelCreate(body: unknown, context: AppContext) {
  const currentOrganization = context.currentOrganization!;

  const data = seguroImovelCreateInputSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const duplicatedNumeroApolice = await tx.seguroImovel.count({
        where: {
          numeroApolice: {
            equals: data.numeroApolice,
            mode: 'insensitive',
          },
          organizationId: currentOrganization.id,
        },
      });

      if (duplicatedNumeroApolice) {
        throw new Error400(
          dictionaryFormat(
            context.dictionary.shared.errors.unique,
            context.dictionary.seguroImovel.fields.numeroApolice,
          ),
        );
      }

      const newSeguroImovel = await tx.seguroImovel.create({
        data: {
          tipo: data.tipo,
          seguradora: data.seguradora,
          numeroApolice: data.numeroApolice,
          dataInicio: data.dataInicio,
          dataFim: data.dataFim,
          valorPremio: data.valorPremio,
          valorCobertura: data.valorCobertura,
          status: data.status,
          documentos: data.documentos,
          observacoes: data.observacoes,
          imovel: prismaRelationship.connectOneOrThrow(data.imovel),
          locacao: prismaRelationship.connectOne(data.locacao),
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
          imovel: {
            select: {
              id: true,
              titulo: true,
            },
          },
          locacao: {
            select: {
              id: true,
              codigo: true,
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
        entityId: newSeguroImovel.id,
        entityName: 'SeguroImovel',
        operation: auditLogOperations.create,
        context,
        newData: newSeguroImovel,
        tx,
      });

      const seguroImovel = await filePopulateDownloadUrlInTree(newSeguroImovel);

      return seguroImovel;
    },
  );
}
