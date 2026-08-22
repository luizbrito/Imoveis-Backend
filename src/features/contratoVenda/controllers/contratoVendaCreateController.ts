import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { contratoVendaCreateInputSchema } from '../contratoVendaSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const contratoVendaCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/contrato-venda',
  body: contratoVendaCreateInputSchema,
  response: 'ContratoVenda',
};

export const contratoVendaCreateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'contratoVenda_create',
  description: dictionary.contratoVenda.mcpDescription.create,
  requiredPermissions: { contratoVenda: ['create'] },
  schema: toMcpJsonSchema(contratoVendaCreateInputSchema),
  handler: async (params, context) => {
    return await contratoVendaCreateController(params, context);
  },
});

export async function contratoVendaCreateController(
  body: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      contratoVenda: ['create'],
    },
    context,
  );
  return await contratoVendaCreate(body, context);
}

export async function contratoVendaCreate(body: unknown, context: AppContext) {
  const currentOrganization = context.currentOrganization!;

  const data = contratoVendaCreateInputSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const duplicatedNumero = await tx.contratoVenda.count({
        where: {
          numero: {
            equals: data.numero,
            mode: 'insensitive',
          },
          organizationId: currentOrganization.id,
        },
      });

      if (duplicatedNumero) {
        throw new Error400(
          dictionaryFormat(
            context.dictionary.shared.errors.unique,
            context.dictionary.contratoVenda.fields.numero,
          ),
        );
      }

      const newContratoVenda = await tx.contratoVenda.create({
        data: {
          numero: data.numero,
          tipo: data.tipo,
          status: data.status,
          dataEmissao: data.dataEmissao,
          dataAssinatura: data.dataAssinatura,
          dataRegistro: data.dataRegistro,
          arquivos: data.arquivos,
          assinaturaEletronicaId: data.assinaturaEletronicaId,
          observacoes: data.observacoes,
          venda: prismaRelationship.connectOneOrThrow(data.venda),
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
          venda: {
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
        entityId: newContratoVenda.id,
        entityName: 'ContratoVenda',
        operation: auditLogOperations.create,
        context,
        newData: newContratoVenda,
        tx,
      });

      const contratoVenda =
        await filePopulateDownloadUrlInTree(newContratoVenda);

      return contratoVenda;
    },
  );
}
