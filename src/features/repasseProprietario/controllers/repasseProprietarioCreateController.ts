import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { repasseProprietarioCreateInputSchema } from '../repasseProprietarioSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const repasseProprietarioCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/repasse-proprietario',
  body: repasseProprietarioCreateInputSchema,
  response: 'RepasseProprietario',
};

export const repasseProprietarioCreateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'repasseProprietario_create',
  description: dictionary.repasseProprietario.mcpDescription.create,
  requiredPermissions: { repasseProprietario: ['create'] },
  schema: toMcpJsonSchema(repasseProprietarioCreateInputSchema),
  handler: async (params, context) => {
    return await repasseProprietarioCreateController(params, context);
  },
});

export async function repasseProprietarioCreateController(
  body: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      repasseProprietario: ['create'],
    },
    context,
  );
  return await repasseProprietarioCreate(body, context);
}

export async function repasseProprietarioCreate(
  body: unknown,
  context: AppContext,
) {
  const currentOrganization = context.currentOrganization!;

  const data = repasseProprietarioCreateInputSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const newRepasseProprietario = await tx.repasseProprietario.create({
        data: {
          competencia: data.competencia,
          dataPrevista: data.dataPrevista,
          dataRepasse: data.dataRepasse,
          status: data.status,
          valorRecebido: data.valorRecebido,
          taxaAdministracao: data.taxaAdministracao,
          despesasDescontadas: data.despesasDescontadas,
          impostosRetidos: data.impostosRetidos,
          valorLiquido: data.valorLiquido,
          comprovante: data.comprovante,
          observacoes: data.observacoes,
          locacao: prismaRelationship.connectOneOrThrow(data.locacao),
          proprietario: prismaRelationship.connectOneOrThrow(data.proprietario),
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
          lancamentosFinanceiros: {
            select: {
              id: true,
              descricao: true,
            },
          },
          locacao: {
            select: {
              id: true,
              codigo: true,
            },
          },
          proprietario: {
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
        entityId: newRepasseProprietario.id,
        entityName: 'RepasseProprietario',
        operation: auditLogOperations.create,
        context,
        newData: newRepasseProprietario,
        tx,
      });

      const repasseProprietario = await filePopulateDownloadUrlInTree(
        newRepasseProprietario,
      );

      return repasseProprietario;
    },
  );
}
