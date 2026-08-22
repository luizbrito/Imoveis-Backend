import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { ordemServicoCreateInputSchema } from '../ordemServicoSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const ordemServicoCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/ordem-servico',
  body: ordemServicoCreateInputSchema,
  response: 'OrdemServico',
};

export const ordemServicoCreateMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'ordemServico_create',
  description: dictionary.ordemServico.mcpDescription.create,
  requiredPermissions: { ordemServico: ['create'] },
  schema: toMcpJsonSchema(ordemServicoCreateInputSchema),
  handler: async (params, context) => {
    return await ordemServicoCreateController(params, context);
  },
});

export async function ordemServicoCreateController(
  body: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      ordemServico: ['create'],
    },
    context,
  );
  return await ordemServicoCreate(body, context);
}

export async function ordemServicoCreate(body: unknown, context: AppContext) {
  const currentOrganization = context.currentOrganization!;

  const data = ordemServicoCreateInputSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const duplicatedCodigo = await tx.ordemServico.count({
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
            context.dictionary.ordemServico.fields.codigo,
          ),
        );
      }

      const newOrdemServico = await tx.ordemServico.create({
        data: {
          codigo: data.codigo,
          status: data.status,
          dataEmissao: data.dataEmissao,
          dataAgendada: data.dataAgendada,
          dataConclusao: data.dataConclusao,
          descricaoServico: data.descricaoServico,
          valorOrcado: data.valorOrcado,
          valorAprovado: data.valorAprovado,
          valorFinal: data.valorFinal,
          documentos: data.documentos,
          fotosAntes: data.fotosAntes,
          fotosDepois: data.fotosDepois,
          avaliacaoServico: data.avaliacaoServico,
          solicitacao: prismaRelationship.connectOneOrThrow(data.solicitacao),
          fornecedor: prismaRelationship.connectOneOrThrow(data.fornecedor),
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
          despesas: {
            select: {
              id: true,
              descricao: true,
            },
          },
          solicitacao: {
            select: {
              id: true,
              codigo: true,
            },
          },
          fornecedor: {
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
        entityId: newOrdemServico.id,
        entityName: 'OrdemServico',
        operation: auditLogOperations.create,
        context,
        newData: newOrdemServico,
        tx,
      });

      const ordemServico = await filePopulateDownloadUrlInTree(newOrdemServico);

      return ordemServico;
    },
  );
}
