import type { Context } from 'hono';
import { prismaDangerouslyBypassRLS } from '../../../prisma';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { publicPropertyContactSchema } from '../publicHomeSchemas';
import { publicOrganizationResolve } from '../publicOrganizationResolve';

export async function publicPropertyContactController(c: Context) {
  const organization = await publicOrganizationResolve(c);
  if (!organization) return null;
  const input = publicPropertyContactSchema.parse(await c.req.json());
  const anuncio = await prismaDangerouslyBypassRLS.anuncio.findFirst({
    where: {
      organizationId: organization.id,
      slug: input.slug,
      status: 'publicado',
      archivedAt: null,
    },
    select: {
      id: true,
      imovelId: true,
      corretorResponsavelId: true,
      imovel: { select: { filialId: true } },
    },
  });
  if (!anuncio) return null;

  const email = input.email.trim().toLowerCase();
  const phone = input.phone.replace(/\D/g, '');
  const requestedAt =
    input.kind === 'visit' ? new Date(input.requestedAt) : new Date();
  const message = [
    input.message,
    input.kind === 'visit' ? `Pessoas: ${input.people}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  const created = await prismaDangerouslyBypassRLS.$transaction(async (tx) => {
    const request = await tx.solicitacaoContato.create({
      data: {
        organizationId: organization.id,
        nome: input.name,
        email,
        telefone: phone,
        canalOrigem: 'site',
        dataHora: requestedAt,
        status: 'nova',
        mensagem: message,
        consentiuContato: true,
        imovelId: anuncio.imovelId,
        anuncioId: anuncio.id,
        corretorResponsavelId: anuncio.corretorResponsavelId,
      },
    });
    await auditLogCreate({
      entityId: request.id,
      entityName: 'solicitacaoContato',
      operation: auditLogOperations.create,
      organizationId: organization.id,
      newData: request,
      tx,
    });

    if (anuncio.corretorResponsavelId) {
      let lead = await tx.lead.findFirst({
        where: {
          organizationId: organization.id,
          archivedAt: null,
          OR: [
            { email },
            ...(phone ? [{ telefone: phone }, { whatsapp: phone }] : []),
          ],
        },
      });
      if (!lead) {
        lead = await tx.lead.create({
          data: {
            organizationId: organization.id,
            nome: input.name,
            telefone: phone,
            whatsapp: phone,
            email,
            origem: 'site',
            status: 'novo',
            temperatura: 'morno',
            dataEntrada: requestedAt,
            finalidade: 'comprar',
            mensagemInicial: message,
            filialId: anuncio.imovel.filialId,
            corretorResponsavelId: anuncio.corretorResponsavelId,
            anuncioOrigemId: anuncio.id,
          },
        });
        await auditLogCreate({
          entityId: lead.id,
          entityName: 'lead',
          operation: auditLogOperations.create,
          organizationId: organization.id,
          newData: lead,
          tx,
        });
      }

      const interaction = await tx.interacaoLead.create({
        data: {
          organizationId: organization.id,
          dataHora: requestedAt,
          tipo: 'mensagem_portal',
          resultado: 'interessado',
          assunto:
            input.kind === 'visit'
              ? 'Solicitacao de visita pelo site'
              : 'Solicitacao de contato pelo site',
          descricao: message,
          leadId: lead.id,
          corretorId: anuncio.corretorResponsavelId,
        },
      });
      await auditLogCreate({
        entityId: interaction.id,
        entityName: 'interacaoLead',
        operation: auditLogOperations.create,
        organizationId: organization.id,
        newData: interaction,
        tx,
      });
    }

    return request;
  });
  return { id: created.id, status: created.status };
}
