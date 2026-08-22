import { Context } from 'hono';
import { prismaDangerouslyBypassRLS } from '../../../prisma';
import { env } from '../../../env';
import { anuncioPublicFindManyController } from './anuncioPublicFindManyController';
import { publicPropertySimilarRank } from '../../publicHome/publicPropertySimilarRank';

export async function anuncioPublicGetController(c: Context) {
  const slug = c.req.param('slug');
  const requestedOrganizationId = c.req.header('x-organization-id');
  const requestedOrganizationSlug = c.req.query('organizationSlug');

  let organization = requestedOrganizationId
    ? await prismaDangerouslyBypassRLS.organization.findUnique({
        where: { id: requestedOrganizationId },
      })
    : requestedOrganizationSlug
      ? await prismaDangerouslyBypassRLS.organization.findUnique({
          where: { slug: requestedOrganizationSlug },
        })
      : env.ORGANIZATION_MODE === 'single'
        ? await prismaDangerouslyBypassRLS.organization.findFirst()
        : null;

  if (!organization && !requestedOrganizationId && !requestedOrganizationSlug) {
    const organizations =
      await prismaDangerouslyBypassRLS.organization.findMany({
        select: { id: true },
        take: 2,
      });

    if (organizations.length === 1) {
      organization = await prismaDangerouslyBypassRLS.organization.findUnique({
        where: { id: organizations[0].id },
      });
    }
  }

  if (!organization || !slug) {
    return null;
  }

  const now = new Date();

  const anuncio = await prismaDangerouslyBypassRLS.anuncio.findFirst({
    where: {
      organizationId: organization.id,
      slug,
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
    },
    select: {
      id: true,
      titulo: true,
      slug: true,
      status: true,
      textoPublicacao: true,
      valorDivulgado: true,
      destaque: true,
      aceitaContato: true,
      imovel: {
        select: {
          id: true,
          titulo: true,
          tipo: true,
          finalidade: true,
          valorVenda: true,
          valorLocacao: true,
          moeda: true,
          bairro: true,
          cidade: true,
          uf: true,
          logradouro: true,
          latitude: true,
          longitude: true,
          areaTotal: true,
          areaPrivativa: true,
          areaTerreno: true,
          areaTotalHa: true,
          areaProdutivaHa: true,
          percentualAreaProdutiva: true,
          areaPreservadaHa: true,
          precipitacaoMediaAnualMm: true,
          soloPredominante: true,
          extensaoFrenteRioKm: true,
          possuiPistaAviacao: true,
          scoreGeralFazenda: true,
          mapaUsoAlternativo: true,
          vinculosCaracteristicas: {
            where: { archivedAt: null, destaque: true },
            select: {
              valorTexto: true,
              caracteristica: { select: { nome: true } },
            },
          },
          arquivosKml: {
            where: {
              archivedAt: null,
              visivel: true,
              statusProcessamento: 'processado',
            },
            orderBy: { ordemExibicao: 'asc' },
            select: { id: true, nome: true, camada: true, arquivo: true },
          },
          referenciasClimaticas: {
            where: { archivedAt: null },
            orderBy: { updatedAt: 'desc' },
            take: 1,
            select: {
              titulo: true,
              precipitacaoMediaAnualMm: true,
              inicioPeriodoChuvoso: true,
              fimPeriodoChuvoso: true,
              mesMaisSeco: true,
              mesMaisChuvoso: true,
              temperaturaMediaAnualC: true,
              riscoSeca: true,
              fonteDados: true,
              urlFonte: true,
              periodoClimatologicoInicio: true,
              periodoClimatologicoFim: true,
            },
          },
          solosRurais: {
            where: { archivedAt: null },
            select: {
              id: true,
              nomeArea: true,
              areaHa: true,
              percentualImovel: true,
              profundidadeMediaCm: true,
              phMedio: true,
              materiaOrganicaPercentual: true,
              teorArgilaPercentual: true,
              teorAreiaPercentual: true,
              teorSiltePercentual: true,
              tipoSolo: {
                select: {
                  nome: true,
                  classeTextural: true,
                  drenagem: true,
                  fertilidadeNatural: true,
                  fonteClassificacao: true,
                },
              },
            },
          },
          documentos: {
            where: {
              archivedAt: null,
              visibilidade: { in: ['public', 'authenticated', 'nda'] },
            },
            select: {
              id: true,
              titulo: true,
              tipo: true,
              visibilidade: true,
              dataValidade: true,
            },
          },
          energiaConectividade: {
            where: { archivedAt: null },
            select: {
              id: true,
              descricao: true,
              energiaDisponivel: true,
              tipoRede: true,
              gerador: true,
              energiaSolar: true,
              internetFibra: true,
              internetRadio: true,
              starlink: true,
              sinalCelular: true,
            },
          },
          recursosHidricos: {
            where: { archivedAt: null },
            select: {
              id: true,
              nome: true,
              tipo: true,
              perene: true,
              extensaoNaPropriedadeKm: true,
              frentePropriedadeKm: true,
              qualidadeAgua: true,
              usoGado: true,
              usoIrrigacao: true,
              usoHumano: true,
            },
          },
          producoesHistoricas: {
            where: { archivedAt: null },
            orderBy: { safraAno: 'desc' },
            select: {
              id: true,
              safraAno: true,
              atividade: true,
              areaHa: true,
              producaoTotal: true,
              unidadeProducao: true,
              produtividadePorHa: true,
              cabecasMediaAno: true,
              uaHa: true,
            },
          },
          sistemasProdutivos: {
            where: { archivedAt: null },
            select: {
              id: true,
              nome: true,
              tipo: true,
              areaHa: true,
              irrigado: true,
              areaIrrigadaHa: true,
            },
          },
          dueDiligences: {
            where: { archivedAt: null },
            orderBy: { updatedAt: 'desc' },
            take: 1,
            select: {
              scoreGeral: true,
              classificacaoFinal: true,
              notaDocumentacao: true,
              notaInfraestrutura: true,
              notaLogistica: true,
              notaRecursosHidricos: true,
              notaClima: true,
              notaSolo: true,
              notaAptidaoAgricola: true,
              notaAptidaoPecuaria: true,
              notaAmbiental: true,
            },
          },
          descricao: true,
          nomeRural: true,
          regiaoGeografica: true,
          municipioRural: true,
          midias: {
            where: { archivedAt: null, publica: true },
            orderBy: [{ principal: 'desc' }, { ordem: 'asc' }],
            select: {
              id: true,
              titulo: true,
              imagens: true,
              urlExterna: true,
              legenda: true,
              principal: true,
              ordem: true,
            },
          },
          pais: {
            select: { nome: true, sigla: true },
          },
          estado: {
            select: { nome: true, sigla: true },
          },
          cidadeCadastro: {
            select: { nome: true },
          },
          corretorResponsavel: {
            select: {
              id: true,
              nomeCompleto: true,
              telefone: true,
              whatsapp: true,
              email: true,
              especialidades: true,
              foto: true,
            },
          },
        },
      },
    },
  });

  if (!anuncio?.imovel) {
    return null;
  }

  const imovel = anuncio.imovel;
  const totalAreaHa = Number(imovel.areaTotalHa ?? imovel.areaTerreno ?? 0);
  const productiveAreaHa = Number(
    imovel.areaProdutivaHa ?? imovel.areaPrivativa ?? totalAreaHa,
  );
  const imageList = (imovel.midias ?? [])
    .map((midia) => {
      const imageData = midia.imagens as Record<string, unknown> | null;
      const imageUrl =
        (midia.urlExterna as string | null) ||
        (typeof imageData === 'object' && imageData != null
          ? (imageData.publicUrl as string | undefined) ||
            (imageData.url as string | undefined)
          : undefined);

      if (!imageUrl) {
        return null;
      }

      return {
        id: midia.id,
        url: imageUrl,
        thumbnailUrl: imageUrl,
        title: midia.titulo ?? imovel.titulo,
        description: midia.legenda ?? undefined,
        isCover: Boolean(midia.principal),
        sortOrder: Number(midia.ordem ?? 0),
      };
    })
    .filter(Boolean) as Array<{
    id: string;
    url: string;
    thumbnailUrl?: string;
    title?: string;
    description?: string;
    isCover: boolean;
    sortOrder: number;
  }>;

  const images = [...imageList].sort((a, b) => a.sortOrder - b.sortOrder);

  const broker = imovel.corretorResponsavel
    ? {
        id: imovel.corretorResponsavel.id,
        name: imovel.corretorResponsavel.nomeCompleto,
        specialty:
          imovel.corretorResponsavel.especialidades?.[0] ??
          'Especialista imobiliário',
        phone: imovel.corretorResponsavel.telefone ?? undefined,
        whatsapp: imovel.corretorResponsavel.whatsapp ?? undefined,
        email: imovel.corretorResponsavel.email ?? undefined,
        photoUrl:
          typeof imovel.corretorResponsavel.foto === 'string'
            ? imovel.corretorResponsavel.foto
            : undefined,
      }
    : null;

  const property = {
    id: imovel.id,
    slug: anuncio.slug,
    title: anuncio.titulo || imovel.titulo,
    summary:
      anuncio.textoPublicacao ||
      imovel.descricao ||
      'Imóvel disponível para venda.',
    country: imovel.pais?.nome || 'País não informado',
    state: imovel.estado?.nome || imovel.uf || 'Estado não informado',
    city:
      imovel.cidadeCadastro?.nome ||
      imovel.cidade ||
      imovel.municipioRural ||
      'Cidade não informada',
    region: imovel.regiaoGeografica || 'Região não informada',
    address: imovel.logradouro || undefined,
    pricePerHa: Number(
      Number(anuncio.valorDivulgado ?? imovel.valorVenda ?? 0) /
        (totalAreaHa || 1),
    ),
    totalValue: Number(anuncio.valorDivulgado ?? imovel.valorVenda ?? 0),
    totalAreaHa,
    productiveAreaHa,
    preservedAreaHa:
      imovel.areaPreservadaHa == null ? null : Number(imovel.areaPreservadaHa),
    rainfallMm:
      imovel.precipitacaoMediaAnualMm == null
        ? null
        : Number(imovel.precipitacaoMediaAnualMm),
    predominantSoil: imovel.soloPredominante,
    riverFrontKm:
      imovel.extensaoFrenteRioKm == null
        ? null
        : Number(imovel.extensaoFrenteRioKm),
    hasAirstrip: imovel.possuiPistaAviacao,
    score:
      imovel.scoreGeralFazenda == null
        ? null
        : Number(imovel.scoreGeralFazenda),
    status: anuncio.status,
    badges: [
      ...(anuncio.destaque ? [{ id: 'featured', label: 'Destaque' }] : []),
      ...(imovel.tipo ? [{ id: 'type', label: imovel.tipo }] : []),
    ],
    currency: imovel.moeda || 'USD',
    areaPercent:
      totalAreaHa > 0 ? Math.round((productiveAreaHa / totalAreaHa) * 100) : 0,
    latitude: imovel.latitude != null ? Number(imovel.latitude) : null,
    longitude: imovel.longitude != null ? Number(imovel.longitude) : null,
    publicLocationPrecision: 'city' as const,
    images,
    broker,
  };
  const similarCandidates = await anuncioPublicFindManyController(c, {
    take: 24,
  });
  const similarProperties = similarCandidates.anuncios
    .filter((candidate) => candidate.id !== anuncio.id)
    .map((candidate) => {
      const candidateArea = Number(candidate.imovel.areaTotalHa ?? 0);
      const candidateValue = Number(
        candidate.valorDivulgado ?? candidate.imovel.valorVenda ?? 0,
      );
      const candidatePerHa =
        candidateArea > 0 ? candidateValue / candidateArea : 0;
      const rank = publicPropertySimilarRank(
        {
          country: property.country,
          state: property.state,
          city: property.city,
          areaHa: totalAreaHa,
          pricePerHa: property.pricePerHa,
        },
        {
          country: candidate.imovel.pais?.nome,
          state: candidate.imovel.estado?.nome,
          city: candidate.imovel.cidadeCadastro?.nome,
          areaHa: candidateArea,
          pricePerHa: candidatePerHa,
        },
      );
      return { candidate, rank };
    })
    .sort((a, b) => b.rank - a.rank)
    .slice(0, 8)
    .map(({ candidate }) => candidate);

  const rawLandUse = Array.isArray(imovel.mapaUsoAlternativo)
    ? imovel.mapaUsoAlternativo
    : [];
  const landUse = rawLandUse.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const entry = item as Record<string, unknown>;
    const areaHa = Number(entry.areaHa ?? entry.area ?? 0);
    const name = String(entry.name ?? entry.nome ?? entry.label ?? '');
    return name && areaHa > 0 ? [{ name, areaHa }] : [];
  });
  const mapLayers = imovel.arquivosKml.flatMap((item) => {
    if (
      !item.arquivo ||
      typeof item.arquivo !== 'object' ||
      Array.isArray(item.arquivo)
    )
      return [];
    const stored = item.arquivo as Record<string, unknown>;
    const geometry = stored.geoJson ?? stored.geojson ?? stored.geometry;
    return geometry && typeof geometry === 'object'
      ? [{ id: item.id, name: item.nome, layer: item.camada, geometry }]
      : [];
  });
  const climateRecord = imovel.referenciasClimaticas[0];
  const diligence = imovel.dueDiligences[0];

  return {
    property,
    location: {
      country: property.country,
      state: property.state,
      city: property.city,
      region: property.region,
      latitude: property.latitude,
      longitude: property.longitude,
      access: 'Acesso principal não informado',
      distanceToCity: null,
    },
    images,
    broker,
    landUse,
    highlights: imovel.vinculosCaracteristicas
      .map((item) => item.valorTexto || item.caracteristica.nome)
      .filter(Boolean),
    map: {
      precision: property.publicLocationPrecision,
      latitude:
        property.publicLocationPrecision === 'city' ? null : property.latitude,
      longitude:
        property.publicLocationPrecision === 'city' ? null : property.longitude,
      layers: mapLayers,
    },
    climate: climateRecord
      ? {
          title: climateRecord.titulo,
          rainfallMm:
            climateRecord.precipitacaoMediaAnualMm == null
              ? null
              : Number(climateRecord.precipitacaoMediaAnualMm),
          rainySeason:
            [
              climateRecord.inicioPeriodoChuvoso,
              climateRecord.fimPeriodoChuvoso,
            ]
              .filter(Boolean)
              .join(' – ') || null,
          driestMonth: climateRecord.mesMaisSeco,
          wettestMonth: climateRecord.mesMaisChuvoso,
          averageTemperatureC:
            climateRecord.temperaturaMediaAnualC == null
              ? null
              : Number(climateRecord.temperaturaMediaAnualC),
          droughtRisk: climateRecord.riscoSeca,
          source: climateRecord.fonteDados,
          sourceUrl: climateRecord.urlFonte,
          period:
            [
              climateRecord.periodoClimatologicoInicio,
              climateRecord.periodoClimatologicoFim,
            ]
              .filter(Boolean)
              .join('–') || null,
        }
      : null,
    soils: imovel.solosRurais.map((soil) => ({
      id: soil.id,
      areaName: soil.nomeArea,
      name: soil.tipoSolo.nome,
      texture: soil.tipoSolo.classeTextural,
      drainage: soil.tipoSolo.drenagem,
      fertility: soil.tipoSolo.fertilidadeNatural,
      source: soil.tipoSolo.fonteClassificacao,
      areaHa: soil.areaHa == null ? null : Number(soil.areaHa),
      percentage:
        soil.percentualImovel == null ? null : Number(soil.percentualImovel),
      depthCm:
        soil.profundidadeMediaCm == null
          ? null
          : Number(soil.profundidadeMediaCm),
      ph: soil.phMedio == null ? null : Number(soil.phMedio),
      organicMatter:
        soil.materiaOrganicaPercentual == null
          ? null
          : Number(soil.materiaOrganicaPercentual),
      clay:
        soil.teorArgilaPercentual == null
          ? null
          : Number(soil.teorArgilaPercentual),
      sand:
        soil.teorAreiaPercentual == null
          ? null
          : Number(soil.teorAreiaPercentual),
      silt:
        soil.teorSiltePercentual == null
          ? null
          : Number(soil.teorSiltePercentual),
    })),
    documentation: imovel.documentos.map((document) => ({
      id: document.id,
      title: document.titulo,
      type: document.tipo,
      visibility: document.visibilidade,
      validUntil: document.dataValidade,
      status:
        document.dataValidade && new Date(document.dataValidade) < now
          ? 'expired'
          : 'available',
    })),
    infrastructure: imovel.energiaConectividade.map((item) => ({
      id: item.id,
      description: item.descricao,
      energy: item.energiaDisponivel,
      gridType: item.tipoRede,
      generator: item.gerador,
      solar: item.energiaSolar,
      fiber: item.internetFibra,
      radio: item.internetRadio,
      starlink: item.starlink,
      mobileSignal: item.sinalCelular,
    })),
    waterResources: imovel.recursosHidricos.map((item) => ({
      id: item.id,
      name: item.nome,
      type: item.tipo,
      perennial: item.perene,
      lengthKm:
        item.extensaoNaPropriedadeKm == null
          ? null
          : Number(item.extensaoNaPropriedadeKm),
      frontageKm:
        item.frentePropriedadeKm == null
          ? null
          : Number(item.frentePropriedadeKm),
      quality: item.qualidadeAgua,
      uses: [
        item.usoGado ? 'Pecuária' : null,
        item.usoIrrigacao ? 'Irrigação' : null,
        item.usoHumano ? 'Humano' : null,
      ].filter(Boolean),
    })),
    production: {
      systems: imovel.sistemasProdutivos.map((item) => ({
        id: item.id,
        name: item.nome,
        type: item.tipo,
        areaHa: item.areaHa == null ? null : Number(item.areaHa),
        irrigated: item.irrigado,
        irrigatedAreaHa:
          item.areaIrrigadaHa == null ? null : Number(item.areaIrrigadaHa),
      })),
      history: imovel.producoesHistoricas.map((item) => ({
        id: item.id,
        season: item.safraAno,
        activity: item.atividade,
        areaHa: item.areaHa == null ? null : Number(item.areaHa),
        total: item.producaoTotal == null ? null : Number(item.producaoTotal),
        unit: item.unidadeProducao,
        yieldPerHa:
          item.produtividadePorHa == null
            ? null
            : Number(item.produtividadePorHa),
        heads: item.cabecasMediaAno,
        uaHa: item.uaHa == null ? null : Number(item.uaHa),
      })),
    },
    dueDiligence: diligence
      ? {
          overall:
            diligence.scoreGeral == null ? null : Number(diligence.scoreGeral),
          classification: diligence.classificacaoFinal,
          scores: Object.fromEntries(
            Object.entries({
              documentation: diligence.notaDocumentacao,
              infrastructure: diligence.notaInfraestrutura,
              logistics: diligence.notaLogistica,
              water: diligence.notaRecursosHidricos,
              climate: diligence.notaClima,
              soil: diligence.notaSolo,
              agriculture: diligence.notaAptidaoAgricola,
              livestock: diligence.notaAptidaoPecuaria,
              sustainability: diligence.notaAmbiental,
            }).map(([key, value]) => [
              key,
              value == null ? null : Number(value),
            ]),
          ),
        }
      : null,
    similarProperties,
  };
}
