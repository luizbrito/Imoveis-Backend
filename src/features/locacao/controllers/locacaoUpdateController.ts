import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import {
  locacaoUpdateBodyInputSchema,
  locacaoUpdateParamsInputSchema,
} from '../locacaoSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const locacaoUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/locacao/{id}',
  params: locacaoUpdateParamsInputSchema,
  body: locacaoUpdateBodyInputSchema,
  response: 'Locacao',
};

export const locacaoUpdateMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'locacao_update',
  description: dictionary.locacao.mcpDescription.update,
  requiredPermissions: { locacao: ['update'] },
  schema: toMcpJsonSchema(
    z.object({
      id: z.string(),
      data: locacaoUpdateBodyInputSchema,
    }),
  ),
  handler: async (params, context) => {
    return await locacaoUpdateController(
      { id: params.id },
      params.data,
      context,
    );
  },
});

export async function locacaoUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      locacao: ['update'],
    },
    context,
  );

  const { id } = locacaoUpdateParamsInputSchema.parse(params);

  const data = locacaoUpdateBodyInputSchema.parse(body);

  let locacao = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      if (data.updatedAt) {
        const currentLocacao = await tx.locacao.findUnique({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          select: { updatedAt: true },
        });

        if (currentLocacao) {
          const currentUpdatedAt = currentLocacao.updatedAt.toISOString();
          const providedUpdatedAt =
            data.updatedAt instanceof Date
              ? data.updatedAt.toISOString()
              : data.updatedAt;

          if (currentUpdatedAt !== providedUpdatedAt) {
            throw new Error400(context.dictionary.shared.errors.staleData);
          }
        }
      }
      const duplicatedCodigo = await tx.locacao.count({
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
            context.dictionary.locacao.fields.codigo,
          ),
        );
      }

      const oldLocacao = await tx.locacao.findUniqueOrThrow({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          participantes: {
            select: {
              id: true,
              papel: true,
            },
          },
          garantias: {
            select: {
              id: true,
              tipo: true,
            },
          },
          contratos: {
            select: {
              id: true,
              numero: true,
            },
          },
          cobrancas: {
            select: {
              id: true,
              competencia: true,
            },
          },
          reajustes: {
            select: {
              id: true,
              dataBase: true,
            },
          },
          repasses: {
            select: {
              id: true,
              competencia: true,
            },
          },
          comissoes: {
            select: {
              id: true,
              codigo: true,
            },
          },
          solicitacoesManutencao: {
            select: {
              id: true,
              codigo: true,
            },
          },
          despesas: {
            select: {
              id: true,
              descricao: true,
            },
          },
          lancamentosFinanceiros: {
            select: {
              id: true,
              descricao: true,
            },
          },
          seguros: {
            select: {
              id: true,
              numeroApolice: true,
            },
          },
          ocorrencias: {
            select: {
              id: true,
              codigo: true,
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

      await tx.locacao.update({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        data: {
          codigo: data.codigo,
          status: data.status,
          dataInicio: data.dataInicio,
          dataFim: data.dataFim,
          valorAluguel: data.valorAluguel,
          valorCondominio: data.valorCondominio,
          valorIptuMensal: data.valorIptuMensal,
          taxaAdministracaoPercentual: data.taxaAdministracaoPercentual,
          diaVencimento: data.diaVencimento,
          indiceReajuste: data.indiceReajuste,
          periodicidadeReajusteMeses: data.periodicidadeReajusteMeses,
          multaAtrasoPercentual: data.multaAtrasoPercentual,
          jurosMesPercentual: data.jurosMesPercentual,
          observacoes: data.observacoes,
          filial: prismaRelationship.connectOrDisconnectOne(data.filial),
          proposta: prismaRelationship.connectOrDisconnectOne(data.proposta),
          imovel: prismaRelationship.connectOrDisconnectOne(data.imovel),
          proprietario: prismaRelationship.connectOrDisconnectOne(
            data.proprietario,
          ),
          corretor: prismaRelationship.connectOrDisconnectOne(data.corretor),
          updatedByUserId: context.currentUser?.id,
          updatedByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
        },
      });

      const updatedLocacao = await tx.locacao.findUniqueOrThrow({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          participantes: {
            select: {
              id: true,
              papel: true,
            },
          },
          garantias: {
            select: {
              id: true,
              tipo: true,
            },
          },
          contratos: {
            select: {
              id: true,
              numero: true,
            },
          },
          cobrancas: {
            select: {
              id: true,
              competencia: true,
            },
          },
          reajustes: {
            select: {
              id: true,
              dataBase: true,
            },
          },
          repasses: {
            select: {
              id: true,
              competencia: true,
            },
          },
          comissoes: {
            select: {
              id: true,
              codigo: true,
            },
          },
          solicitacoesManutencao: {
            select: {
              id: true,
              codigo: true,
            },
          },
          despesas: {
            select: {
              id: true,
              descricao: true,
            },
          },
          lancamentosFinanceiros: {
            select: {
              id: true,
              descricao: true,
            },
          },
          seguros: {
            select: {
              id: true,
              numeroApolice: true,
            },
          },
          ocorrencias: {
            select: {
              id: true,
              codigo: true,
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
        entityName: 'Locacao',
        operation: auditLogOperations.update,
        context,
        oldData: oldLocacao,
        newData: updatedLocacao,
        tx,
      });

      return updatedLocacao;
    },
  );

  locacao = await filePopulateDownloadUrlInTree(locacao);

  return locacao;
}
