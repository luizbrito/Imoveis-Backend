import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { arquivoKmlCreateInputSchema } from '../arquivoKmlSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const arquivoKmlCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/arquivo-kml',
  body: arquivoKmlCreateInputSchema,
  response: 'ArquivoKml',
};

export const arquivoKmlCreateMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'arquivoKml_create',
  description: dictionary.arquivoKml.mcpDescription.create,
  requiredPermissions: { arquivoKml: ['create'] },
  schema: toMcpJsonSchema(arquivoKmlCreateInputSchema),
  handler: async (params, context) => {
    return await arquivoKmlCreateController(params, context);
  },
});

export async function arquivoKmlCreateController(
  body: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      arquivoKml: ['create'],
    },
    context,
  );
  return await arquivoKmlCreate(body, context);
}

export async function arquivoKmlCreate(body: unknown, context: AppContext) {
  const currentOrganization = context.currentOrganization!;

  const data = arquivoKmlCreateInputSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const newArquivoKml = await tx.arquivoKml.create({
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
          documentacaoRuralBrasil: prismaRelationship.connectOne(
            data.documentacaoRuralBrasil,
          ),
          imovel: prismaRelationship.connectOneOrThrow(data.imovel),
          empreendimento: prismaRelationship.connectOne(data.empreendimento),
          condominio: prismaRelationship.connectOne(data.condominio),
          cadastradoPor: prismaRelationship.connectOne(data.cadastradoPor),
          versaoAnterior: prismaRelationship.connectOne(data.versaoAnterior),
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
        entityId: newArquivoKml.id,
        entityName: 'ArquivoKml',
        operation: auditLogOperations.create,
        context,
        newData: newArquivoKml,
        tx,
      });

      const arquivoKml = await filePopulateDownloadUrlInTree(newArquivoKml);

      return arquivoKml;
    },
  );
}
