import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import {
  filialUpdateBodyInputSchema,
  filialUpdateParamsInputSchema,
} from '../filialSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const filialUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/filial/{id}',
  params: filialUpdateParamsInputSchema,
  body: filialUpdateBodyInputSchema,
  response: 'Filial',
};

export const filialUpdateMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'filial_update',
  description: dictionary.filial.mcpDescription.update,
  requiredPermissions: { filial: ['update'] },
  schema: toMcpJsonSchema(
    z.object({
      id: z.string(),
      data: filialUpdateBodyInputSchema,
    }),
  ),
  handler: async (params, context) => {
    return await filialUpdateController(
      { id: params.id },
      params.data,
      context,
    );
  },
});

export async function filialUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      filial: ['update'],
    },
    context,
  );

  const { id } = filialUpdateParamsInputSchema.parse(params);

  const data = filialUpdateBodyInputSchema.parse(body);

  let filial = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      if (data.updatedAt) {
        const currentFilial = await tx.filial.findUnique({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          select: { updatedAt: true },
        });

        if (currentFilial) {
          const currentUpdatedAt = currentFilial.updatedAt.toISOString();
          const providedUpdatedAt =
            data.updatedAt instanceof Date
              ? data.updatedAt.toISOString()
              : data.updatedAt;

          if (currentUpdatedAt !== providedUpdatedAt) {
            throw new Error400(context.dictionary.shared.errors.staleData);
          }
        }
      }
      const duplicatedCodigo = await tx.filial.count({
        where: {
          codigo: {
            equals: data.codigo,
            mode: 'insensitive',
          },
          id: { not: id },
          organizationId: currentOrganization.id,
        },
      });

      if (duplicatedCodigo) {
        throw new Error400(
          dictionaryFormat(
            context.dictionary.shared.errors.unique,
            context.dictionary.filial.fields.codigo,
          ),
        );
      }

      const oldFilial = await tx.filial.findUniqueOrThrow({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          corretores: {
            select: {
              id: true,
              nomeCompleto: true,
            },
          },
          proprietarios: {
            select: {
              id: true,
              nomeRazaoSocial: true,
            },
          },
          clientes: {
            select: {
              id: true,
              nomeRazaoSocial: true,
            },
          },
          imoveis: {
            select: {
              id: true,
              titulo: true,
            },
          },
          leads: {
            select: {
              id: true,
              nome: true,
            },
          },
          campanhasMarketing: {
            select: {
              id: true,
              nome: true,
            },
          },
          vendas: {
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
          contasFinanceiras: {
            select: {
              id: true,
              nome: true,
            },
          },
          fornecedores: {
            select: {
              id: true,
              nomeRazaoSocial: true,
            },
          },
          captacoesImovel: {
            select: {
              id: true,
              codigo: true,
            },
          },
          lancamentosFinanceiros: {
            select: {
              id: true,
              descricao: true,
            },
          },
          contratosAdministracao: {
            select: {
              id: true,
              numero: true,
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

      await tx.filial.update({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        data: {
          nome: data.nome,
          codigo: data.codigo,
          cnpj: data.cnpj,
          telefone: data.telefone,
          email: data.email,
          logradouro: data.logradouro,
          numero: data.numero,
          complemento: data.complemento,
          bairro: data.bairro,
          cidade: data.cidade,
          uf: data.uf,
          cep: data.cep,
          ativa: data.ativa,
          updatedByUserId: context.currentUser?.id,
          updatedByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
        },
      });

      const updatedFilial = await tx.filial.findUniqueOrThrow({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          corretores: {
            select: {
              id: true,
              nomeCompleto: true,
            },
          },
          proprietarios: {
            select: {
              id: true,
              nomeRazaoSocial: true,
            },
          },
          clientes: {
            select: {
              id: true,
              nomeRazaoSocial: true,
            },
          },
          imoveis: {
            select: {
              id: true,
              titulo: true,
            },
          },
          leads: {
            select: {
              id: true,
              nome: true,
            },
          },
          campanhasMarketing: {
            select: {
              id: true,
              nome: true,
            },
          },
          vendas: {
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
          contasFinanceiras: {
            select: {
              id: true,
              nome: true,
            },
          },
          fornecedores: {
            select: {
              id: true,
              nomeRazaoSocial: true,
            },
          },
          captacoesImovel: {
            select: {
              id: true,
              codigo: true,
            },
          },
          lancamentosFinanceiros: {
            select: {
              id: true,
              descricao: true,
            },
          },
          contratosAdministracao: {
            select: {
              id: true,
              numero: true,
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
        entityName: 'Filial',
        operation: auditLogOperations.update,
        context,
        oldData: oldFilial,
        newData: updatedFilial,
        tx,
      });

      return updatedFilial;
    },
  );

  filial = await filePopulateDownloadUrlInTree(filial);

  return filial;
}
