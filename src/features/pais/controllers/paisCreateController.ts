import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { paisCreateInputSchema } from '../paisSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const paisCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/pais',
  body: paisCreateInputSchema,
  response: 'Pais',
};

export const paisCreateMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'pais_create',
  description: dictionary.pais.mcpDescription.create,
  requiredPermissions: { pais: ['create'] },
  schema: toMcpJsonSchema(paisCreateInputSchema),
  handler: async (params, context) => {
    return await paisCreateController(params, context);
  },
});

export async function paisCreateController(body: unknown, context: AppContext) {
  await authGuardBackend(
    {
      pais: ['create'],
    },
    context,
  );
  return await paisCreate(body, context);
}

export async function paisCreate(body: unknown, context: AppContext) {
  const currentOrganization = context.currentOrganization!;

  const data = paisCreateInputSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const duplicatedNome = await tx.pais.count({
        where: {
          nome: {
            equals: data.nome,
            mode: 'insensitive',
          },
          organizationId: currentOrganization.id,
        },
      });

      if (duplicatedNome) {
        throw new Error400(
          dictionaryFormat(
            context.dictionary.shared.errors.unique,
            context.dictionary.pais.fields.nome,
          ),
        );
      }
      const duplicatedSigla = await tx.pais.count({
        where: {
          sigla: {
            equals: data.sigla,
            mode: 'insensitive',
          },
          organizationId: currentOrganization.id,
        },
      });

      if (duplicatedSigla) {
        throw new Error400(
          dictionaryFormat(
            context.dictionary.shared.errors.unique,
            context.dictionary.pais.fields.sigla,
          ),
        );
      }

      const newPais = await tx.pais.create({
        data: {
          nome: data.nome,
          sigla: data.sigla,
          codigoTelefone: data.codigoTelefone,
          nacionalidade: data.nacionalidade,
          ativo: data.ativo,
          observacoes: data.observacoes,
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
          estados: {
            select: {
              id: true,
              nome: true,
            },
          },
          imoveisPais: {
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
        entityId: newPais.id,
        entityName: 'Pais',
        operation: auditLogOperations.create,
        context,
        newData: newPais,
        tx,
      });

      const pais = await filePopulateDownloadUrlInTree(newPais);

      return pais;
    },
  );
}
