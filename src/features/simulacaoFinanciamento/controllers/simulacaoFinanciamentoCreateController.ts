import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { simulacaoFinanciamentoCreateInputSchema } from '../simulacaoFinanciamentoSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const simulacaoFinanciamentoCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/simulacao-financiamento',
  body: simulacaoFinanciamentoCreateInputSchema,
  response: 'SimulacaoFinanciamento',
};

export const simulacaoFinanciamentoCreateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'simulacaoFinanciamento_create',
  description: dictionary.simulacaoFinanciamento.mcpDescription.create,
  requiredPermissions: { simulacaoFinanciamento: ['create'] },
  schema: toMcpJsonSchema(simulacaoFinanciamentoCreateInputSchema),
  handler: async (params, context) => {
    return await simulacaoFinanciamentoCreateController(params, context);
  },
});

export async function simulacaoFinanciamentoCreateController(
  body: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      simulacaoFinanciamento: ['create'],
    },
    context,
  );
  return await simulacaoFinanciamentoCreate(body, context);
}

export async function simulacaoFinanciamentoCreate(
  body: unknown,
  context: AppContext,
) {
  const currentOrganization = context.currentOrganization!;

  const data = simulacaoFinanciamentoCreateInputSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const newSimulacaoFinanciamento = await tx.simulacaoFinanciamento.create({
        data: {
          dataSimulacao: data.dataSimulacao,
          valorImovel: data.valorImovel,
          valorEntrada: data.valorEntrada,
          valorFinanciado: data.valorFinanciado,
          prazoMeses: data.prazoMeses,
          taxaJurosAnual: data.taxaJurosAnual,
          sistemaAmortizacao: data.sistemaAmortizacao,
          valorParcelaInicial: data.valorParcelaInicial,
          instituicaoFinanceira: data.instituicaoFinanceira,
          status: data.status,
          observacoes: data.observacoes,
          cliente: prismaRelationship.connectOneOrThrow(data.cliente),
          imovel: prismaRelationship.connectOneOrThrow(data.imovel),
          proposta: prismaRelationship.connectOne(data.proposta),
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
          proposta: {
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
        entityId: newSimulacaoFinanciamento.id,
        entityName: 'SimulacaoFinanciamento',
        operation: auditLogOperations.create,
        context,
        newData: newSimulacaoFinanciamento,
        tx,
      });

      const simulacaoFinanciamento = await filePopulateDownloadUrlInTree(
        newSimulacaoFinanciamento,
      );

      return simulacaoFinanciamento;
    },
  );
}
