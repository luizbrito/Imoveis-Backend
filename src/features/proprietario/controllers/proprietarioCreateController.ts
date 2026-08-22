import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { proprietarioCreateInputSchema } from '../proprietarioSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const proprietarioCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/proprietario',
  body: proprietarioCreateInputSchema,
  response: 'Proprietario',
};

export const proprietarioCreateMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'proprietario_create',
  description: dictionary.proprietario.mcpDescription.create,
  requiredPermissions: { proprietario: ['create'] },
  schema: toMcpJsonSchema(proprietarioCreateInputSchema),
  handler: async (params, context) => {
    return await proprietarioCreateController(params, context);
  },
});

export async function proprietarioCreateController(
  body: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      proprietario: ['create'],
    },
    context,
  );
  return await proprietarioCreate(body, context);
}

export async function proprietarioCreate(body: unknown, context: AppContext) {
  const currentOrganization = context.currentOrganization!;

  const data = proprietarioCreateInputSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const duplicatedCpfCnpj = await tx.proprietario.count({
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
            context.dictionary.proprietario.fields.cpfCnpj,
          ),
        );
      }

      const newProprietario = await tx.proprietario.create({
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
        entityId: newProprietario.id,
        entityName: 'Proprietario',
        operation: auditLogOperations.create,
        context,
        newData: newProprietario,
        tx,
      });

      const proprietario = await filePopulateDownloadUrlInTree(newProprietario);

      return proprietario;
    },
  );
}
