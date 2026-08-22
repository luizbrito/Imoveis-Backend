import { Context } from 'hono';
import { Prisma } from '../../../prisma/generated/client';
import { prismaDangerouslyBypassRLS } from '../../../prisma';
import { PublicGeography, PublicLocationOption } from '../publicHomeSchemas';
import { publicOrganizationResolve } from '../publicOrganizationResolve';

export async function publicGeographyController(c: Context): Promise<PublicGeography> {
  const organization = await publicOrganizationResolve(c);
  if (!organization) return { regions: [], locations: [] };

  const now = new Date();
  const publicPropertyWhere: Prisma.ImovelWhereInput = {
    organizationId: organization.id,
    archivedAt: null,
    anuncios: {
      some: {
        status: 'publicado',
        archivedAt: null,
        AND: [
          { OR: [{ dataInicio: null }, { dataInicio: { lte: now } }] },
          { OR: [{ dataFim: null }, { dataFim: { gte: now } }] },
        ],
      },
    },
  };

  const [regionCounts, farmCounts, properties] = await Promise.all([
    prismaDangerouslyBypassRLS.imovel.groupBy({
      by: ['paisId', 'estadoId'],
      where: publicPropertyWhere,
      _count: { _all: true },
    }),
    prismaDangerouslyBypassRLS.imovel.groupBy({
      by: ['paisId', 'estadoId'],
      where: { ...publicPropertyWhere, imovelRural: true },
      _count: { _all: true },
    }),
    prismaDangerouslyBypassRLS.imovel.findMany({
      where: publicPropertyWhere,
      distinct: ['paisId', 'estadoId', 'cidadeCadastroId', 'bairro', 'regiaoGeografica'],
      take: 1000,
      select: {
        pais: { select: { id: true, nome: true } },
        estado: { select: { id: true, nome: true, sigla: true } },
        cidadeCadastro: { select: { id: true, nome: true } },
        bairro: true,
        regiaoGeografica: true,
      },
    }),
  ]);

  const countryIds = [...new Set(regionCounts.map((row) => row.paisId).filter(Boolean))] as string[];
  const stateIds = [...new Set(regionCounts.map((row) => row.estadoId).filter(Boolean))] as string[];
  const [countries, states] = await Promise.all([
    prismaDangerouslyBypassRLS.pais.findMany({ where: { organizationId: organization.id, id: { in: countryIds } }, select: { id: true, nome: true } }),
    prismaDangerouslyBypassRLS.estado.findMany({ where: { organizationId: organization.id, id: { in: stateIds } }, select: { id: true, nome: true } }),
  ]);
  const countryById = new Map(countries.map((country) => [country.id, country.nome]));
  const stateById = new Map(states.map((state) => [state.id, state.nome]));
  const farmCountByRegion = new Map(
    farmCounts.map((row) => [`${row.paisId}:${row.estadoId}`, row._count._all]),
  );
  const regions = regionCounts
    .filter((row) => row.estadoId)
    .map((row) => ({
      id: row.estadoId!,
      name: stateById.get(row.estadoId!) || row.estadoId!,
      countryId: row.paisId,
      countryName: row.paisId ? countryById.get(row.paisId) || null : null,
      stateId: row.estadoId,
      properties: row._count._all,
      farms: farmCountByRegion.get(`${row.paisId}:${row.estadoId}`) || 0,
    }))
    .sort((left, right) => right.properties - left.properties)
    .slice(0, 8);

  const locationMap = new Map<string, PublicLocationOption>();
  const addLocation = (location: PublicLocationOption) => locationMap.set(location.id, location);
  for (const property of properties) {
    const country = property.pais;
    const state = property.estado;
    const city = property.cidadeCadastro;
    if (country) addLocation({ id: `country:${country.id}`, label: country.nome, kind: 'country', countryId: country.id, stateId: null, cityId: null });
    if (state) addLocation({ id: `state:${state.id}`, label: [state.nome, country?.nome].filter(Boolean).join(', '), kind: 'state', countryId: country?.id || null, stateId: state.id, cityId: null });
    if (city) addLocation({ id: `city:${city.id}`, label: [city.nome, state?.sigla || state?.nome, country?.nome].filter(Boolean).join(', '), kind: 'city', countryId: country?.id || null, stateId: state?.id || null, cityId: city.id });
    if (property.bairro) addLocation({ id: `neighborhood:${city?.id || state?.id}:${property.bairro}`, label: [property.bairro, city?.nome, state?.sigla].filter(Boolean).join(', '), kind: 'neighborhood', countryId: country?.id || null, stateId: state?.id || null, cityId: city?.id || null });
    if (property.regiaoGeografica) addLocation({ id: `region:${country?.id || state?.id}:${property.regiaoGeografica}`, label: [property.regiaoGeografica, country?.nome].filter(Boolean).join(', '), kind: 'region', countryId: country?.id || null, stateId: state?.id || null, cityId: city?.id || null });
  }

  return {
    regions,
    locations: [...locationMap.values()].sort((left, right) => left.label.localeCompare(right.label)),
  };
}
