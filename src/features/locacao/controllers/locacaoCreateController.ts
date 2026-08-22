import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { locacaoCreateInputSchema } from '../locacaoSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const locacaoCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/locacao',
  body: locacaoCreateInputSchema,
  response: 'Locacao',
};

export const locacaoCreateMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'locacao_create',
  description: dictionary.locacao.mcpDescription.create,
  requiredPermissions: { locacao: ['create'] },
  schema: toMcpJsonSchema(locacaoCreateInputSchema),
  handler: async (params, context) => {
    return await locacaoCreateController(params, context);
  },
});

export async function locacaoCreateController(
  body: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      locacao: ['create'],
    },
    context,
  );
  return await locacaoCreate(body, context);
}

export async function locacaoCreate(body: unknown, context: AppContext) {
  const currentOrganization = context.currentOrganization!;

  const data = locacaoCreateInputSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const duplicatedCodigo = await tx.locacao.count({
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
            context.dictionary.locacao.fields.codigo,
          ),
        );
      }

      const newLocacao = await tx.locacao.create({
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
          filial: prismaRelationship.connectOneOrThrow(data.filial),
          proposta: prismaRelationship.connectOne(data.proposta),
          imovel: prismaRelationship.connectOneOrThrow(data.imovel),
          proprietario: prismaRelationship.connectOneOrThrow(data.proprietario),
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
        entityId: newLocacao.id,
        entityName: 'Locacao',
        operation: auditLogOperations.create,
        context,
        newData: newLocacao,
        tx,
      });

      const locacao = await filePopulateDownloadUrlInTree(newLocacao);

      return locacao;
    },
  );
}
