import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { filialCreateInputSchema } from '../filialSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const filialCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/filial',
  body: filialCreateInputSchema,
  response: 'Filial',
};

export const filialCreateMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'filial_create',
  description: dictionary.filial.mcpDescription.create,
  requiredPermissions: { filial: ['create'] },
  schema: toMcpJsonSchema(filialCreateInputSchema),
  handler: async (params, context) => {
    return await filialCreateController(params, context);
  },
});

export async function filialCreateController(
  body: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      filial: ['create'],
    },
    context,
  );
  return await filialCreate(body, context);
}

export async function filialCreate(body: unknown, context: AppContext) {
  const currentOrganization = context.currentOrganization!;

  const data = filialCreateInputSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const duplicatedCodigo = await tx.filial.count({
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
            context.dictionary.filial.fields.codigo,
          ),
        );
      }

      const newFilial = await tx.filial.create({
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
        entityId: newFilial.id,
        entityName: 'Filial',
        operation: auditLogOperations.create,
        context,
        newData: newFilial,
        tx,
      });

      const filial = await filePopulateDownloadUrlInTree(newFilial);

      return filial;
    },
  );
}
