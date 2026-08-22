import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { clienteCreateInputSchema } from '../clienteSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const clienteCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/cliente',
  body: clienteCreateInputSchema,
  response: 'Cliente',
};

export const clienteCreateMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'cliente_create',
  description: dictionary.cliente.mcpDescription.create,
  requiredPermissions: { cliente: ['create'] },
  schema: toMcpJsonSchema(clienteCreateInputSchema),
  handler: async (params, context) => {
    return await clienteCreateController(params, context);
  },
});

export async function clienteCreateController(
  body: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      cliente: ['create'],
    },
    context,
  );
  return await clienteCreate(body, context);
}

export async function clienteCreate(body: unknown, context: AppContext) {
  const currentOrganization = context.currentOrganization!;

  const data = clienteCreateInputSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const duplicatedCpfCnpj = await tx.cliente.count({
        where: {
          cpfCnpj: {
            equals: data.cpfCnpj,
            mode: 'insensitive',
          },
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

      const newCliente = await tx.cliente.create({
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
          filial: prismaRelationship.connectOneOrThrow(data.filial),
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
        entityId: newCliente.id,
        entityName: 'Cliente',
        operation: auditLogOperations.create,
        context,
        newData: newCliente,
        tx,
      });

      const cliente = await filePopulateDownloadUrlInTree(newCliente);

      return cliente;
    },
  );
}
