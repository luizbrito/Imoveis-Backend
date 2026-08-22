import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { solicitacaoManutencaoCreateInputSchema } from '../solicitacaoManutencaoSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const solicitacaoManutencaoCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/solicitacao-manutencao',
  body: solicitacaoManutencaoCreateInputSchema,
  response: 'SolicitacaoManutencao',
};

export const solicitacaoManutencaoCreateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'solicitacaoManutencao_create',
  description: dictionary.solicitacaoManutencao.mcpDescription.create,
  requiredPermissions: { solicitacaoManutencao: ['create'] },
  schema: toMcpJsonSchema(solicitacaoManutencaoCreateInputSchema),
  handler: async (params, context) => {
    return await solicitacaoManutencaoCreateController(params, context);
  },
});

export async function solicitacaoManutencaoCreateController(
  body: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      solicitacaoManutencao: ['create'],
    },
    context,
  );
  return await solicitacaoManutencaoCreate(body, context);
}

export async function solicitacaoManutencaoCreate(
  body: unknown,
  context: AppContext,
) {
  const currentOrganization = context.currentOrganization!;

  const data = solicitacaoManutencaoCreateInputSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const duplicatedCodigo = await tx.solicitacaoManutencao.count({
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
            context.dictionary.solicitacaoManutencao.fields.codigo,
          ),
        );
      }

      const newSolicitacaoManutencao = await tx.solicitacaoManutencao.create({
        data: {
          codigo: data.codigo,
          dataAbertura: data.dataAbertura,
          origem: data.origem,
          categoria: data.categoria,
          prioridade: data.prioridade,
          status: data.status,
          titulo: data.titulo,
          descricao: data.descricao,
          imagens: data.imagens,
          responsabilidadeCusto: data.responsabilidadeCusto,
          valorLimiteAutorizado: data.valorLimiteAutorizado,
          dataConclusao: data.dataConclusao,
          imovel: prismaRelationship.connectOneOrThrow(data.imovel),
          locacao: prismaRelationship.connectOne(data.locacao),
          clienteSolicitante: prismaRelationship.connectOne(
            data.clienteSolicitante,
          ),
          corretorResponsavel: prismaRelationship.connectOne(
            data.corretorResponsavel,
          ),
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
          ordensServico: {
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
          locacao: {
            select: {
              id: true,
              codigo: true,
            },
          },
          clienteSolicitante: {
            select: {
              id: true,
              nomeRazaoSocial: true,
            },
          },
          corretorResponsavel: {
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
        entityId: newSolicitacaoManutencao.id,
        entityName: 'SolicitacaoManutencao',
        operation: auditLogOperations.create,
        context,
        newData: newSolicitacaoManutencao,
        tx,
      });

      const solicitacaoManutencao = await filePopulateDownloadUrlInTree(
        newSolicitacaoManutencao,
      );

      return solicitacaoManutencao;
    },
  );
}
