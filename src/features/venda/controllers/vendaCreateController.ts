import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { vendaCreateInputSchema } from '../vendaSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const vendaCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/venda',
  body: vendaCreateInputSchema,
  response: 'Venda',
};

export const vendaCreateMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'venda_create',
  description: dictionary.venda.mcpDescription.create,
  requiredPermissions: { venda: ['create'] },
  schema: toMcpJsonSchema(vendaCreateInputSchema),
  handler: async (params, context) => {
    return await vendaCreateController(params, context);
  },
});

export async function vendaCreateController(
  body: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      venda: ['create'],
    },
    context,
  );
  return await vendaCreate(body, context);
}

export async function vendaCreate(body: unknown, context: AppContext) {
  const currentOrganization = context.currentOrganization!;

  const data = vendaCreateInputSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const duplicatedCodigo = await tx.venda.count({
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
            context.dictionary.venda.fields.codigo,
          ),
        );
      }

      const newVenda = await tx.venda.create({
        data: {
          codigo: data.codigo,
          dataVenda: data.dataVenda,
          status: data.status,
          valorVenda: data.valorVenda,
          moeda: data.moeda,
          valorSinal: data.valorSinal,
          valorFinanciado: data.valorFinanciado,
          valorPermuta: data.valorPermuta,
          dataPrevisaoEscritura: data.dataPrevisaoEscritura,
          dataEscritura: data.dataEscritura,
          cartorio: data.cartorio,
          observacoes: data.observacoes,
          filial: prismaRelationship.connectOneOrThrow(data.filial),
          proposta: prismaRelationship.connectOne(data.proposta),
          imovel: prismaRelationship.connectOneOrThrow(data.imovel),
          proprietario: prismaRelationship.connectOneOrThrow(data.proprietario),
          comprador: prismaRelationship.connectOneOrThrow(data.comprador),
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
          contratos: {
            select: {
              id: true,
              numero: true,
            },
          },
          parcelas: {
            select: {
              id: true,
              numeroParcela: true,
            },
          },
          comissoes: {
            select: {
              id: true,
              codigo: true,
            },
          },
          lancamentosFinanceiros: {
            select: {
              id: true,
              descricao: true,
            },
          },
          filial: {
            select: {
              id: true,
              nome: true,
            },
          },
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
          proprietario: {
            select: {
              id: true,
              nomeRazaoSocial: true,
            },
          },
          comprador: {
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
        entityId: newVenda.id,
        entityName: 'Venda',
        operation: auditLogOperations.create,
        context,
        newData: newVenda,
        tx,
      });

      const venda = await filePopulateDownloadUrlInTree(newVenda);

      return venda;
    },
  );
}
