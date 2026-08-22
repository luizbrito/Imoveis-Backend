import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import {
  proprietarioUpdateBodyInputSchema,
  proprietarioUpdateParamsInputSchema,
} from '../proprietarioSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const proprietarioUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/proprietario/{id}',
  params: proprietarioUpdateParamsInputSchema,
  body: proprietarioUpdateBodyInputSchema,
  response: 'Proprietario',
};

export const proprietarioUpdateMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'proprietario_update',
  description: dictionary.proprietario.mcpDescription.update,
  requiredPermissions: { proprietario: ['update'] },
  schema: toMcpJsonSchema(
    z.object({
      id: z.string(),
      data: proprietarioUpdateBodyInputSchema,
    }),
  ),
  handler: async (params, context) => {
    return await proprietarioUpdateController(
      { id: params.id },
      params.data,
      context,
    );
  },
});

export async function proprietarioUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      proprietario: ['update'],
    },
    context,
  );

  const { id } = proprietarioUpdateParamsInputSchema.parse(params);

  const data = proprietarioUpdateBodyInputSchema.parse(body);

  let proprietario = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      if (data.updatedAt) {
        const currentProprietario = await tx.proprietario.findUnique({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          select: { updatedAt: true },
        });

        if (currentProprietario) {
          const currentUpdatedAt = currentProprietario.updatedAt.toISOString();
          const providedUpdatedAt =
            data.updatedAt instanceof Date
              ? data.updatedAt.toISOString()
              : data.updatedAt;

          if (currentUpdatedAt !== providedUpdatedAt) {
            throw new Error400(context.dictionary.shared.errors.staleData);
          }
        }
      }
      const duplicatedCpfCnpj = await tx.proprietario.count({
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
            context.dictionary.proprietario.fields.cpfCnpj,
          ),
        );
      }

      const oldProprietario = await tx.proprietario.findUniqueOrThrow({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          imoveis: {
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
          vendasComoProprietario: {
            select: {
              id: true,
              codigo: true,
            },
          },
          locacoes: {
            select: {
              id: true,
              codigo: true,
            },
          },
          repasses: {
            select: {
              id: true,
              competencia: true,
            },
          },
          documentosPessoais: {
            select: {
              id: true,
              titulo: true,
            },
          },
          consentimentos: {
            select: {
              id: true,
              tipo: true,
            },
          },
          contratosAdministracao: {
            select: {
              id: true,
              numero: true,
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

      await tx.proprietario.update({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        data: {
          nomeRazaoSocial: data.nomeRazaoSocial,
          tipoPessoa: data.tipoPessoa,
          cpfCnpj: data.cpfCnpj,
          rgInscricaoEstadual: data.rgInscricaoEstadual,
          telefone: data.telefone,
          whatsapp: data.whatsapp,
          email: data.email,
          logradouro: data.logradouro,
          numero: data.numero,
          complemento: data.complemento,
          bairro: data.bairro,
          cidade: data.cidade,
          uf: data.uf,
          cep: data.cep,
          dadosBancarios: data.dadosBancarios,
          ativo: data.ativo,
          observacoes: data.observacoes,
          filial: prismaRelationship.connectOrDisconnectOne(data.filial),
          updatedByUserId: context.currentUser?.id,
          updatedByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
        },
      });

      const updatedProprietario = await tx.proprietario.findUniqueOrThrow({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          imoveis: {
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
          vendasComoProprietario: {
            select: {
              id: true,
              codigo: true,
            },
          },
          locacoes: {
            select: {
              id: true,
              codigo: true,
            },
          },
          repasses: {
            select: {
              id: true,
              competencia: true,
            },
          },
          documentosPessoais: {
            select: {
              id: true,
              titulo: true,
            },
          },
          consentimentos: {
            select: {
              id: true,
              tipo: true,
            },
          },
          contratosAdministracao: {
            select: {
              id: true,
              numero: true,
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
        entityName: 'Proprietario',
        operation: auditLogOperations.update,
        context,
        oldData: oldProprietario,
        newData: updatedProprietario,
        tx,
      });

      return updatedProprietario;
    },
  );

  proprietario = await filePopulateDownloadUrlInTree(proprietario);

  return proprietario;
}
