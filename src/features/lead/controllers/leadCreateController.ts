import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { leadCreateInputSchema } from '../leadSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const leadCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/lead',
  body: leadCreateInputSchema,
  response: 'Lead',
};

export const leadCreateMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'lead_create',
  description: dictionary.lead.mcpDescription.create,
  requiredPermissions: { lead: ['create'] },
  schema: toMcpJsonSchema(leadCreateInputSchema),
  handler: async (params, context) => {
    return await leadCreateController(params, context);
  },
});

export async function leadCreateController(body: unknown, context: AppContext) {
  await authGuardBackend(
    {
      lead: ['create'],
    },
    context,
  );
  return await leadCreate(body, context);
}

export async function leadCreate(body: unknown, context: AppContext) {
  const currentOrganization = context.currentOrganization!;

  const data = leadCreateInputSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const newLead = await tx.lead.create({
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
          filial: prismaRelationship.connectOneOrThrow(data.filial),
          corretorResponsavel: prismaRelationship.connectOneOrThrow(
            data.corretorResponsavel,
          ),
          anuncioOrigem: prismaRelationship.connectOne(data.anuncioOrigem),
          campanhaOrigem: prismaRelationship.connectOne(data.campanhaOrigem),
          portalOrigem: prismaRelationship.connectOne(data.portalOrigem),
          clienteConvertido: prismaRelationship.connectOne(
            data.clienteConvertido,
          ),
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
        entityId: newLead.id,
        entityName: 'Lead',
        operation: auditLogOperations.create,
        context,
        newData: newLead,
        tx,
      });

      const lead = await filePopulateDownloadUrlInTree(newLead);

      return lead;
    },
  );
}
