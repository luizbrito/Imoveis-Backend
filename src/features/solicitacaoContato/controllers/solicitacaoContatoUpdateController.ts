import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import {
  solicitacaoContatoUpdateBodyInputSchema,
  solicitacaoContatoUpdateParamsInputSchema,
} from '../solicitacaoContatoSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const solicitacaoContatoUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/solicitacao-contato/{id}',
  params: solicitacaoContatoUpdateParamsInputSchema,
  body: solicitacaoContatoUpdateBodyInputSchema,
  response: 'SolicitacaoContato',
};

export const solicitacaoContatoUpdateMcpTool = (
  dictionary: Dictionary,
): McpTool => ({
  name: 'solicitacaoContato_update',
  description: dictionary.solicitacaoContato.mcpDescription.update,
  requiredPermissions: { solicitacaoContato: ['update'] },
  schema: toMcpJsonSchema(
    z.object({
      id: z.string(),
      data: solicitacaoContatoUpdateBodyInputSchema,
    }),
  ),
  handler: async (params, context) => {
    return await solicitacaoContatoUpdateController(
      { id: params.id },
      params.data,
      context,
    );
  },
});

export async function solicitacaoContatoUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      solicitacaoContato: ['update'],
    },
    context,
  );

  const { id } = solicitacaoContatoUpdateParamsInputSchema.parse(params);

  const data = solicitacaoContatoUpdateBodyInputSchema.parse(body);

  let solicitacaoContato = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      if (data.updatedAt) {
        const currentSolicitacaoContato =
          await tx.solicitacaoContato.findUnique({
            where: {
              id_organizationId: {
                id,
                organizationId: currentOrganization.id,
              },
            },
            select: { updatedAt: true },
          });

        if (currentSolicitacaoContato) {
          const currentUpdatedAt =
            currentSolicitacaoContato.updatedAt.toISOString();
          const providedUpdatedAt =
            data.updatedAt instanceof Date
              ? data.updatedAt.toISOString()
              : data.updatedAt;

          if (currentUpdatedAt !== providedUpdatedAt) {
            throw new Error400(context.dictionary.shared.errors.staleData);
          }
        }
      }

      const oldSolicitacaoContato =
        await tx.solicitacaoContato.findUniqueOrThrow({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          include: {
            imovel: {
              select: {
                id: true,
                titulo: true,
              },
            },
            anuncio: {
              select: {
                id: true,
                titulo: true,
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

      await tx.solicitacaoContato.update({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        data: {
          nome: data.nome,
          telefone: data.telefone,
          email: data.email,
          canalOrigem: data.canalOrigem,
          dataHora: data.dataHora,
          status: data.status,
          mensagem: data.mensagem,
          consentiuContato: data.consentiuContato,
          imovel: prismaRelationship.connectOrDisconnectOne(data.imovel),
          anuncio: prismaRelationship.connectOrDisconnectOne(data.anuncio),
          corretorResponsavel: prismaRelationship.connectOrDisconnectOne(
            data.corretorResponsavel,
          ),
          updatedByUserId: context.currentUser?.id,
          updatedByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
        },
      });

      const updatedSolicitacaoContato =
        await tx.solicitacaoContato.findUniqueOrThrow({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          include: {
            imovel: {
              select: {
                id: true,
                titulo: true,
              },
            },
            anuncio: {
              select: {
                id: true,
                titulo: true,
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
        entityId: id,
        entityName: 'SolicitacaoContato',
        operation: auditLogOperations.update,
        context,
        oldData: oldSolicitacaoContato,
        newData: updatedSolicitacaoContato,
        tx,
      });

      return updatedSolicitacaoContato;
    },
  );

  solicitacaoContato = await filePopulateDownloadUrlInTree(solicitacaoContato);

  return solicitacaoContato;
}
