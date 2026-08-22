import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import {
  clienteUpdateBodyInputSchema,
  clienteUpdateParamsInputSchema,
} from '../clienteSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const clienteUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/cliente/{id}',
  params: clienteUpdateParamsInputSchema,
  body: clienteUpdateBodyInputSchema,
  response: 'Cliente',
};

export const clienteUpdateMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'cliente_update',
  description: dictionary.cliente.mcpDescription.update,
  requiredPermissions: { cliente: ['update'] },
  schema: toMcpJsonSchema(
    z.object({
      id: z.string(),
      data: clienteUpdateBodyInputSchema,
    }),
  ),
  handler: async (params, context) => {
    return await clienteUpdateController(
      { id: params.id },
      params.data,
      context,
    );
  },
});

export async function clienteUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      cliente: ['update'],
    },
    context,
  );

  const { id } = clienteUpdateParamsInputSchema.parse(params);

  const data = clienteUpdateBodyInputSchema.parse(body);

  let cliente = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      if (data.updatedAt) {
        const currentCliente = await tx.cliente.findUnique({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          select: { updatedAt: true },
        });

        if (currentCliente) {
          const currentUpdatedAt = currentCliente.updatedAt.toISOString();
          const providedUpdatedAt =
            data.updatedAt instanceof Date
              ? data.updatedAt.toISOString()
              : data.updatedAt;

          if (currentUpdatedAt !== providedUpdatedAt) {
            throw new Error400(context.dictionary.shared.errors.staleData);
          }
        }
      }
      const duplicatedCpfCnpj = await tx.cliente.count({
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
            context.dictionary.cliente.fields.cpfCnpj,
          ),
        );
      }

      const oldCliente = await tx.cliente.findUniqueOrThrow({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          historicoLeads: {
            select: {
              id: true,
              nome: true,
            },
          },
          tarefasRelacionadas: {
            select: {
              id: true,
              titulo: true,
            },
          },
          visitas: {
            select: {
              id: true,
              codigo: true,
            },
          },
          propostas: {
            select: {
              id: true,
              codigo: true,
            },
          },
          reservas: {
            select: {
              id: true,
              codigo: true,
            },
          },
          compras: {
            select: {
              id: true,
              codigo: true,
            },
          },
          participacoesLocacao: {
            select: {
              id: true,
              papel: true,
            },
          },
          solicitacoesAbertas: {
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
          consentimentos: {
            select: {
              id: true,
              tipo: true,
            },
          },
          favoritos: {
            select: {
              id: true,
              dataInclusao: true,
            },
          },
          simulacoesFinanciamento: {
            select: {
              id: true,
              dataSimulacao: true,
            },
          },
          ocorrenciasReportadas: {
            select: {
              id: true,
              codigo: true,
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

      await tx.cliente.update({
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
          dataNascimento: data.dataNascimento,
          telefone: data.telefone,
          whatsapp: data.whatsapp,
          email: data.email,
          profissao: data.profissao,
          rendaMensal: data.rendaMensal,
          finalidades: data.finalidades,
          tiposInteresse: data.tiposInteresse,
          faixaValorMinimo: data.faixaValorMinimo,
          faixaValorMaximo: data.faixaValorMaximo,
          cidadeInteresse: data.cidadeInteresse,
          bairrosInteresse: data.bairrosInteresse,
          canalPreferido: data.canalPreferido,
          ativo: data.ativo,
          observacoes: data.observacoes,
          filial: prismaRelationship.connectOrDisconnectOne(data.filial),
          updatedByUserId: context.currentUser?.id,
          updatedByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
        },
      });

      const updatedCliente = await tx.cliente.findUniqueOrThrow({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          historicoLeads: {
            select: {
              id: true,
              nome: true,
            },
          },
          tarefasRelacionadas: {
            select: {
              id: true,
              titulo: true,
            },
          },
          visitas: {
            select: {
              id: true,
              codigo: true,
            },
          },
          propostas: {
            select: {
              id: true,
              codigo: true,
            },
          },
          reservas: {
            select: {
              id: true,
              codigo: true,
            },
          },
          compras: {
            select: {
              id: true,
              codigo: true,
            },
          },
          participacoesLocacao: {
            select: {
              id: true,
              papel: true,
            },
          },
          solicitacoesAbertas: {
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
          consentimentos: {
            select: {
              id: true,
              tipo: true,
            },
          },
          favoritos: {
            select: {
              id: true,
              dataInclusao: true,
            },
          },
          simulacoesFinanciamento: {
            select: {
              id: true,
              dataSimulacao: true,
            },
          },
          ocorrenciasReportadas: {
            select: {
              id: true,
              codigo: true,
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
        entityName: 'Cliente',
        operation: auditLogOperations.update,
        context,
        oldData: oldCliente,
        newData: updatedCliente,
        tx,
      });

      return updatedCliente;
    },
  );

  cliente = await filePopulateDownloadUrlInTree(cliente);

  return cliente;
}
