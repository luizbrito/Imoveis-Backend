import { Context } from 'hono';
import { prismaDangerouslyBypassRLS } from '../../../prisma';
import { Prisma } from '../../../prisma/generated/client';
import { publicOrganizationResolve } from '../../publicHome/publicOrganizationResolve';

export async function anuncioPublicFindManyController(
  c: Context,
  overrides?: { featured?: boolean; take?: number },
) {
  const query = c.req.query();
  const organization = await publicOrganizationResolve(c);

  if (!organization) {
    return { anuncios: [], count: 0 };
  }

  const skip = Math.max(Number(query.skip) || 0, 0);
  const take = Math.min(
    Math.max(overrides?.take ?? (Number(query.take) || 24), 1),
    100,
  );
  const now = new Date();

  const where: Prisma.AnuncioWhereInput = {
    organizationId: organization.id,
    status: 'publicado',
    archivedAt: null,
    AND: [
      {
        OR: [{ dataInicio: null }, { dataInicio: { lte: now } }],
      },
      {
        OR: [{ dataFim: null }, { dataFim: { gte: now } }],
      },
    ],
    ...(overrides?.featured || query.featured === 'true'
      ? { destaque: true }
      : {}),
  };

  const numberFilter = (value: string | undefined) => {
    const number = Number(value);
    return Number.isFinite(number) ? number : undefined;
  };
  const typeMap: Record<string, string> = {
    apartment: 'apartamento',
    house: 'casa',
    land: 'terreno',
    commercial: 'sala_comercial',
    development: 'outro',
  };
  const minPrice = numberFilter(query.minPrice);
  const maxPrice = numberFilter(query.maxPrice);
  const minArea = numberFilter(query.minArea);
  const maxArea = numberFilter(query.maxArea);
  const minHectares = numberFilter(query.minHectares);
  const maxHectares = numberFilter(query.maxHectares);
  const minRainfall = numberFilter(query.minRainfall);
  const maxRainfall = numberFilter(query.maxRainfall);
  const propertyFilters: Prisma.ImovelWhereInput = {
    ...(query.operation === 'buy' ? { finalidade: { has: 'venda' } } : {}),
    ...(query.operation === 'rent' ? { finalidade: { has: 'locacao' } } : {}),
    ...(query.operation === 'farms'
      ? { imovelRural: true, finalidade: { has: 'venda' } }
      : {}),
    ...(query.operation === 'launches'
      ? { empreendimentoId: { not: null }, finalidade: { has: 'venda' } }
      : {}),
    ...(query.propertyType
      ? { tipo: typeMap[query.propertyType] || query.propertyType }
      : {}),
    ...(query.countryId ? { paisId: query.countryId } : {}),
    ...(query.stateId ? { estadoId: query.stateId } : {}),
    ...(query.cityId ? { cidadeCadastroId: query.cityId } : {}),
    ...(query.city && !query.cityId
      ? {
          OR: [
            { cidade: { contains: query.city, mode: 'insensitive' } },
            { bairro: { contains: query.city, mode: 'insensitive' } },
            { regiaoGeografica: { contains: query.city, mode: 'insensitive' } },
          ],
        }
      : {}),
    ...(minPrice != null || maxPrice != null
      ? { valorVenda: { gte: minPrice, lte: maxPrice } }
      : {}),
    ...(minArea != null || maxArea != null
      ? { areaTotal: { gte: minArea, lte: maxArea } }
      : {}),
    ...(minHectares != null || maxHectares != null
      ? { areaTotalHa: { gte: minHectares, lte: maxHectares } }
      : {}),
    ...(minRainfall != null || maxRainfall != null
      ? { precipitacaoMediaAnualMm: { gte: minRainfall, lte: maxRainfall } }
      : {}),
    ...(query.soilType
      ? { soloPredominante: { contains: query.soilType, mode: 'insensitive' } }
      : {}),
    ...(query.agriculturalAptitude
      ? { aptidaoAgricolaSolo: query.agriculturalAptitude }
      : {}),
    ...(query.hasRiver === 'true' ? { possuiFrenteRio: true } : {}),
    ...(query.hasAirstrip === 'true' ? { possuiPistaAviacao: true } : {}),
  };
  if (Object.keys(propertyFilters).length > 0) where.imovel = propertyFilters;

  const [anuncios, count] = await Promise.all([
    prismaDangerouslyBypassRLS.anuncio.findMany({
      where,
      skip,
      take,
      orderBy: [{ destaque: 'desc' }, { updatedAt: 'desc' }],
      select: {
        id: true,
        createdAt: true,
        titulo: true,
        slug: true,
        valorDivulgado: true,
        tituloSeo: true,
        descricaoSeo: true,
        textoPublicacao: true,
        destaque: true,
        aceitaContato: true,
        imovel: {
          select: {
            id: true,
            codigo: true,
            titulo: true,
            tipo: true,
            finalidade: true,
            exclusividade: true,
            valorVenda: true,
            valorLocacao: true,
            moeda: true,
            bairro: true,
            cidade: true,
            uf: true,
            areaPrivativa: true,
            areaTerreno: true,
            areaTotal: true,
            areaTotalHa: true,
            imovelRural: true,
            nomeRural: true,
            empreendimentoId: true,
            quartos: true,
            suites: true,
            banheiros: true,
            vagas: true,
            descricao: true,
            pais: { select: { nome: true, sigla: true } },
            estado: { select: { nome: true, sigla: true } },
            cidadeCadastro: { select: { nome: true } },
            midias: {
              where: { archivedAt: null, publica: true },
              orderBy: [{ principal: 'desc' }, { ordem: 'asc' }],
              select: {
                id: true,
                titulo: true,
                imagens: true,
                urlExterna: true,
                legenda: true,
              },
            },
          },
        },
      },
    }),
    prismaDangerouslyBypassRLS.anuncio.count({ where }),
  ]);

  const newListingThreshold = new Date(now);
  newListingThreshold.setDate(newListingThreshold.getDate() - 30);

  return {
    anuncios: anuncios.map((anuncio) => ({
      ...anuncio,
      badges: [
        ...(anuncio.destaque ? ['featured'] : []),
        ...(anuncio.createdAt >= newListingThreshold ? ['new'] : []),
        ...(anuncio.imovel.imovelRural ? ['farm'] : []),
        ...(anuncio.imovel.empreendimentoId ? ['development'] : []),
        ...(anuncio.imovel.exclusividade ? ['exclusive'] : []),
      ],
    })),
    count,
  };
}
