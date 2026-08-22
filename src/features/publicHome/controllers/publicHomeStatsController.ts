import { Context } from 'hono';
import { Prisma } from '../../../prisma/generated/client';
import { prismaDangerouslyBypassRLS } from '../../../prisma';
import { PublicHomeStats } from '../publicHomeSchemas';
import { publicOrganizationResolve } from '../publicOrganizationResolve';

export async function publicHomeStatsController(
  c: Context,
): Promise<PublicHomeStats> {
  const organization = await publicOrganizationResolve(c);
  if (!organization) {
    return { properties: 0, farms: 0, cities: 0, hectares: 0, featured: 0 };
  }

  const now = new Date();
  const publicWhere: Prisma.AnuncioWhereInput = {
    organizationId: organization.id,
    status: 'publicado',
    archivedAt: null,
    AND: [
      { OR: [{ dataInicio: null }, { dataInicio: { lte: now } }] },
      { OR: [{ dataFim: null }, { dataFim: { gte: now } }] },
    ],
  };

  const [properties, farmRows, cityRows, hectareRows, featured] =
    await Promise.all([
      prismaDangerouslyBypassRLS.anuncio.count({ where: publicWhere }),
      prismaDangerouslyBypassRLS.anuncio.findMany({
        where: { ...publicWhere, imovel: { imovelRural: true } },
        distinct: ['imovelId'],
        select: { imovelId: true },
      }),
      prismaDangerouslyBypassRLS.anuncio.findMany({
        where: publicWhere,
        distinct: ['imovelId'],
        select: { imovel: { select: { cidade: true } } },
      }),
      prismaDangerouslyBypassRLS.anuncio.findMany({
        where: { ...publicWhere, imovel: { imovelRural: true } },
        distinct: ['imovelId'],
        select: { imovel: { select: { areaTotalHa: true } } },
      }),
      prismaDangerouslyBypassRLS.anuncio.count({
        where: { ...publicWhere, destaque: true },
      }),
    ]);

  return {
    properties,
    farms: farmRows.length,
    cities: new Set(cityRows.map(({ imovel }) => imovel.cidade).filter(Boolean))
      .size,
    hectares: hectareRows.reduce(
      (total, { imovel }) => total + Number(imovel.areaTotalHa ?? 0),
      0,
    ),
    featured,
  };
}
