import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { condominioCreateInputSchema } from '../condominioSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const condominioCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/condominio',
  body: condominioCreateInputSchema,
  response: 'Condominio',
};

export const condominioCreateMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'condominio_create',
  description: dictionary.condominio.mcpDescription.create,
  requiredPermissions: { condominio: ['create'] },
  schema: toMcpJsonSchema(condominioCreateInputSchema),
  handler: async (params, context) => {
    return await condominioCreateController(params, context);
  },
});

export async function condominioCreateController(
  body: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      condominio: ['create'],
    },
    context,
  );
  return await condominioCreate(body, context);
}

export async function condominioCreate(body: unknown, context: AppContext) {
  const currentOrganization = context.currentOrganization!;

  const data = condominioCreateInputSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const newCondominio = await tx.condominio.create({
        data: {
          nome: data.nome,
          cnpj: data.cnpj,
          tipo: data.tipo,
          telefoneAdministracao: data.telefoneAdministracao,
          emailAdministracao: data.emailAdministracao,
          logradouro: data.logradouro,
          numero: data.numero,
          bairro: data.bairro,
          cidade: data.cidade,
          uf: data.uf,
          cep: data.cep,
          valorCondominioReferencia: data.valorCondominioReferencia,
          infraestrutura: data.infraestrutura,
          regras: data.regras,
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
          imoveis: {
            select: {
              id: true,
              titulo: true,
            },
          },
          arquivosKml: {
            select: {
              id: true,
              nome: true,
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
        entityId: newCondominio.id,
        entityName: 'Condominio',
        operation: auditLogOperations.create,
        context,
        newData: newCondominio,
        tx,
      });

      const condominio = await filePopulateDownloadUrlInTree(newCondominio);

      return condominio;
    },
  );
}
