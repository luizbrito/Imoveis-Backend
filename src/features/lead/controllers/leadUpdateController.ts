import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import {
  leadUpdateBodyInputSchema,
  leadUpdateParamsInputSchema,
} from '../leadSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const leadUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/lead/{id}',
  params: leadUpdateParamsInputSchema,
  body: leadUpdateBodyInputSchema,
  response: 'Lead',
};

export const leadUpdateMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'lead_update',
  description: dictionary.lead.mcpDescription.update,
  requiredPermissions: { lead: ['update'] },
  schema: toMcpJsonSchema(
    z.object({
      id: z.string(),
      data: leadUpdateBodyInputSchema,
    }),
  ),
  handler: async (params, context) => {
    return await leadUpdateController({ id: params.id }, params.data, context);
  },
});

export async function leadUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      lead: ['update'],
    },
    context,
  );

  const { id } = leadUpdateParamsInputSchema.parse(params);

  const data = leadUpdateBodyInputSchema.parse(body);

  let lead = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      if (data.updatedAt) {
        const currentLead = await tx.lead.findUnique({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          select: { updatedAt: true },
        });

        if (currentLead) {
          const currentUpdatedAt = currentLead.updatedAt.toISOString();
          const providedUpdatedAt =
            data.updatedAt instanceof Date
              ? data.updatedAt.toISOString()
              : data.updatedAt;

          if (currentUpdatedAt !== providedUpdatedAt) {
            throw new Error400(context.dictionary.shared.errors.staleData);
          }
        }
      }

      const oldLead = await tx.lead.findUniqueOrThrow({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          interacoes: {
            select: {
              id: true,
              assunto: true,
            },
          },
          tarefas: {
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
          consentimentos: {
            select: {
              id: true,
              tipo: true,
            },
          },
          filial: {
            select: {
              id: true,
              nome: true,
            },
          },
          corretorResponsavel: {
            select: {
              id: true,
              nomeCompleto: true,
            },
          },
          anuncioOrigem: {
            select: {
              id: true,
              titulo: true,
            },
          },
          campanhaOrigem: {
            select: {
              id: true,
              nome: true,
            },
          },
          portalOrigem: {
            select: {
              id: true,
              nome: true,
            },
          },
          clienteConvertido: {
            select: {
              id: true,
              nomeRazaoSocial: true,
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

      await tx.lead.update({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        data: {
          nome: data.nome,
          telefone: data.telefone,
          whatsapp: data.whatsapp,
          email: data.email,
          origem: data.origem,
          status: data.status,
          temperatura: data.temperatura,
          dataEntrada: data.dataEntrada,
          proximoContato: data.proximoContato,
          finalidade: data.finalidade,
          faixaValor: data.faixaValor,
          mensagemInicial: data.mensagemInicial,
          motivoPerda: data.motivoPerda,
          filial: prismaRelationship.connectOrDisconnectOne(data.filial),
          corretorResponsavel: prismaRelationship.connectOrDisconnectOne(
            data.corretorResponsavel,
          ),
          anuncioOrigem: prismaRelationship.connectOrDisconnectOne(
            data.anuncioOrigem,
          ),
          campanhaOrigem: prismaRelationship.connectOrDisconnectOne(
            data.campanhaOrigem,
          ),
          portalOrigem: prismaRelationship.connectOrDisconnectOne(
            data.portalOrigem,
          ),
          clienteConvertido: prismaRelationship.connectOrDisconnectOne(
            data.clienteConvertido,
          ),
          updatedByUserId: context.currentUser?.id,
          updatedByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
        },
      });

      const updatedLead = await tx.lead.findUniqueOrThrow({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          interacoes: {
            select: {
              id: true,
              assunto: true,
            },
          },
          tarefas: {
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
          consentimentos: {
            select: {
              id: true,
              tipo: true,
            },
          },
          filial: {
            select: {
              id: true,
              nome: true,
            },
          },
          corretorResponsavel: {
            select: {
              id: true,
              nomeCompleto: true,
            },
          },
          anuncioOrigem: {
            select: {
              id: true,
              titulo: true,
            },
          },
          campanhaOrigem: {
            select: {
              id: true,
              nome: true,
            },
          },
          portalOrigem: {
            select: {
              id: true,
              nome: true,
            },
          },
          clienteConvertido: {
            select: {
              id: true,
              nomeRazaoSocial: true,
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
        entityName: 'Lead',
        operation: auditLogOperations.update,
        context,
        oldData: oldLead,
        newData: updatedLead,
        tx,
      });

      return updatedLead;
    },
  );

  lead = await filePopulateDownloadUrlInTree(lead);

  return lead;
}
