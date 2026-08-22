import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import {
  arquivoKmlUpdateBodyInputSchema,
  arquivoKmlUpdateParamsInputSchema,
} from '../arquivoKmlSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const arquivoKmlUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/arquivo-kml/{id}',
  params: arquivoKmlUpdateParamsInputSchema,
  body: arquivoKmlUpdateBodyInputSchema,
  response: 'ArquivoKml',
};

export const arquivoKmlUpdateMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'arquivoKml_update',
  description: dictionary.arquivoKml.mcpDescription.update,
  requiredPermissions: { arquivoKml: ['update'] },
  schema: toMcpJsonSchema(
    z.object({
      id: z.string(),
      data: arquivoKmlUpdateBodyInputSchema,
    }),
  ),
  handler: async (params, context) => {
    return await arquivoKmlUpdateController(
      { id: params.id },
      params.data,
      context,
    );
  },
});

export async function arquivoKmlUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentOrganization } = await authGuardBackend(
    {
      arquivoKml: ['update'],
    },
    context,
  );

  const { id } = arquivoKmlUpdateParamsInputSchema.parse(params);

  const data = arquivoKmlUpdateBodyInputSchema.parse(body);

  let arquivoKml = await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      if (data.updatedAt) {
        const currentArquivoKml = await tx.arquivoKml.findUnique({
          where: {
            id_organizationId: {
              id,
              organizationId: currentOrganization.id,
            },
          },
          select: { updatedAt: true },
        });

        if (currentArquivoKml) {
          const currentUpdatedAt = currentArquivoKml.updatedAt.toISOString();
          const providedUpdatedAt =
            data.updatedAt instanceof Date
              ? data.updatedAt.toISOString()
              : data.updatedAt;

          if (currentUpdatedAt !== providedUpdatedAt) {
            throw new Error400(context.dictionary.shared.errors.staleData);
          }
        }
      }

      const oldArquivoKml = await tx.arquivoKml.findUniqueOrThrow({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          versoesPosteriores: {
            select: {
              id: true,
              nome: true,
            },
          },
          documentacaoRuralBrasil: {
            select: {
              id: true,
              matriculaNumero: true,
            },
          },
          imovel: {
            select: {
              id: true,
              titulo: true,
            },
          },
          empreendimento: {
            select: {
              id: true,
              nome: true,
            },
          },
          condominio: {
            select: {
              id: true,
              nome: true,
            },
          },
          cadastradoPor: {
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
          versaoAnterior: {
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

      await tx.arquivoKml.update({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        data: {
          nome: data.nome,
          tipoArquivo: data.tipoArquivo,
          arquivo: data.arquivo,
          descricao: data.descricao,
          versao: data.versao,
          statusProcessamento: data.statusProcessamento,
          sistemaReferencia: data.sistemaReferencia,
          camada: data.camada,
          visivel: data.visivel,
          ordemExibicao: data.ordemExibicao,
          latitudeMin: data.latitudeMin,
          longitudeMin: data.longitudeMin,
          latitudeMax: data.latitudeMax,
          longitudeMax: data.longitudeMax,
          quantidadePontos: data.quantidadePontos,
          quantidadeLinhas: data.quantidadeLinhas,
          quantidadePoligonos: data.quantidadePoligonos,
          areaCalculadaM2: data.areaCalculadaM2,
          dataProcessamento: data.dataProcessamento,
          erroProcessamento: data.erroProcessamento,
          checksumSha256: data.checksumSha256,
          origem: data.origem,
          observacoes: data.observacoes,
          documentacaoRuralBrasil: prismaRelationship.connectOrDisconnectOne(
            data.documentacaoRuralBrasil,
          ),
          imovel: prismaRelationship.connectOrDisconnectOne(data.imovel),
          empreendimento: prismaRelationship.connectOrDisconnectOne(
            data.empreendimento,
          ),
          condominio: prismaRelationship.connectOrDisconnectOne(
            data.condominio,
          ),
          cadastradoPor: prismaRelationship.connectOrDisconnectOne(
            data.cadastradoPor,
          ),
          versaoAnterior: prismaRelationship.connectOrDisconnectOne(
            data.versaoAnterior,
          ),
          updatedByUserId: context.currentUser?.id,
          updatedByMember: prismaRelationship.connectOne(
            context.currentMember?.id,
          ),
        },
      });

      const updatedArquivoKml = await tx.arquivoKml.findUniqueOrThrow({
        where: {
          id_organizationId: {
            id,
            organizationId: currentOrganization.id,
          },
        },
        include: {
          versoesPosteriores: {
            select: {
              id: true,
              nome: true,
            },
          },
          documentacaoRuralBrasil: {
            select: {
              id: true,
              matriculaNumero: true,
            },
          },
          imovel: {
            select: {
              id: true,
              titulo: true,
            },
          },
          empreendimento: {
            select: {
              id: true,
              nome: true,
            },
          },
          condominio: {
            select: {
              id: true,
              nome: true,
            },
          },
          cadastradoPor: {
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
          versaoAnterior: {
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
        entityName: 'ArquivoKml',
        operation: auditLogOperations.update,
        context,
        oldData: oldArquivoKml,
        newData: updatedArquivoKml,
        tx,
      });

      return updatedArquivoKml;
    },
  );

  arquivoKml = await filePopulateDownloadUrlInTree(arquivoKml);

  return arquivoKml;
}
