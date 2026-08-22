import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { propostaCreateInputSchema } from '../propostaSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const propostaCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/proposta',
  body: propostaCreateInputSchema,
  response: 'Proposta',
};

export const propostaCreateMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'proposta_create',
  description: dictionary.proposta.mcpDescription.create,
  requiredPermissions: { proposta: ['create'] },
  schema: toMcpJsonSchema(propostaCreateInputSchema),
  handler: async (params, context) => {
    return await propostaCreateController(params, context);
  },
});

export async function propostaCreateController(
  body: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      proposta: ['create'],
    },
    context,
  );
  return await propostaCreate(body, context);
}

export async function propostaCreate(body: unknown, context: AppContext) {
  const currentOrganization = context.currentOrganization!;

  const data = propostaCreateInputSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const duplicatedCodigo = await tx.proposta.count({
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
            context.dictionary.proposta.fields.codigo,
          ),
        );
      }

      const newProposta = await tx.proposta.create({
        data: {
          codigo: data.codigo,
          tipo: data.tipo,
          dataProposta: data.dataProposta,
          validadeAte: data.validadeAte,
          status: data.status,
          valorProposto: data.valorProposto,
          moeda: data.moeda,
          sinal: data.sinal,
          formaPagamento: data.formaPagamento,
          percentualComissao: data.percentualComissao,
          termos: data.termos,
          documentos: data.documentos,
          motivoRecusa: data.motivoRecusa,
          visitaOrigem: prismaRelationship.connectOne(data.visitaOrigem),
          lead: prismaRelationship.connectOne(data.lead),
          cliente: prismaRelationship.connectOneOrThrow(data.cliente),
          imovel: prismaRelationship.connectOneOrThrow(data.imovel),
          corretor: prismaRelationship.connectOneOrThrow(data.corretor),
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
          condicoes: {
            select: {
              id: true,
              descricao: true,
            },
          },
          reservas: {
            select: {
              id: true,
              codigo: true,
            },
          },
          vendasGeradas: {
            select: {
              id: true,
              codigo: true,
            },
          },
          locacoesGeradas: {
            select: {
              id: true,
              codigo: true,
            },
          },
          simulacoesFinanciamento: {
            select: {
              id: true,
              dataSimulacao: true,
            },
          },
          visitaOrigem: {
            select: {
              id: true,
              codigo: true,
            },
          },
          lead: {
            select: {
              id: true,
              nome: true,
            },
          },
          cliente: {
            select: {
              id: true,
              nomeRazaoSocial: true,
            },
          },
          imovel: {
            select: {
              id: true,
              titulo: true,
            },
          },
          corretor: {
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
        entityId: newProposta.id,
        entityName: 'Proposta',
        operation: auditLogOperations.create,
        context,
        newData: newProposta,
        tx,
      });

      const proposta = await filePopulateDownloadUrlInTree(newProposta);

      return proposta;
    },
  );
}
