import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import {
  vendaUpdateBodyInputSchema,
  vendaUpdateParamsInputSchema,
} from '../vendaSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const vendaUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/venda/{id}',
  params: vendaUpdateParamsInputSchema,
  body: vendaUpdateBodyInputSchema,
  response: 'Venda',
};

export const vendaUpdateMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'venda_update',
  description: dictionary.venda.mcpDescription.update,
  requiredPermissions: { venda: ['update'] },
  schema: toMcpJsonSchema(
    z.object({
      id: z.string(),
      data: vendaUpdateBodyInputSchema,
    }),
  ),
  handler: async (params, context) => {
    return await vendaUpdateController({ id: params.id }, params.data, context);
  },
});

export async function vendaUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      venda: ['update'],
    },
    context,
  );

  const { id } = vendaUpdateParamsInputSchema.parse(params);

  const data = vendaUpdateBodyInputSchema.parse(body);

  let venda = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      if (data.updatedAt) {
        const currentVenda = await tx.venda.findUnique({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          select: { updatedAt: true },
        });

        if (currentVenda) {
          const currentUpdatedAt = currentVenda.updatedAt.toISOString();
          const providedUpdatedAt =
            data.updatedAt instanceof Date
              ? data.updatedAt.toISOString()
              : data.updatedAt;

          if (currentUpdatedAt !== providedUpdatedAt) {
            throw new Error400(context.dictionary.shared.errors.staleData);
          }
        }
      }
      const duplicatedCodigo = await tx.venda.count({
        where: {
          codigo: {
            equals: data.codigo,
            mode: 'insensitive',
          },
          id: { not: id },
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

      const oldVenda = await tx.venda.findUniqueOrThrow({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
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

      await tx.venda.update({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
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
          filial: prismaRelationship.connectOrDisconnectOne(data.filial),
          proposta: prismaRelationship.connectOrDisconnectOne(data.proposta),
          imovel: prismaRelationship.connectOrDisconnectOne(data.imovel),
          proprietario: prismaRelationship.connectOrDisconnectOne(
            data.proprietario,
          ),
          comprador: prismaRelationship.connectOrDisconnectOne(data.comprador),
          corretor: prismaRelationship.connectOrDisconnectOne(data.corretor),
          updatedByUserId: context.currentUser?.id,
          updatedByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
        },
      });

      const updatedVenda = await tx.venda.findUniqueOrThrow({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
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
        entityId: id,
        entityName: 'Venda',
        operation: auditLogOperations.update,
        context,
        oldData: oldVenda,
        newData: updatedVenda,
        tx,
      });

      return updatedVenda;
    },
  );

  venda = await filePopulateDownloadUrlInTree(venda);

  return venda;
}
