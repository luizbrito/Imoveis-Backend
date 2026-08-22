import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { vistoriaCreateInputSchema } from '../vistoriaSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const vistoriaCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/vistoria',
  body: vistoriaCreateInputSchema,
  response: 'Vistoria',
};

export const vistoriaCreateMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'vistoria_create',
  description: dictionary.vistoria.mcpDescription.create,
  requiredPermissions: { vistoria: ['create'] },
  schema: toMcpJsonSchema(vistoriaCreateInputSchema),
  handler: async (params, context) => {
    return await vistoriaCreateController(params, context);
  },
});

export async function vistoriaCreateController(
  body: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      vistoria: ['create'],
    },
    context,
  );
  return await vistoriaCreate(body, context);
}

export async function vistoriaCreate(body: unknown, context: AppContext) {
  const currentOrganization = context.currentOrganization!;

  const data = vistoriaCreateInputSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const duplicatedCodigo = await tx.vistoria.count({
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
            context.dictionary.vistoria.fields.codigo,
          ),
        );
      }

      const newVistoria = await tx.vistoria.create({
        data: {
          codigo: data.codigo,
          tipo: data.tipo,
          dataAgendada: data.dataAgendada,
          dataRealizada: data.dataRealizada,
          status: data.status,
          responsavelNome: data.responsavelNome,
          assinaturaResponsavel: data.assinaturaResponsavel,
          parecerGeral: data.parecerGeral,
          imovel: prismaRelationship.connectOneOrThrow(data.imovel),
          corretor: prismaRelationship.connectOne(data.corretor),
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
          itens: {
            select: {
              id: true,
              item: true,
            },
          },
          imovel: {
            select: {
              id: true,
              titulo: true,
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
        entityId: newVistoria.id,
        entityName: 'Vistoria',
        operation: auditLogOperations.create,
        context,
        newData: newVistoria,
        tx,
      });

      const vistoria = await filePopulateDownloadUrlInTree(newVistoria);

      return vistoria;
    },
  );
}
