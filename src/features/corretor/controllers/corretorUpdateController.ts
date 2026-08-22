import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import {
  corretorUpdateBodyInputSchema,
  corretorUpdateParamsInputSchema,
} from '../corretorSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const corretorUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/corretor/{id}',
  params: corretorUpdateParamsInputSchema,
  body: corretorUpdateBodyInputSchema,
  response: 'Corretor',
};

export const corretorUpdateMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'corretor_update',
  description: dictionary.corretor.mcpDescription.update,
  requiredPermissions: { corretor: ['update'] },
  schema: toMcpJsonSchema(
    z.object({
      id: z.string(),
      data: corretorUpdateBodyInputSchema,
    }),
  ),
  handler: async (params, context) => {
    return await corretorUpdateController(
      { id: params.id },
      params.data,
      context,
    );
  },
});

export async function corretorUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      corretor: ['update'],
    },
    context,
  );

  const { id } = corretorUpdateParamsInputSchema.parse(params);

  const data = corretorUpdateBodyInputSchema.parse(body);

  let corretor = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      if (data.updatedAt) {
        const currentCorretor = await tx.corretor.findUnique({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          select: { updatedAt: true },
        });

        if (currentCorretor) {
          const currentUpdatedAt = currentCorretor.updatedAt.toISOString();
          const providedUpdatedAt =
            data.updatedAt instanceof Date
              ? data.updatedAt.toISOString()
              : data.updatedAt;

          if (currentUpdatedAt !== providedUpdatedAt) {
            throw new Error400(context.dictionary.shared.errors.staleData);
          }
        }
      }
      const duplicatedCpfCnpj = await tx.corretor.count({
        where: {
          cpfCnpj: {
            equals: data.cpfCnpj,
            mode: 'insensitive',
          },
          id: { not: id },
          organizationId: currentOrganization.id,
        },
      });

      if (duplicatedCpfCnpj) {
        throw new Error400(
          dictionaryFormat(
            context.dictionary.shared.errors.unique,
            context.dictionary.corretor.fields.cpfCnpj,
          ),
        );
      }
      const duplicatedCreci = await tx.corretor.count({
        where: {
          creci: {
            equals: data.creci,
            mode: 'insensitive',
          },
          id: { not: id },
          organizationId: currentOrganization.id,
        },
      });

      if (duplicatedCreci) {
        throw new Error400(
          dictionaryFormat(
            context.dictionary.shared.errors.unique,
            context.dictionary.corretor.fields.creci,
          ),
        );
      }

      const oldCorretor = await tx.corretor.findUniqueOrThrow({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          imoveisCaptados: {
            select: {
              id: true,
              titulo: true,
            },
          },
          captacoes: {
            select: {
              id: true,
              codigo: true,
            },
          },
          avaliacoesRealizadas: {
            select: {
              id: true,
              codigo: true,
            },
          },
          vistoriasResponsaveis: {
            select: {
              id: true,
              codigo: true,
            },
          },
          anunciosResponsaveis: {
            select: {
              id: true,
              titulo: true,
            },
          },
          leadsResponsaveis: {
            select: {
              id: true,
              nome: true,
            },
          },
          interacoesRealizadas: {
            select: {
              id: true,
              assunto: true,
            },
          },
          tarefasAtribuidas: {
            select: {
              id: true,
              titulo: true,
            },
          },
          visitasConduzidas: {
            select: {
              id: true,
              codigo: true,
            },
          },
          propostasIntermediadas: {
            select: {
              id: true,
              codigo: true,
            },
          },
          reservasGerenciadas: {
            select: {
              id: true,
              codigo: true,
            },
          },
          vendasIntermediadas: {
            select: {
              id: true,
              codigo: true,
            },
          },
          locacoesIntermediadas: {
            select: {
              id: true,
              codigo: true,
            },
          },
          comissoes: {
            select: {
              id: true,
              codigo: true,
            },
          },
          solicitacoesGerenciadas: {
            select: {
              id: true,
              codigo: true,
            },
          },
          documentosPessoais: {
            select: {
              id: true,
              titulo: true,
            },
          },
          solicitacoesAtendidas: {
            select: {
              id: true,
              nome: true,
            },
          },
          ocorrenciasGerenciadas: {
            select: {
              id: true,
              codigo: true,
            },
          },
          contaMembro: {
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
          filial: {
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

      await tx.corretor.update({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        data: {
          nomeCompleto: data.nomeCompleto,
          tipoPessoa: data.tipoPessoa,
          cpfCnpj: data.cpfCnpj,
          creci: data.creci,
          ufCreci: data.ufCreci,
          telefone: data.telefone,
          whatsapp: data.whatsapp,
          email: data.email,
          percentualComissaoPadrao: data.percentualComissaoPadrao,
          especialidades: data.especialidades,
          foto: data.foto,
          ativo: data.ativo,
          observacoes: data.observacoes,
          contaMembro: prismaRelationship.connectOrDisconnectOne(
            data.contaMembro,
          ),
          filial: prismaRelationship.connectOrDisconnectOne(data.filial),
          updatedByUserId: context.currentUser?.id,
          updatedByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
        },
      });

      const updatedCorretor = await tx.corretor.findUniqueOrThrow({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          imoveisCaptados: {
            select: {
              id: true,
              titulo: true,
            },
          },
          captacoes: {
            select: {
              id: true,
              codigo: true,
            },
          },
          avaliacoesRealizadas: {
            select: {
              id: true,
              codigo: true,
            },
          },
          vistoriasResponsaveis: {
            select: {
              id: true,
              codigo: true,
            },
          },
          anunciosResponsaveis: {
            select: {
              id: true,
              titulo: true,
            },
          },
          leadsResponsaveis: {
            select: {
              id: true,
              nome: true,
            },
          },
          interacoesRealizadas: {
            select: {
              id: true,
              assunto: true,
            },
          },
          tarefasAtribuidas: {
            select: {
              id: true,
              titulo: true,
            },
          },
          visitasConduzidas: {
            select: {
              id: true,
              codigo: true,
            },
          },
          propostasIntermediadas: {
            select: {
              id: true,
              codigo: true,
            },
          },
          reservasGerenciadas: {
            select: {
              id: true,
              codigo: true,
            },
          },
          vendasIntermediadas: {
            select: {
              id: true,
              codigo: true,
            },
          },
          locacoesIntermediadas: {
            select: {
              id: true,
              codigo: true,
            },
          },
          comissoes: {
            select: {
              id: true,
              codigo: true,
            },
          },
          solicitacoesGerenciadas: {
            select: {
              id: true,
              codigo: true,
            },
          },
          documentosPessoais: {
            select: {
              id: true,
              titulo: true,
            },
          },
          solicitacoesAtendidas: {
            select: {
              id: true,
              nome: true,
            },
          },
          ocorrenciasGerenciadas: {
            select: {
              id: true,
              codigo: true,
            },
          },
          contaMembro: {
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
          filial: {
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
        entityId: id,
        entityName: 'Corretor',
        operation: auditLogOperations.update,
        context,
        oldData: oldCorretor,
        newData: updatedCorretor,
        tx,
      });

      return updatedCorretor;
    },
  );

  corretor = await filePopulateDownloadUrlInTree(corretor);

  return corretor;
}
