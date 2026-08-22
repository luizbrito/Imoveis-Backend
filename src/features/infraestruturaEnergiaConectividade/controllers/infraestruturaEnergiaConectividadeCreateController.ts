import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { infraestruturaEnergiaConectividadeCreateInputSchema } from '../infraestruturaEnergiaConectividadeSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const infraestruturaEnergiaConectividadeCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/infraestrutura-energia-conectividade',
  body: infraestruturaEnergiaConectividadeCreateInputSchema,
  response: 'InfraestruturaEnergiaConectividade',
};

export const infraestruturaEnergiaConectividadeCreateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'infraestruturaEnergiaConectividade_create',
  description:
    dictionary.infraestruturaEnergiaConectividade.mcpDescription.create,
  requiredPermissions: { infraestruturaEnergiaConectividade: ['create'] },
  schema: toMcpJsonSchema(infraestruturaEnergiaConectividadeCreateInputSchema),
  handler: async (params, context) => {
    return await infraestruturaEnergiaConectividadeCreateController(
      params,
      context,
    );
  },
});

export async function infraestruturaEnergiaConectividadeCreateController(
  body: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      infraestruturaEnergiaConectividade: ['create'],
    },
    context,
  );
  return await infraestruturaEnergiaConectividadeCreate(body, context);
}

export async function infraestruturaEnergiaConectividadeCreate(
  body: unknown,
  context: AppContext,
) {
  const currentOrganization = context.currentOrganization!;

  const data = infraestruturaEnergiaConectividadeCreateInputSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const newInfraestruturaEnergiaConectividade =
        await tx.infraestruturaEnergiaConectividade.create({
          data: {
            descricao: data.descricao,
            energiaDisponivel: data.energiaDisponivel,
            tipoRede: data.tipoRede,
            potenciaInstaladaKva: data.potenciaInstaladaKva,
            quantidadeTransformadores: data.quantidadeTransformadores,
            gerador: data.gerador,
            energiaSolar: data.energiaSolar,
            potenciaSolarKw: data.potenciaSolarKw,
            distanciaRedeEnergiaKm: data.distanciaRedeEnergiaKm,
            internetFibra: data.internetFibra,
            internetRadio: data.internetRadio,
            starlink: data.starlink,
            sinalCelular: data.sinalCelular,
            operadorasDisponiveis: data.operadorasDisponiveis,
            observacoes: data.observacoes,
            imovel: prismaRelationship.connectOneOrThrow(data.imovel),
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
            imovel: {
              select: {
                id: true,
                titulo: true,
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
        entityId: newInfraestruturaEnergiaConectividade.id,
        entityName: 'InfraestruturaEnergiaConectividade',
        operation: auditLogOperations.create,
        context,
        newData: newInfraestruturaEnergiaConectividade,
        tx,
      });

      const infraestruturaEnergiaConectividade =
        await filePopulateDownloadUrlInTree(
          newInfraestruturaEnergiaConectividade,
        );

      return infraestruturaEnergiaConectividade;
    },
  );
}
