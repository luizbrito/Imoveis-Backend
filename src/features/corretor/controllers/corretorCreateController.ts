import { z } from 'zod';
import { prismaRelationship } from '../../../prisma/prismaRelationship';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { dictionaryFormat } from '../../../translation/dictionaryFormat';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { filePopulateDownloadUrlInTree } from '../../file/fileService';
import { corretorCreateInputSchema } from '../corretorSchemas';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { prisma } from '../../../prisma';

export const corretorCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/corretor',
  body: corretorCreateInputSchema,
  response: 'Corretor',
};

export const corretorCreateMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'corretor_create',
  description: dictionary.corretor.mcpDescription.create,
  requiredPermissions: { corretor: ['create'] },
  schema: toMcpJsonSchema(corretorCreateInputSchema),
  handler: async (params, context) => {
    return await corretorCreateController(params, context);
  },
});

export async function corretorCreateController(
  body: unknown,
  context: AppContext,
) {
  await authGuardBackend(
    {
      corretor: ['create'],
    },
    context,
  );
  return await corretorCreate(body, context);
}

export async function corretorCreate(body: unknown, context: AppContext) {
  const currentOrganization = context.currentOrganization!;

  const data = corretorCreateInputSchema.parse(body);

  return await prisma.$withRLS(
    { organization: currentOrganization },
    async (tx) => {
      const duplicatedCpfCnpj = await tx.corretor.count({
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
            context.dictionary.corretor.fields.cpfCnpj,
          ),
        );
      }
      const duplicatedCreci = await tx.corretor.count({
        where: {
          creci: {
            equals: data.creci,
            mode: 'insensitive',
          },
          organizationId: currentOrganization.id,
        },
      });

      if (duplicatedCreci) {
        throw new Error400(
          dictionaryFormat(
            context.dictionary.shared.errors.unique,
            context.dictionary.corretor.fields.creci,
          ),
        );
      }

      const newCorretor = await tx.corretor.create({
        data: {
          nomeCompleto: data.nomeCompleto,
          tipoPessoa: data.tipoPessoa,
          cpfCnpj: data.cpfCnpj,
          creci: data.creci,
          ufCreci: data.ufCreci,
          telefone: data.telefone,
          whatsapp: data.whatsapp,
          email: data.email,
          percentualComissaoPadrao: data.percentualComissaoPadrao,
          especialidades: data.especialidades,
          foto: data.foto,
          ativo: data.ativo,
          observacoes: data.observacoes,
          contaMembro: prismaRelationship.connectOne(data.contaMembro),
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
          imoveisCaptados: {
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
          avaliacoesRealizadas: {
            select: {
              id: true,
              codigo: true,
            },
          },
          vistoriasResponsaveis: {
            select: {
              id: true,
              codigo: true,
            },
          },
          anunciosResponsaveis: {
            select: {
              id: true,
              titulo: true,
            },
          },
          leadsResponsaveis: {
            select: {
              id: true,
              nome: true,
            },
          },
          interacoesRealizadas: {
            select: {
              id: true,
              assunto: true,
            },
          },
          tarefasAtribuidas: {
            select: {
              id: true,
              titulo: true,
            },
          },
          visitasConduzidas: {
            select: {
              id: true,
              codigo: true,
            },
          },
          propostasIntermediadas: {
            select: {
              id: true,
              codigo: true,
            },
          },
          reservasGerenciadas: {
            select: {
              id: true,
              codigo: true,
            },
          },
          vendasIntermediadas: {
            select: {
              id: true,
              codigo: true,
            },
          },
          locacoesIntermediadas: {
            select: {
              id: true,
              codigo: true,
            },
          },
          comissoes: {
            select: {
              id: true,
              codigo: true,
            },
          },
          solicitacoesGerenciadas: {
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
          solicitacoesAtendidas: {
            select: {
              id: true,
              nome: true,
            },
          },
          ocorrenciasGerenciadas: {
            select: {
              id: true,
              codigo: true,
            },
          },
          contaMembro: {
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
        entityId: newCorretor.id,
        entityName: 'Corretor',
        operation: auditLogOperations.create,
        context,
        newData: newCorretor,
        tx,
      });

      const corretor = await filePopulateDownloadUrlInTree(newCorretor);

      return corretor;
    },
  );
}
