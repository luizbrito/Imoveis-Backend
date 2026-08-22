import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { reservaImovelCreateInputSchema } from '../reservaImovelSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const reservaImovelCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/reserva-imovel',
  body: reservaImovelCreateInputSchema,
  response: 'ReservaImovel',
};

export const reservaImovelCreateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'reservaImovel_create',
  description: dictionary.reservaImovel.mcpDescription.create,
  requiredPermissions: { reservaImovel: ['create'] },
  schema: toMcpJsonSchema(reservaImovelCreateInputSchema),
  handler: async (params, context) => {
    return await reservaImovelCreateController(params, context);
  },
});

export async function reservaImovelCreateController(
  body: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      reservaImovel: ['create'],
    },
    context,
  );
  return await reservaImovelCreate(body, context);
}

export async function reservaImovelCreate(body: unknown, context: AppContext) {
  const currentOrganization = context.currentOrganization!;

  const data = reservaImovelCreateInputSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const duplicatedCodigo = await tx.reservaImovel.count({
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
            context.dictionary.reservaImovel.fields.codigo,
          ),
        );
      }

      const newReservaImovel = await tx.reservaImovel.create({
        data: {
          codigo: data.codigo,
          dataInicio: data.dataInicio,
          dataFim: data.dataFim,
          status: data.status,
          valorSinal: data.valorSinal,
          formaPagamentoSinal: data.formaPagamentoSinal,
          comprovante: data.comprovante,
          observacoes: data.observacoes,
          proposta: prismaRelationship.connectOne(data.proposta),
          imovel: prismaRelationship.connectOneOrThrow(data.imovel),
          cliente: prismaRelationship.connectOneOrThrow(data.cliente),
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
          proposta: {
            select: {
              id: true,
              codigo: true,
            },
          },
          imovel: {
            select: {
              id: true,
              titulo: true,
            },
          },
          cliente: {
            select: {
              id: true,
              nomeRazaoSocial: true,
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
        entityId: newReservaImovel.id,
        entityName: 'ReservaImovel',
        operation: auditLogOperations.create,
        context,
        newData: newReservaImovel,
        tx,
      });

      const reservaImovel =
        await filePopulateDownloadUrlInTree(newReservaImovel);

      return reservaImovel;
    },
  );
}
