-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('incomplete', 'incomplete_expired', 'trialing', 'active', 'past_due', 'canceled', 'unpaid', 'paused');

-- CreateEnum
CREATE TYPE "SubscriptionMode" AS ENUM ('organization', 'member', 'disabled');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT NOT NULL DEFAULT '',
    "image" TEXT,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "timestamp" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "entityName" TEXT NOT NULL,
    "entityId" UUID NOT NULL,
    "organizationId" UUID,
    "userId" UUID,
    "memberId" UUID,
    "apiKeyId" UUID,
    "apiEndpoint" TEXT,
    "apiHttpResponseCode" TEXT,
    "operation" TEXT NOT NULL,
    "oldData" JSONB,
    "newData" JSONB,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "configId" TEXT NOT NULL DEFAULT 'default',
    "name" TEXT,
    "start" TEXT,
    "prefix" TEXT,
    "key" TEXT NOT NULL,
    "referenceId" UUID NOT NULL,
    "organizationId" UUID,
    "refillInterval" INTEGER,
    "refillAmount" INTEGER,
    "lastRefillAt" TIMESTAMPTZ(3),
    "enabled" BOOLEAN DEFAULT true,
    "rateLimitEnabled" BOOLEAN DEFAULT true,
    "rateLimitTimeWindow" INTEGER DEFAULT 86400000,
    "rateLimitMax" INTEGER DEFAULT 1000,
    "requestCount" INTEGER DEFAULT 0,
    "remaining" INTEGER,
    "lastRequest" TIMESTAMPTZ(3),
    "expiresAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "permissions" TEXT,
    "metadata" JSONB,

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PushToken" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "platform" TEXT,
    "p256dh" TEXT,
    "auth" TEXT,
    "expirationTime" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "PushToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "roles" TEXT[],
    "payload" JSONB NOT NULL,
    "readAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logosDark" JSONB,
    "logosLight" JSONB,
    "backgroundImageDark" JSONB,
    "backgroundImageLight" JSONB,
    "require2fa" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "logo" TEXT,
    "createdByUserId" UUID,
    "updatedByUserId" UUID,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Member" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "fullName" TEXT,
    "avatars" JSONB,
    "disabled" BOOLEAN NOT NULL DEFAULT false,
    "isNotificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "importHash" TEXT,
    "createdByUserId" UUID,
    "createdByMemberId" UUID,
    "updatedByUserId" UUID,
    "updatedByMemberId" UUID,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "memberId" UUID,
    "userId" UUID NOT NULL,
    "mode" "SubscriptionMode" NOT NULL,
    "cancelAt" TIMESTAMPTZ(3),
    "stripeCustomerId" TEXT NOT NULL,
    "stripeSubscriptionId" TEXT NOT NULL,
    "stripePriceId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Filial" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID,
    "createdByMemberId" UUID,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedByUserId" UUID,
    "updatedByMemberId" UUID,
    "archivedAt" TIMESTAMPTZ(3),
    "archivedByMemberId" UUID,
    "importHash" TEXT,
    "nome" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "cnpj" TEXT,
    "telefone" TEXT,
    "email" TEXT,
    "logradouro" TEXT,
    "numero" TEXT,
    "complemento" TEXT,
    "bairro" TEXT,
    "cidade" TEXT,
    "uf" TEXT,
    "cep" TEXT,
    "ativa" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Filial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Corretor" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID,
    "createdByMemberId" UUID,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedByUserId" UUID,
    "updatedByMemberId" UUID,
    "archivedAt" TIMESTAMPTZ(3),
    "archivedByMemberId" UUID,
    "importHash" TEXT,
    "nomeCompleto" TEXT NOT NULL,
    "tipoPessoa" TEXT NOT NULL,
    "cpfCnpj" TEXT,
    "creci" TEXT NOT NULL,
    "ufCreci" TEXT,
    "telefone" TEXT,
    "whatsapp" TEXT,
    "email" TEXT,
    "percentualComissaoPadrao" DECIMAL(65,30),
    "especialidades" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "foto" JSONB,
    "ativo" BOOLEAN NOT NULL DEFAULT false,
    "observacoes" TEXT,
    "contaMembroId" UUID,
    "filialId" UUID NOT NULL,

    CONSTRAINT "Corretor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Proprietario" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID,
    "createdByMemberId" UUID,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedByUserId" UUID,
    "updatedByMemberId" UUID,
    "archivedAt" TIMESTAMPTZ(3),
    "archivedByMemberId" UUID,
    "importHash" TEXT,
    "nomeRazaoSocial" TEXT NOT NULL,
    "tipoPessoa" TEXT NOT NULL,
    "cpfCnpj" TEXT,
    "rgInscricaoEstadual" TEXT,
    "telefone" TEXT,
    "whatsapp" TEXT,
    "email" TEXT,
    "logradouro" TEXT,
    "numero" TEXT,
    "complemento" TEXT,
    "bairro" TEXT,
    "cidade" TEXT,
    "uf" TEXT,
    "cep" TEXT,
    "dadosBancarios" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT false,
    "observacoes" TEXT,
    "filialId" UUID NOT NULL,

    CONSTRAINT "Proprietario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID,
    "createdByMemberId" UUID,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedByUserId" UUID,
    "updatedByMemberId" UUID,
    "archivedAt" TIMESTAMPTZ(3),
    "archivedByMemberId" UUID,
    "importHash" TEXT,
    "nomeRazaoSocial" TEXT NOT NULL,
    "tipoPessoa" TEXT NOT NULL,
    "cpfCnpj" TEXT,
    "dataNascimento" TEXT,
    "telefone" TEXT,
    "whatsapp" TEXT,
    "email" TEXT,
    "profissao" TEXT,
    "rendaMensal" DECIMAL(65,30),
    "finalidades" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tiposInteresse" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "faixaValorMinimo" DECIMAL(65,30),
    "faixaValorMaximo" DECIMAL(65,30),
    "cidadeInteresse" TEXT,
    "bairrosInteresse" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "canalPreferido" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT false,
    "observacoes" TEXT,
    "filialId" UUID NOT NULL,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Condominio" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID,
    "createdByMemberId" UUID,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedByUserId" UUID,
    "updatedByMemberId" UUID,
    "archivedAt" TIMESTAMPTZ(3),
    "archivedByMemberId" UUID,
    "importHash" TEXT,
    "nome" TEXT NOT NULL,
    "cnpj" TEXT,
    "tipo" TEXT,
    "telefoneAdministracao" TEXT,
    "emailAdministracao" TEXT,
    "logradouro" TEXT,
    "numero" TEXT,
    "bairro" TEXT,
    "cidade" TEXT,
    "uf" TEXT,
    "cep" TEXT,
    "valorCondominioReferencia" DECIMAL(65,30),
    "infraestrutura" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "regras" TEXT,

    CONSTRAINT "Condominio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Empreendimento" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID,
    "createdByMemberId" UUID,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedByUserId" UUID,
    "updatedByMemberId" UUID,
    "archivedAt" TIMESTAMPTZ(3),
    "archivedByMemberId" UUID,
    "importHash" TEXT,
    "nome" TEXT NOT NULL,
    "incorporadora" TEXT,
    "construtora" TEXT,
    "status" TEXT NOT NULL,
    "dataLancamento" TEXT,
    "previsaoEntrega" TEXT,
    "cidade" TEXT,
    "bairro" TEXT,
    "endereco" TEXT,
    "descricao" TEXT,
    "diferenciais" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "imagens" JSONB,
    "documentos" JSONB,

    CONSTRAINT "Empreendimento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Imovel" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID,
    "createdByMemberId" UUID,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedByUserId" UUID,
    "updatedByMemberId" UUID,
    "archivedAt" TIMESTAMPTZ(3),
    "archivedByMemberId" UUID,
    "importHash" TEXT,
    "codigo" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "finalidade" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" TEXT NOT NULL,
    "exclusividade" BOOLEAN NOT NULL DEFAULT false,
    "valorVenda" DECIMAL(65,30),
    "valorLocacao" DECIMAL(65,30),
    "valorCondominio" DECIMAL(65,30),
    "valorIptuAnual" DECIMAL(65,30),
    "moeda" TEXT NOT NULL,
    "logradouro" TEXT NOT NULL,
    "numero" TEXT,
    "complemento" TEXT,
    "bairro" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "uf" TEXT,
    "cep" TEXT,
    "latitude" DECIMAL(65,30),
    "longitude" DECIMAL(65,30),
    "areaTotal" DECIMAL(65,30),
    "areaPrivativa" DECIMAL(65,30),
    "areaTerreno" DECIMAL(65,30),
    "quartos" INTEGER,
    "suites" INTEGER,
    "banheiros" INTEGER,
    "vagas" INTEGER,
    "andar" INTEGER,
    "anoConstrucao" INTEGER,
    "mobiliado" TEXT,
    "aceitaPet" BOOLEAN NOT NULL DEFAULT false,
    "aceitaFinanciamento" BOOLEAN NOT NULL DEFAULT false,
    "ocupacao" TEXT,
    "descricao" TEXT,
    "observacoesInternas" TEXT,
    "destaque" BOOLEAN NOT NULL DEFAULT false,
    "publicavel" BOOLEAN NOT NULL DEFAULT false,
    "imovelRural" BOOLEAN NOT NULL DEFAULT false,
    "nomeRural" TEXT,
    "municipioRural" TEXT,
    "areaTotalHa" DECIMAL(65,30),
    "modulosFiscais" DECIMAL(65,30),
    "precipitacaoMediaAnualMm" DECIMAL(65,30),
    "faixaPluviometrica" TEXT,
    "riscoSeca" TEXT,
    "soloPredominante" TEXT,
    "percentualSoloAgricola" DECIMAL(65,30),
    "aptidaoAgricolaSolo" TEXT,
    "regiaoGeografica" TEXT,
    "nivelDesenvolvimento" TEXT,
    "possuiAcessoAereo" BOOLEAN NOT NULL DEFAULT false,
    "possuiFrenteRio" BOOLEAN NOT NULL DEFAULT false,
    "nomeCursoAguaPrincipal" TEXT,
    "extensaoFrenteRioKm" DECIMAL(65,30),
    "areaProdutivaHa" DECIMAL(65,30),
    "percentualAreaProdutiva" DECIMAL(65,30),
    "areaPreservadaHa" DECIMAL(65,30),
    "percentualReservaBosque" DECIMAL(65,30),
    "areaNaoClassificadaHa" DECIMAL(65,30),
    "valorTotalEstimado" DECIMAL(65,30),
    "diasNoMercado" INTEGER,
    "capacidadeSuporteUaHa" DECIMAL(65,30),
    "capacidadeSuporteCabecas" INTEGER,
    "areaIrrigadaHa" DECIMAL(65,30),
    "possuiPistaAviacao" BOOLEAN NOT NULL DEFAULT false,
    "scoreGeralFazenda" DECIMAL(65,30),
    "mapaUsoAlternativo" JSONB,
    "filialId" UUID NOT NULL,
    "proprietarioId" UUID NOT NULL,
    "corretorResponsavelId" UUID NOT NULL,
    "condominioId" UUID,
    "empreendimentoId" UUID,

    CONSTRAINT "Imovel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaracteristicaImovel" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID,
    "createdByMemberId" UUID,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedByUserId" UUID,
    "updatedByMemberId" UUID,
    "archivedAt" TIMESTAMPTZ(3),
    "archivedByMemberId" UUID,
    "importHash" TEXT,
    "nome" TEXT NOT NULL,
    "grupo" TEXT NOT NULL,
    "icone" TEXT,
    "ativa" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CaracteristicaImovel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImovelCaracteristica" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID,
    "createdByMemberId" UUID,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedByUserId" UUID,
    "updatedByMemberId" UUID,
    "archivedAt" TIMESTAMPTZ(3),
    "archivedByMemberId" UUID,
    "importHash" TEXT,
    "valorTexto" TEXT NOT NULL,
    "destaque" BOOLEAN NOT NULL DEFAULT false,
    "imovelId" UUID NOT NULL,
    "caracteristicaId" UUID NOT NULL,

    CONSTRAINT "ImovelCaracteristica_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MidiaImovel" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID,
    "createdByMemberId" UUID,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedByUserId" UUID,
    "updatedByMemberId" UUID,
    "archivedAt" TIMESTAMPTZ(3),
    "archivedByMemberId" UUID,
    "importHash" TEXT,
    "titulo" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "imagens" JSONB,
    "urlExterna" TEXT,
    "ordem" INTEGER,
    "principal" BOOLEAN NOT NULL DEFAULT false,
    "publica" BOOLEAN NOT NULL DEFAULT false,
    "legenda" TEXT,
    "imovelId" UUID NOT NULL,

    CONSTRAINT "MidiaImovel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentoImovel" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID,
    "createdByMemberId" UUID,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedByUserId" UUID,
    "updatedByMemberId" UUID,
    "archivedAt" TIMESTAMPTZ(3),
    "archivedByMemberId" UUID,
    "importHash" TEXT,
    "titulo" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "numeroDocumento" TEXT,
    "dataEmissao" TEXT,
    "dataValidade" TEXT,
    "arquivos" JSONB,
    "visibilidade" TEXT NOT NULL,
    "observacoes" TEXT,
    "imovelId" UUID NOT NULL,

    CONSTRAINT "DocumentoImovel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaptacaoImovel" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID,
    "createdByMemberId" UUID,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedByUserId" UUID,
    "updatedByMemberId" UUID,
    "archivedAt" TIMESTAMPTZ(3),
    "archivedByMemberId" UUID,
    "importHash" TEXT,
    "codigo" TEXT NOT NULL,
    "dataCaptacao" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "dataInicio" TEXT,
    "dataFim" TEXT,
    "percentualComissaoVenda" DECIMAL(65,30),
    "percentualAdministracao" DECIMAL(65,30),
    "valorMinimoAutorizado" DECIMAL(65,30),
    "documentos" JSONB,
    "observacoes" TEXT,
    "filialId" UUID NOT NULL,
    "imovelId" UUID NOT NULL,
    "proprietarioId" UUID NOT NULL,
    "corretorId" UUID NOT NULL,

    CONSTRAINT "CaptacaoImovel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvaliacaoImovel" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID,
    "createdByMemberId" UUID,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedByUserId" UUID,
    "updatedByMemberId" UUID,
    "archivedAt" TIMESTAMPTZ(3),
    "archivedByMemberId" UUID,
    "importHash" TEXT,
    "codigo" TEXT NOT NULL,
    "dataAvaliacao" TEXT NOT NULL,
    "metodo" TEXT NOT NULL,
    "valorMercado" DECIMAL(65,30) NOT NULL,
    "valorVendaRapida" DECIMAL(65,30),
    "valorLocacaoEstimado" DECIMAL(65,30),
    "moeda" TEXT NOT NULL,
    "validadeAte" TEXT,
    "laudo" JSONB,
    "criterios" TEXT,
    "imovelId" UUID NOT NULL,
    "avaliadorId" UUID NOT NULL,

    CONSTRAINT "AvaliacaoImovel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChaveImovel" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID,
    "createdByMemberId" UUID,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedByUserId" UUID,
    "updatedByMemberId" UUID,
    "archivedAt" TIMESTAMPTZ(3),
    "archivedByMemberId" UUID,
    "importHash" TEXT,
    "codigo" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "localArmazenamento" TEXT,
    "dataRetirada" TIMESTAMPTZ(3),
    "dataPrevistaDevolucao" TIMESTAMPTZ(3),
    "dataDevolucao" TIMESTAMPTZ(3),
    "retiradaPor" TEXT,
    "telefoneRetirada" TEXT,
    "observacoes" TEXT,
    "imovelId" UUID NOT NULL,

    CONSTRAINT "ChaveImovel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vistoria" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID,
    "createdByMemberId" UUID,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedByUserId" UUID,
    "updatedByMemberId" UUID,
    "archivedAt" TIMESTAMPTZ(3),
    "archivedByMemberId" UUID,
    "importHash" TEXT,
    "codigo" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "dataAgendada" TIMESTAMPTZ(3),
    "dataRealizada" TIMESTAMPTZ(3),
    "status" TEXT NOT NULL,
    "responsavelNome" TEXT,
    "assinaturaResponsavel" JSONB,
    "parecerGeral" TEXT,
    "imovelId" UUID NOT NULL,
    "corretorId" UUID,

    CONSTRAINT "Vistoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemVistoria" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID,
    "createdByMemberId" UUID,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedByUserId" UUID,
    "updatedByMemberId" UUID,
    "archivedAt" TIMESTAMPTZ(3),
    "archivedByMemberId" UUID,
    "importHash" TEXT,
    "ambiente" TEXT NOT NULL,
    "item" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "quantidade" INTEGER,
    "descricao" TEXT,
    "fotos" JSONB,
    "requerCorrecao" BOOLEAN NOT NULL DEFAULT false,
    "valorEstimadoCorrecao" DECIMAL(65,30),
    "vistoriaId" UUID NOT NULL,

    CONSTRAINT "ItemVistoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Anuncio" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID,
    "createdByMemberId" UUID,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedByUserId" UUID,
    "updatedByMemberId" UUID,
    "archivedAt" TIMESTAMPTZ(3),
    "archivedByMemberId" UUID,
    "importHash" TEXT,
    "titulo" TEXT NOT NULL,
    "slug" TEXT,
    "status" TEXT NOT NULL,
    "dataInicio" TIMESTAMPTZ(3),
    "dataFim" TIMESTAMPTZ(3),
    "valorDivulgado" DECIMAL(65,30),
    "tituloSeo" TEXT,
    "descricaoSeo" TEXT,
    "palavrasChave" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "textoPublicacao" TEXT,
    "destaque" BOOLEAN NOT NULL DEFAULT false,
    "aceitaContato" BOOLEAN NOT NULL DEFAULT false,
    "imovelId" UUID NOT NULL,
    "corretorId" UUID NOT NULL,

    CONSTRAINT "Anuncio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortalImobiliario" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID,
    "createdByMemberId" UUID,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedByUserId" UUID,
    "updatedByMemberId" UUID,
    "archivedAt" TIMESTAMPTZ(3),
    "archivedByMemberId" UUID,
    "importHash" TEXT,
    "nome" TEXT NOT NULL,
    "urlBase" TEXT,
    "tipoIntegracao" TEXT NOT NULL,
    "identificadorConta" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT false,
    "observacoes" TEXT,

    CONSTRAINT "PortalImobiliario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublicacaoPortal" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID,
    "createdByMemberId" UUID,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedByUserId" UUID,
    "updatedByMemberId" UUID,
    "archivedAt" TIMESTAMPTZ(3),
    "archivedByMemberId" UUID,
    "importHash" TEXT,
    "codigoExterno" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "dataEnvio" TIMESTAMPTZ(3),
    "dataAtualizacao" TIMESTAMPTZ(3),
    "urlPublicada" TEXT,
    "mensagemRetorno" TEXT,
    "tentativas" INTEGER,
    "anuncioId" UUID NOT NULL,
    "portalId" UUID NOT NULL,

    CONSTRAINT "PublicacaoPortal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampanhaMarketing" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID,
    "createdByMemberId" UUID,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedByUserId" UUID,
    "updatedByMemberId" UUID,
    "archivedAt" TIMESTAMPTZ(3),
    "archivedByMemberId" UUID,
    "importHash" TEXT,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "dataInicio" TEXT,
    "dataFim" TEXT,
    "orcamento" DECIMAL(65,30),
    "custoReal" DECIMAL(65,30),
    "quantidadeLeads" INTEGER,
    "quantidadeConversoes" INTEGER,
    "observacoes" TEXT,
    "filialId" UUID NOT NULL,

    CONSTRAINT "CampanhaMarketing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampanhaAnuncio" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID,
    "createdByMemberId" UUID,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedByUserId" UUID,
    "updatedByMemberId" UUID,
    "archivedAt" TIMESTAMPTZ(3),
    "archivedByMemberId" UUID,
    "importHash" TEXT,
    "dataInclusao" TEXT NOT NULL,
    "investimentoAlocado" DECIMAL(65,30),
    "impressoes" INTEGER,
    "cliques" INTEGER,
    "leadsGerados" INTEGER,
    "campanhaId" UUID NOT NULL,
    "anuncioId" UUID NOT NULL,

    CONSTRAINT "CampanhaAnuncio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID,
    "createdByMemberId" UUID,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedByUserId" UUID,
    "updatedByMemberId" UUID,
    "archivedAt" TIMESTAMPTZ(3),
    "archivedByMemberId" UUID,
    "importHash" TEXT,
    "nome" TEXT NOT NULL,
    "telefone" TEXT,
    "whatsapp" TEXT,
    "email" TEXT,
    "origem" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "temperatura" TEXT NOT NULL,
    "dataEntrada" TIMESTAMPTZ(3) NOT NULL,
    "proximoContato" TIMESTAMPTZ(3),
    "finalidade" TEXT,
    "faixaValor" DECIMAL(65,30),
    "mensagemInicial" TEXT,
    "motivoPerda" TEXT,
    "filialId" UUID NOT NULL,
    "corretorResponsavelId" UUID NOT NULL,
    "anuncioOrigemId" UUID,
    "campanhaOrigemId" UUID,
    "portalOrigemId" UUID,
    "clienteConvertidoId" UUID,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InteracaoLead" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID,
    "createdByMemberId" UUID,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedByUserId" UUID,
    "updatedByMemberId" UUID,
    "archivedAt" TIMESTAMPTZ(3),
    "archivedByMemberId" UUID,
    "importHash" TEXT,
    "dataHora" TIMESTAMPTZ(3) NOT NULL,
    "tipo" TEXT NOT NULL,
    "resultado" TEXT,
    "assunto" TEXT NOT NULL,
    "descricao" TEXT,
    "proximaAcao" TEXT,
    "dataProximaAcao" TIMESTAMPTZ(3),
    "leadId" UUID NOT NULL,
    "corretorId" UUID NOT NULL,

    CONSTRAINT "InteracaoLead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TarefaComercial" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID,
    "createdByMemberId" UUID,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedByUserId" UUID,
    "updatedByMemberId" UUID,
    "archivedAt" TIMESTAMPTZ(3),
    "archivedByMemberId" UUID,
    "importHash" TEXT,
    "titulo" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "prioridade" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "dataLimite" TIMESTAMPTZ(3),
    "dataConclusao" TIMESTAMPTZ(3),
    "descricao" TEXT,
    "leadId" UUID,
    "corretorId" UUID NOT NULL,
    "clienteId" UUID,

    CONSTRAINT "TarefaComercial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Visita" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID,
    "createdByMemberId" UUID,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedByUserId" UUID,
    "updatedByMemberId" UUID,
    "archivedAt" TIMESTAMPTZ(3),
    "archivedByMemberId" UUID,
    "importHash" TEXT,
    "codigo" TEXT NOT NULL,
    "dataInicio" TIMESTAMPTZ(3) NOT NULL,
    "dataFim" TIMESTAMPTZ(3),
    "status" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "pontoEncontro" TEXT,
    "feedbackCliente" TEXT,
    "interessePosVisita" TEXT,
    "observacoesInternas" TEXT,
    "leadId" UUID,
    "clienteId" UUID NOT NULL,
    "imovelId" UUID NOT NULL,
    "corretorId" UUID NOT NULL,

    CONSTRAINT "Visita_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Proposta" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID,
    "createdByMemberId" UUID,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedByUserId" UUID,
    "updatedByMemberId" UUID,
    "archivedAt" TIMESTAMPTZ(3),
    "archivedByMemberId" UUID,
    "importHash" TEXT,
    "codigo" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "dataProposta" TEXT NOT NULL,
    "validadeAte" TIMESTAMPTZ(3),
    "status" TEXT NOT NULL,
    "valorProposto" DECIMAL(65,30) NOT NULL,
    "moeda" TEXT NOT NULL,
    "sinal" DECIMAL(65,30),
    "formaPagamento" TEXT,
    "percentualComissao" DECIMAL(65,30),
    "termos" TEXT,
    "documentos" JSONB,
    "motivoRecusa" TEXT,
    "visitaOrigemId" UUID,
    "leadId" UUID,
    "clienteId" UUID NOT NULL,
    "imovelId" UUID NOT NULL,
    "corretorId" UUID NOT NULL,

    CONSTRAINT "Proposta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CondicaoProposta" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID,
    "createdByMemberId" UUID,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedByUserId" UUID,
    "updatedByMemberId" UUID,
    "archivedAt" TIMESTAMPTZ(3),
    "archivedByMemberId" UUID,
    "importHash" TEXT,
    "ordem" INTEGER,
    "tipo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "obrigatoria" BOOLEAN NOT NULL DEFAULT false,
    "atendida" BOOLEAN NOT NULL DEFAULT false,
    "propostaId" UUID NOT NULL,

    CONSTRAINT "CondicaoProposta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReservaImovel" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID,
    "createdByMemberId" UUID,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedByUserId" UUID,
    "updatedByMemberId" UUID,
    "archivedAt" TIMESTAMPTZ(3),
    "archivedByMemberId" UUID,
    "importHash" TEXT,
    "codigo" TEXT NOT NULL,
    "dataInicio" TIMESTAMPTZ(3) NOT NULL,
    "dataFim" TIMESTAMPTZ(3),
    "status" TEXT NOT NULL,
    "valorSinal" DECIMAL(65,30),
    "formaPagamentoSinal" TEXT,
    "comprovante" JSONB,
    "observacoes" TEXT,
    "propostaId" UUID,
    "imovelId" UUID NOT NULL,
    "clienteId" UUID NOT NULL,
    "corretorId" UUID NOT NULL,

    CONSTRAINT "ReservaImovel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Venda" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID,
    "createdByMemberId" UUID,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedByUserId" UUID,
    "updatedByMemberId" UUID,
    "archivedAt" TIMESTAMPTZ(3),
    "archivedByMemberId" UUID,
    "importHash" TEXT,
    "codigo" TEXT NOT NULL,
    "dataVenda" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "valorVenda" DECIMAL(65,30) NOT NULL,
    "moeda" TEXT NOT NULL,
    "valorSinal" DECIMAL(65,30),
    "valorFinanciado" DECIMAL(65,30),
    "valorPermuta" DECIMAL(65,30),
    "dataPrevisaoEscritura" TEXT,
    "dataEscritura" TEXT,
    "cartorio" TEXT,
    "observacoes" TEXT,
    "filialId" UUID NOT NULL,
    "propostaId" UUID,
    "imovelId" UUID NOT NULL,
    "proprietarioId" UUID NOT NULL,
    "compradorId" UUID NOT NULL,
    "corretorId" UUID NOT NULL,

    CONSTRAINT "Venda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContratoVenda" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID,
    "createdByMemberId" UUID,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedByUserId" UUID,
    "updatedByMemberId" UUID,
    "archivedAt" TIMESTAMPTZ(3),
    "archivedByMemberId" UUID,
    "importHash" TEXT,
    "numero" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "dataEmissao" TEXT,
    "dataAssinatura" TEXT,
    "dataRegistro" TEXT,
    "arquivos" JSONB,
    "assinaturaEletronicaId" TEXT,
    "observacoes" TEXT,
    "vendaId" UUID NOT NULL,

    CONSTRAINT "ContratoVenda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParcelaVenda" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID,
    "createdByMemberId" UUID,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedByUserId" UUID,
    "updatedByMemberId" UUID,
    "archivedAt" TIMESTAMPTZ(3),
    "archivedByMemberId" UUID,
    "importHash" TEXT,
    "numeroParcela" INTEGER NOT NULL,
    "dataVencimento" TEXT NOT NULL,
    "valor" DECIMAL(65,30) NOT NULL,
    "status" TEXT NOT NULL,
    "dataPagamento" TEXT,
    "valorPago" DECIMAL(65,30),
    "formaPagamento" TEXT,
    "comprovantes" JSONB,
    "vendaId" UUID NOT NULL,

    CONSTRAINT "ParcelaVenda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Locacao" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID,
    "createdByMemberId" UUID,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedByUserId" UUID,
    "updatedByMemberId" UUID,
    "archivedAt" TIMESTAMPTZ(3),
    "archivedByMemberId" UUID,
    "importHash" TEXT,
    "codigo" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "dataInicio" TEXT,
    "dataFim" TEXT,
    "valorAluguel" DECIMAL(65,30) NOT NULL,
    "valorCondominio" DECIMAL(65,30),
    "valorIptuMensal" DECIMAL(65,30),
    "taxaAdministracaoPercentual" DECIMAL(65,30),
    "diaVencimento" INTEGER,
    "indiceReajuste" TEXT,
    "periodicidadeReajusteMeses" INTEGER,
    "multaAtrasoPercentual" DECIMAL(65,30),
    "jurosMesPercentual" DECIMAL(65,30),
    "observacoes" TEXT,
    "filialId" UUID NOT NULL,
    "propostaId" UUID,
    "imovelId" UUID NOT NULL,
    "proprietarioId" UUID NOT NULL,
    "corretorId" UUID NOT NULL,

    CONSTRAINT "Locacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParticipanteLocacao" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID,
    "createdByMemberId" UUID,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedByUserId" UUID,
    "updatedByMemberId" UUID,
    "archivedAt" TIMESTAMPTZ(3),
    "archivedByMemberId" UUID,
    "importHash" TEXT,
    "papel" TEXT NOT NULL,
    "percentualResponsabilidade" DECIMAL(65,30),
    "aprovadoCadastro" BOOLEAN NOT NULL DEFAULT false,
    "dataAprovacao" TEXT,
    "observacoes" TEXT,
    "locacaoId" UUID NOT NULL,
    "clienteId" UUID NOT NULL,

    CONSTRAINT "ParticipanteLocacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GarantiaLocacao" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID,
    "createdByMemberId" UUID,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedByUserId" UUID,
    "updatedByMemberId" UUID,
    "archivedAt" TIMESTAMPTZ(3),
    "archivedByMemberId" UUID,
    "importHash" TEXT,
    "tipo" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "valorGarantia" DECIMAL(65,30),
    "garantidorNome" TEXT,
    "garantidorCpfCnpj" TEXT,
    "seguradora" TEXT,
    "numeroApolice" TEXT,
    "validadeAte" TEXT,
    "documentos" JSONB,
    "observacoes" TEXT,
    "locacaoId" UUID NOT NULL,

    CONSTRAINT "GarantiaLocacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContratoLocacao" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID,
    "createdByMemberId" UUID,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedByUserId" UUID,
    "updatedByMemberId" UUID,
    "archivedAt" TIMESTAMPTZ(3),
    "archivedByMemberId" UUID,
    "importHash" TEXT,
    "numero" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "dataEmissao" TEXT,
    "dataAssinatura" TEXT,
    "arquivos" JSONB,
    "assinaturaEletronicaId" TEXT,
    "observacoes" TEXT,
    "locacaoId" UUID NOT NULL,

    CONSTRAINT "ContratoLocacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CobrancaLocacao" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID,
    "createdByMemberId" UUID,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedByUserId" UUID,
    "updatedByMemberId" UUID,
    "archivedAt" TIMESTAMPTZ(3),
    "archivedByMemberId" UUID,
    "importHash" TEXT,
    "competencia" TEXT NOT NULL,
    "dataVencimento" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "valorAluguel" DECIMAL(65,30),
    "valorCondominio" DECIMAL(65,30),
    "valorIptu" DECIMAL(65,30),
    "valorSeguro" DECIMAL(65,30),
    "valorMulta" DECIMAL(65,30),
    "valorJuros" DECIMAL(65,30),
    "valorDescontos" DECIMAL(65,30),
    "valorTotal" DECIMAL(65,30) NOT NULL,
    "linhaDigitavel" TEXT,
    "urlBoleto" TEXT,
    "observacoes" TEXT,
    "locacaoId" UUID NOT NULL,

    CONSTRAINT "CobrancaLocacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PagamentoLocacao" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID,
    "createdByMemberId" UUID,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedByUserId" UUID,
    "updatedByMemberId" UUID,
    "archivedAt" TIMESTAMPTZ(3),
    "archivedByMemberId" UUID,
    "importHash" TEXT,
    "dataPagamento" TIMESTAMPTZ(3) NOT NULL,
    "valorPago" DECIMAL(65,30) NOT NULL,
    "formaPagamento" TEXT NOT NULL,
    "identificadorTransacao" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "comprovantes" JSONB,
    "observacoes" TEXT,
    "cobrancaId" UUID NOT NULL,

    CONSTRAINT "PagamentoLocacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReajusteLocacao" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID,
    "createdByMemberId" UUID,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedByUserId" UUID,
    "updatedByMemberId" UUID,
    "archivedAt" TIMESTAMPTZ(3),
    "archivedByMemberId" UUID,
    "importHash" TEXT,
    "dataBase" TEXT NOT NULL,
    "indice" TEXT NOT NULL,
    "percentual" DECIMAL(65,30) NOT NULL,
    "valorAnterior" DECIMAL(65,30),
    "valorNovo" DECIMAL(65,30) NOT NULL,
    "status" TEXT NOT NULL,
    "documentos" JSONB,
    "observacoes" TEXT,
    "locacaoId" UUID NOT NULL,

    CONSTRAINT "ReajusteLocacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RepasseProprietario" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID,
    "createdByMemberId" UUID,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedByUserId" UUID,
    "updatedByMemberId" UUID,
    "archivedAt" TIMESTAMPTZ(3),
    "archivedByMemberId" UUID,
    "importHash" TEXT,
    "competencia" TEXT NOT NULL,
    "dataPrevista" TEXT,
    "dataRepasse" TEXT,
    "status" TEXT NOT NULL,
    "valorRecebido" DECIMAL(65,30),
    "taxaAdministracao" DECIMAL(65,30),
    "despesasDescontadas" DECIMAL(65,30),
    "impostosRetidos" DECIMAL(65,30),
    "valorLiquido" DECIMAL(65,30) NOT NULL,
    "comprovante" JSONB,
    "observacoes" TEXT,
    "locacaoId" UUID NOT NULL,
    "proprietarioId" UUID NOT NULL,

    CONSTRAINT "RepasseProprietario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comissao" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID,
    "createdByMemberId" UUID,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedByUserId" UUID,
    "updatedByMemberId" UUID,
    "archivedAt" TIMESTAMPTZ(3),
    "archivedByMemberId" UUID,
    "importHash" TEXT,
    "codigo" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "baseCalculo" DECIMAL(65,30),
    "percentual" DECIMAL(65,30),
    "valorComissao" DECIMAL(65,30) NOT NULL,
    "status" TEXT NOT NULL,
    "dataCompetencia" TEXT,
    "observacoes" TEXT,
    "vendaId" UUID,
    "locacaoId" UUID,
    "corretorId" UUID NOT NULL,

    CONSTRAINT "Comissao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PagamentoComissao" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID,
    "createdByMemberId" UUID,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedByUserId" UUID,
    "updatedByMemberId" UUID,
    "archivedAt" TIMESTAMPTZ(3),
    "archivedByMemberId" UUID,
    "importHash" TEXT,
    "dataPagamento" TEXT NOT NULL,
    "valor" DECIMAL(65,30) NOT NULL,
    "formaPagamento" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "comprovante" JSONB,
    "observacoes" TEXT,
    "comissaoId" UUID NOT NULL,

    CONSTRAINT "PagamentoComissao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fornecedor" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID,
    "createdByMemberId" UUID,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedByUserId" UUID,
    "updatedByMemberId" UUID,
    "archivedAt" TIMESTAMPTZ(3),
    "archivedByMemberId" UUID,
    "importHash" TEXT,
    "nomeRazaoSocial" TEXT NOT NULL,
    "tipoPessoa" TEXT,
    "cpfCnpj" TEXT,
    "categorias" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "telefone" TEXT,
    "whatsapp" TEXT,
    "email" TEXT,
    "cidade" TEXT,
    "uf" TEXT,
    "avaliacao" DECIMAL(65,30),
    "ativo" BOOLEAN NOT NULL DEFAULT false,
    "observacoes" TEXT,
    "filialId" UUID NOT NULL,

    CONSTRAINT "Fornecedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SolicitacaoManutencao" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID,
    "createdByMemberId" UUID,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedByUserId" UUID,
    "updatedByMemberId" UUID,
    "archivedAt" TIMESTAMPTZ(3),
    "archivedByMemberId" UUID,
    "importHash" TEXT,
    "codigo" TEXT NOT NULL,
    "dataAbertura" TIMESTAMPTZ(3) NOT NULL,
    "origem" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "prioridade" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "imagens" JSONB,
    "responsabilidadeCusto" TEXT,
    "valorLimiteAutorizado" DECIMAL(65,30),
    "dataConclusao" TIMESTAMPTZ(3),
    "imovelId" UUID NOT NULL,
    "locacaoId" UUID,
    "clienteSolicitanteId" UUID,
    "corretorResponsavelId" UUID,

    CONSTRAINT "SolicitacaoManutencao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrdemServico" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID,
    "createdByMemberId" UUID,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedByUserId" UUID,
    "updatedByMemberId" UUID,
    "archivedAt" TIMESTAMPTZ(3),
    "archivedByMemberId" UUID,
    "importHash" TEXT,
    "codigo" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "dataEmissao" TEXT NOT NULL,
    "dataAgendada" TIMESTAMPTZ(3),
    "dataConclusao" TIMESTAMPTZ(3),
    "descricaoServico" TEXT NOT NULL,
    "valorOrcado" DECIMAL(65,30),
    "valorAprovado" DECIMAL(65,30),
    "valorFinal" DECIMAL(65,30),
    "documentos" JSONB,
    "fotosAntes" JSONB,
    "fotosDepois" JSONB,
    "avaliacaoServico" DECIMAL(65,30),
    "solicitacaoId" UUID NOT NULL,
    "fornecedorId" UUID NOT NULL,

    CONSTRAINT "OrdemServico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DespesaImovel" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID,
    "createdByMemberId" UUID,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedByUserId" UUID,
    "updatedByMemberId" UUID,
    "archivedAt" TIMESTAMPTZ(3),
    "archivedByMemberId" UUID,
    "importHash" TEXT,
    "descricao" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "dataCompetencia" TEXT,
    "dataVencimento" TEXT,
    "dataPagamento" TEXT,
    "valor" DECIMAL(65,30) NOT NULL,
    "status" TEXT NOT NULL,
    "responsavelPagamento" TEXT,
    "documentos" JSONB,
    "observacoes" TEXT,
    "imovelId" UUID NOT NULL,
    "fornecedorId" UUID,
    "locacaoId" UUID,
    "ordemServicoId" UUID,

    CONSTRAINT "DespesaImovel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContaFinanceira" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID,
    "createdByMemberId" UUID,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedByUserId" UUID,
    "updatedByMemberId" UUID,
    "archivedAt" TIMESTAMPTZ(3),
    "archivedByMemberId" UUID,
    "importHash" TEXT,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "banco" TEXT,
    "agencia" TEXT,
    "numeroConta" TEXT,
    "moeda" TEXT NOT NULL,
    "saldoInicial" DECIMAL(65,30),
    "ativa" BOOLEAN NOT NULL DEFAULT false,
    "filialId" UUID NOT NULL,

    CONSTRAINT "ContaFinanceira_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoriaFinanceira" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID,
    "createdByMemberId" UUID,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedByUserId" UUID,
    "updatedByMemberId" UUID,
    "archivedAt" TIMESTAMPTZ(3),
    "archivedByMemberId" UUID,
    "importHash" TEXT,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "grupo" TEXT,
    "codigoContabil" TEXT,
    "ativa" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CategoriaFinanceira_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LancamentoFinanceiro" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID,
    "createdByMemberId" UUID,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedByUserId" UUID,
    "updatedByMemberId" UUID,
    "archivedAt" TIMESTAMPTZ(3),
    "archivedByMemberId" UUID,
    "importHash" TEXT,
    "descricao" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "dataCompetencia" TEXT NOT NULL,
    "dataVencimento" TEXT,
    "dataRealizacao" TEXT,
    "valor" DECIMAL(65,30) NOT NULL,
    "moeda" TEXT NOT NULL,
    "formaPagamento" TEXT,
    "documentos" JSONB,
    "observacoes" TEXT,
    "filialId" UUID NOT NULL,
    "contaFinanceiraId" UUID NOT NULL,
    "categoriaFinanceiraId" UUID NOT NULL,
    "imovelId" UUID,
    "vendaId" UUID,
    "locacaoId" UUID,
    "cobrancaLocacaoId" UUID,
    "repasseProprietarioId" UUID,
    "comissaoId" UUID,
    "despesaImovelId" UUID,

    CONSTRAINT "LancamentoFinanceiro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentoPessoa" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID,
    "createdByMemberId" UUID,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedByUserId" UUID,
    "updatedByMemberId" UUID,
    "archivedAt" TIMESTAMPTZ(3),
    "archivedByMemberId" UUID,
    "importHash" TEXT,
    "titulo" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "numero" TEXT,
    "dataEmissao" TEXT,
    "dataValidade" TEXT,
    "arquivos" JSONB,
    "statusValidacao" TEXT NOT NULL,
    "observacoes" TEXT,
    "proprietarioId" UUID,
    "clienteId" UUID,
    "corretorId" UUID,

    CONSTRAINT "DocumentoPessoa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsentimentoLGPD" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID,
    "createdByMemberId" UUID,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedByUserId" UUID,
    "updatedByMemberId" UUID,
    "archivedAt" TIMESTAMPTZ(3),
    "archivedByMemberId" UUID,
    "importHash" TEXT,
    "tipo" TEXT NOT NULL,
    "versaoTermo" TEXT NOT NULL,
    "dataConsentimento" TIMESTAMPTZ(3) NOT NULL,
    "status" TEXT NOT NULL,
    "dataRevogacao" TIMESTAMPTZ(3),
    "ipOrigem" TEXT,
    "canal" TEXT,
    "comprovante" JSONB,
    "observacoes" TEXT,
    "clienteId" UUID,
    "proprietarioId" UUID,
    "leadId" UUID,

    CONSTRAINT "ConsentimentoLGPD_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FavoritoCliente" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID,
    "createdByMemberId" UUID,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedByUserId" UUID,
    "updatedByMemberId" UUID,
    "archivedAt" TIMESTAMPTZ(3),
    "archivedByMemberId" UUID,
    "importHash" TEXT,
    "dataInclusao" TIMESTAMPTZ(3) NOT NULL,
    "observacoes" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT false,
    "clienteId" UUID NOT NULL,
    "imovelId" UUID NOT NULL,

    CONSTRAINT "FavoritoCliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SolicitacaoContato" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID,
    "createdByMemberId" UUID,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedByUserId" UUID,
    "updatedByMemberId" UUID,
    "archivedAt" TIMESTAMPTZ(3),
    "archivedByMemberId" UUID,
    "importHash" TEXT,
    "nome" TEXT NOT NULL,
    "telefone" TEXT,
    "email" TEXT,
    "canalOrigem" TEXT NOT NULL,
    "dataHora" TIMESTAMPTZ(3) NOT NULL,
    "status" TEXT NOT NULL,
    "mensagem" TEXT NOT NULL,
    "consentiuContato" BOOLEAN NOT NULL DEFAULT false,
    "imovelId" UUID,
    "anuncioId" UUID,
    "corretorResponsavelId" UUID,

    CONSTRAINT "SolicitacaoContato_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SimulacaoFinanciamento" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID,
    "createdByMemberId" UUID,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedByUserId" UUID,
    "updatedByMemberId" UUID,
    "archivedAt" TIMESTAMPTZ(3),
    "archivedByMemberId" UUID,
    "importHash" TEXT,
    "dataSimulacao" TIMESTAMPTZ(3) NOT NULL,
    "valorImovel" DECIMAL(65,30) NOT NULL,
    "valorEntrada" DECIMAL(65,30),
    "valorFinanciado" DECIMAL(65,30),
    "prazoMeses" INTEGER,
    "taxaJurosAnual" DECIMAL(65,30),
    "sistemaAmortizacao" TEXT,
    "valorParcelaInicial" DECIMAL(65,30),
    "instituicaoFinanceira" TEXT,
    "status" TEXT,
    "observacoes" TEXT,
    "clienteId" UUID NOT NULL,
    "imovelId" UUID NOT NULL,
    "propostaId" UUID,

    CONSTRAINT "SimulacaoFinanciamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContratoAdministracao" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID,
    "createdByMemberId" UUID,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedByUserId" UUID,
    "updatedByMemberId" UUID,
    "archivedAt" TIMESTAMPTZ(3),
    "archivedByMemberId" UUID,
    "importHash" TEXT,
    "numero" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "dataInicio" TEXT,
    "dataFim" TEXT,
    "taxaAdministracaoPercentual" DECIMAL(65,30),
    "taxaIntermediacaoPercentual" DECIMAL(65,30),
    "prazoRepasseDias" INTEGER,
    "autorizaManutencaoAte" DECIMAL(65,30),
    "arquivos" JSONB,
    "observacoes" TEXT,
    "imovelId" UUID NOT NULL,
    "proprietarioId" UUID NOT NULL,
    "filialId" UUID NOT NULL,

    CONSTRAINT "ContratoAdministracao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeguroImovel" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID,
    "createdByMemberId" UUID,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedByUserId" UUID,
    "updatedByMemberId" UUID,
    "archivedAt" TIMESTAMPTZ(3),
    "archivedByMemberId" UUID,
    "importHash" TEXT,
    "tipo" TEXT NOT NULL,
    "seguradora" TEXT NOT NULL,
    "numeroApolice" TEXT NOT NULL,
    "dataInicio" TEXT,
    "dataFim" TEXT,
    "valorPremio" DECIMAL(65,30),
    "valorCobertura" DECIMAL(65,30),
    "status" TEXT NOT NULL,
    "documentos" JSONB,
    "observacoes" TEXT,
    "imovelId" UUID NOT NULL,
    "locacaoId" UUID,

    CONSTRAINT "SeguroImovel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OcorrenciaImovel" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID,
    "createdByMemberId" UUID,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedByUserId" UUID,
    "updatedByMemberId" UUID,
    "archivedAt" TIMESTAMPTZ(3),
    "archivedByMemberId" UUID,
    "importHash" TEXT,
    "codigo" TEXT NOT NULL,
    "dataHora" TIMESTAMPTZ(3) NOT NULL,
    "tipo" TEXT NOT NULL,
    "gravidade" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "anexos" JSONB,
    "dataResolucao" TIMESTAMPTZ(3),
    "resolucao" TEXT,
    "imovelId" UUID NOT NULL,
    "locacaoId" UUID,
    "clienteRelatorId" UUID,
    "corretorResponsavelId" UUID,

    CONSTRAINT "OcorrenciaImovel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArquivoKml" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID,
    "createdByMemberId" UUID,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedByUserId" UUID,
    "updatedByMemberId" UUID,
    "archivedAt" TIMESTAMPTZ(3),
    "archivedByMemberId" UUID,
    "importHash" TEXT,
    "nome" TEXT NOT NULL,
    "tipoArquivo" TEXT NOT NULL,
    "arquivo" JSONB,
    "descricao" TEXT,
    "versao" TEXT,
    "statusProcessamento" TEXT NOT NULL,
    "sistemaReferencia" TEXT,
    "camada" TEXT,
    "visivel" BOOLEAN NOT NULL DEFAULT false,
    "ordemExibicao" INTEGER,
    "latitudeMin" DECIMAL(65,30),
    "longitudeMin" DECIMAL(65,30),
    "latitudeMax" DECIMAL(65,30),
    "longitudeMax" DECIMAL(65,30),
    "quantidadePontos" INTEGER,
    "quantidadeLinhas" INTEGER,
    "quantidadePoligonos" INTEGER,
    "areaCalculadaM2" DECIMAL(65,30),
    "dataProcessamento" TIMESTAMPTZ(3),
    "erroProcessamento" TEXT,
    "checksumSha256" TEXT,
    "origem" TEXT,
    "observacoes" TEXT,
    "documentacaoRuralBrasilId" UUID,
    "imovelId" UUID NOT NULL,
    "empreendimentoId" UUID,
    "condominioId" UUID,
    "cadastradoPorId" UUID,
    "versaoAnteriorId" UUID,

    CONSTRAINT "ArquivoKml_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentacaoRuralBrasil" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID,
    "createdByMemberId" UUID,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedByUserId" UUID,
    "updatedByMemberId" UUID,
    "archivedAt" TIMESTAMPTZ(3),
    "archivedByMemberId" UUID,
    "importHash" TEXT,
    "situacaoDocumental" TEXT,
    "matriculaNumero" TEXT NOT NULL,
    "matriculaLivro" TEXT,
    "matriculaCartorio" TEXT,
    "matriculaComarca" TEXT,
    "matriculaUf" TEXT,
    "matriculaDataAtualizacao" TEXT,
    "matriculaArquivo" JSONB,
    "codigoSncrIncra" TEXT,
    "ccirExercicio" INTEGER,
    "ccirNumero" TEXT,
    "ccirSituacao" TEXT,
    "ccirDataEmissao" TEXT,
    "ccirTaxaQuitada" BOOLEAN NOT NULL DEFAULT false,
    "ccirArquivo" JSONB,
    "cib" TEXT,
    "cafirSituacao" TEXT,
    "cnirVinculado" BOOLEAN NOT NULL DEFAULT false,
    "comprovanteCafir" JSONB,
    "itrUltimoExercicio" INTEGER,
    "ditrEntregue" BOOLEAN NOT NULL DEFAULT false,
    "numeroReciboDitr" TEXT,
    "valorItr" DECIMAL(65,30),
    "itrQuitado" BOOLEAN NOT NULL DEFAULT false,
    "ditrArquivo" JSONB,
    "cndImovelRuralSituacao" TEXT,
    "cndImovelRuralDataEmissao" TEXT,
    "cndImovelRuralDataValidade" TEXT,
    "cndImovelRuralArquivo" JSONB,
    "carNumeroRegistro" TEXT,
    "carSituacao" TEXT,
    "carReciboArquivo" JSONB,
    "carDemonstrativoArquivo" JSONB,
    "areaAppHa" DECIMAL(65,30),
    "areaReservaLegalHa" DECIMAL(65,30),
    "areaVegetacaoNativaHa" DECIMAL(65,30),
    "areaUsoRestritoHa" DECIMAL(65,30),
    "areaConsolidadaHa" DECIMAL(65,30),
    "praSituacao" TEXT,
    "termoPraArquivo" JSONB,
    "sigefCertificado" BOOLEAN NOT NULL DEFAULT false,
    "sigefParcelaCodigo" TEXT,
    "sigefDataCertificacao" TEXT,
    "sigefSituacao" TEXT,
    "sigefArquivo" JSONB,
    "memorialDescritivoArquivo" JSONB,
    "plantaGeorreferenciadaArquivo" JSONB,
    "artRrtTrtArquivo" JSONB,
    "responsavelTecnicoNome" TEXT,
    "responsavelTecnicoRegistro" TEXT,
    "possuiOnusReais" BOOLEAN NOT NULL DEFAULT false,
    "descricaoOnusReais" TEXT,
    "certidaoOnusArquivo" JSONB,
    "possuiAcaoRealReipersecutoria" BOOLEAN NOT NULL DEFAULT false,
    "certidaoAcoesArquivo" JSONB,
    "tituloAquisicaoArquivo" JSONB,
    "cadeiaDominialVerificada" BOOLEAN NOT NULL DEFAULT false,
    "cadeiaDominialObservacoes" TEXT,
    "possuiArrendamento" BOOLEAN NOT NULL DEFAULT false,
    "arrendamentoArquivo" JSONB,
    "possuiParceriaRural" BOOLEAN NOT NULL DEFAULT false,
    "parceriaRuralArquivo" JSONB,
    "licenciamentoAmbientalSituacao" TEXT,
    "licencasAmbientaisArquivo" JSONB,
    "outorgaAguaSituacao" TEXT,
    "outorgaAguaArquivo" JSONB,
    "embargoAmbiental" BOOLEAN NOT NULL DEFAULT false,
    "embargoAmbientalObservacoes" TEXT,
    "documentacaoConferidaEm" TEXT,
    "proximaRevisaoDocumental" TEXT,
    "pendenciasDocumentais" TEXT,
    "observacoes" TEXT,
    "imovelId" UUID NOT NULL,

    CONSTRAINT "DocumentacaoRuralBrasil_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReferenciaClimaticaRural" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID,
    "createdByMemberId" UUID,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedByUserId" UUID,
    "updatedByMemberId" UUID,
    "archivedAt" TIMESTAMPTZ(3),
    "archivedByMemberId" UUID,
    "importHash" TEXT,
    "tipoReferencia" TEXT,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "pais" TEXT,
    "estadoDepartamentoProvincia" TEXT,
    "municipioDistrito" TEXT,
    "regiaoClimatica" TEXT,
    "precipitacaoMediaAnualMm" DECIMAL(65,30),
    "precipitacaoMinimaReferenciaMm" DECIMAL(65,30),
    "precipitacaoMaximaReferenciaMm" DECIMAL(65,30),
    "faixaPluviometrica" TEXT,
    "mesMaisChuvoso" TEXT,
    "mesMaisSeco" TEXT,
    "inicioPeriodoChuvoso" TEXT,
    "fimPeriodoChuvoso" TEXT,
    "diasChuvaAno" INTEGER,
    "temperaturaMediaAnualC" DECIMAL(65,30),
    "temperaturaMinimaMediaC" DECIMAL(65,30),
    "temperaturaMaximaMediaC" DECIMAL(65,30),
    "riscoSeca" TEXT,
    "riscoEncharcamento" TEXT,
    "riscoGeada" TEXT,
    "indiceAridez" DECIMAL(65,30),
    "periodoClimatologicoInicio" INTEGER,
    "periodoClimatologicoFim" INTEGER,
    "estacaoMeteorologica" TEXT,
    "distanciaEstacaoKm" DECIMAL(65,30),
    "fonteDados" TEXT,
    "urlFonte" TEXT,
    "dataConsulta" TEXT,
    "mapaClimatico" JSONB,
    "arquivoDados" JSONB,
    "observacoes" TEXT,
    "imovelId" UUID NOT NULL,

    CONSTRAINT "ReferenciaClimaticaRural_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TipoSolo" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID,
    "createdByMemberId" UUID,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedByUserId" UUID,
    "updatedByMemberId" UUID,
    "archivedAt" TIMESTAMPTZ(3),
    "archivedByMemberId" UUID,
    "importHash" TEXT,
    "nome" TEXT NOT NULL,
    "codigo" TEXT,
    "descricao" TEXT,
    "classeTextural" TEXT,
    "origem" TEXT,
    "corPredominante" TEXT,
    "drenagem" TEXT,
    "fertilidadeNatural" TEXT,
    "materiaOrganica" TEXT,
    "acidez" TEXT,
    "riscoErosao" TEXT,
    "riscoCompactacao" TEXT,
    "riscoEncharcamento" TEXT,
    "aptidaoAgricola" TEXT,
    "aptidaoPastagem" TEXT,
    "aptidaoFlorestal" TEXT,
    "observacoes" TEXT,
    "fonteClassificacao" TEXT,
    "mapaReferencia" JSONB,

    CONSTRAINT "TipoSolo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SoloImovelRural" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID,
    "createdByMemberId" UUID,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedByUserId" UUID,
    "updatedByMemberId" UUID,
    "archivedAt" TIMESTAMPTZ(3),
    "archivedByMemberId" UUID,
    "importHash" TEXT,
    "nomeArea" TEXT NOT NULL,
    "areaHa" DECIMAL(65,30),
    "percentualImovel" DECIMAL(65,30),
    "profundidadeMediaCm" DECIMAL(65,30),
    "declividadeMediaPercentual" DECIMAL(65,30),
    "phMedio" DECIMAL(65,30),
    "materiaOrganicaPercentual" DECIMAL(65,30),
    "teorArgilaPercentual" DECIMAL(65,30),
    "teorAreiaPercentual" DECIMAL(65,30),
    "teorSiltePercentual" DECIMAL(65,30),
    "capacidadeUso" TEXT,
    "usoAtual" TEXT,
    "usoRecomendado" TEXT,
    "necessitaCorrecao" BOOLEAN NOT NULL DEFAULT false,
    "correcaoRecomendada" TEXT,
    "analiseSoloData" TEXT,
    "analiseSoloArquivo" JSONB,
    "mapaSoloArquivo" JSONB,
    "arquivoKmlSolo" JSONB,
    "observacoes" TEXT,
    "imovelId" UUID NOT NULL,
    "tipoSoloId" UUID NOT NULL,

    CONSTRAINT "SoloImovelRural_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopografiaRural" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID,
    "createdByMemberId" UUID,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedByUserId" UUID,
    "updatedByMemberId" UUID,
    "archivedAt" TIMESTAMPTZ(3),
    "archivedByMemberId" UUID,
    "importHash" TEXT,
    "descricao" TEXT NOT NULL,
    "tipoRelevo" TEXT,
    "altitudeMinimaM" DECIMAL(65,30),
    "altitudeMaximaM" DECIMAL(65,30),
    "altitudeMediaM" DECIMAL(65,30),
    "declividadeMediaPercentual" DECIMAL(65,30),
    "declividadeMaximaPercentual" DECIMAL(65,30),
    "areaPlanaPercentual" DECIMAL(65,30),
    "areaOnduladaPercentual" DECIMAL(65,30),
    "riscoErosao" TEXT,
    "mapaTopografico" JSONB,
    "arquivoDem" JSONB,
    "observacoes" TEXT,
    "imovelId" UUID NOT NULL,

    CONSTRAINT "TopografiaRural_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecursoHidricoRural" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID,
    "createdByMemberId" UUID,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedByUserId" UUID,
    "updatedByMemberId" UUID,
    "archivedAt" TIMESTAMPTZ(3),
    "archivedByMemberId" UUID,
    "importHash" TEXT,
    "nome" TEXT NOT NULL,
    "tipo" TEXT,
    "perene" BOOLEAN NOT NULL DEFAULT false,
    "navegavel" BOOLEAN NOT NULL DEFAULT false,
    "extensaoNaPropriedadeKm" DECIMAL(65,30),
    "frentePropriedadeKm" DECIMAL(65,30),
    "vazaoEstimada" DECIMAL(65,30),
    "unidadeVazao" TEXT,
    "qualidadeAgua" TEXT,
    "sazonalidade" TEXT,
    "usoGado" BOOLEAN NOT NULL DEFAULT false,
    "usoIrrigacao" BOOLEAN NOT NULL DEFAULT false,
    "usoHumano" BOOLEAN NOT NULL DEFAULT false,
    "capacidadeAbastecimentoCabecas" INTEGER,
    "areaIrrigavelHa" DECIMAL(65,30),
    "outorgaNecessaria" BOOLEAN NOT NULL DEFAULT false,
    "outorgaSituacao" TEXT,
    "documentoOutorga" JSONB,
    "kml" JSONB,
    "observacoes" TEXT,
    "imovelId" UUID NOT NULL,

    CONSTRAINT "RecursoHidricoRural_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InfraestruturaEnergiaConectividade" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID,
    "createdByMemberId" UUID,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedByUserId" UUID,
    "updatedByMemberId" UUID,
    "archivedAt" TIMESTAMPTZ(3),
    "archivedByMemberId" UUID,
    "importHash" TEXT,
    "descricao" TEXT NOT NULL,
    "energiaDisponivel" BOOLEAN NOT NULL DEFAULT false,
    "tipoRede" TEXT,
    "potenciaInstaladaKva" DECIMAL(65,30),
    "quantidadeTransformadores" INTEGER,
    "gerador" BOOLEAN NOT NULL DEFAULT false,
    "energiaSolar" BOOLEAN NOT NULL DEFAULT false,
    "potenciaSolarKw" DECIMAL(65,30),
    "distanciaRedeEnergiaKm" DECIMAL(65,30),
    "internetFibra" BOOLEAN NOT NULL DEFAULT false,
    "internetRadio" BOOLEAN NOT NULL DEFAULT false,
    "starlink" BOOLEAN NOT NULL DEFAULT false,
    "sinalCelular" TEXT,
    "operadorasDisponiveis" TEXT,
    "observacoes" TEXT,
    "imovelId" UUID NOT NULL,

    CONSTRAINT "InfraestruturaEnergiaConectividade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LogisticaRural" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID,
    "createdByMemberId" UUID,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedByUserId" UUID,
    "updatedByMemberId" UUID,
    "archivedAt" TIMESTAMPTZ(3),
    "archivedByMemberId" UUID,
    "importHash" TEXT,
    "descricao" TEXT NOT NULL,
    "tipoAcessoPrincipal" TEXT,
    "distanciaAsfaltoKm" DECIMAL(65,30),
    "transitavelAnoTodo" BOOLEAN NOT NULL DEFAULT false,
    "restricaoEpocaChuva" BOOLEAN NOT NULL DEFAULT false,
    "acessoCaminhaoBitrem" BOOLEAN NOT NULL DEFAULT false,
    "acessoRodotrem" BOOLEAN NOT NULL DEFAULT false,
    "distanciaCidadeKm" DECIMAL(65,30),
    "distanciaSiloKm" DECIMAL(65,30),
    "distanciaFrigorificoKm" DECIMAL(65,30),
    "distanciaCooperativaKm" DECIMAL(65,30),
    "distanciaPortoKm" DECIMAL(65,30),
    "distanciaFerroviaKm" DECIMAL(65,30),
    "distanciaAeroportoKm" DECIMAL(65,30),
    "distanciaRodoviaPrincipalKm" DECIMAL(65,30),
    "pontesInternas" INTEGER,
    "estradasInternasKm" DECIMAL(65,30),
    "observacoes" TEXT,
    "imovelId" UUID NOT NULL,

    CONSTRAINT "LogisticaRural_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PistaAviacaoRural" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID,
    "createdByMemberId" UUID,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedByUserId" UUID,
    "updatedByMemberId" UUID,
    "archivedAt" TIMESTAMPTZ(3),
    "archivedByMemberId" UUID,
    "importHash" TEXT,
    "nome" TEXT NOT NULL,
    "habilitada" BOOLEAN NOT NULL DEFAULT false,
    "situacaoHabilitacao" TEXT,
    "comprimentoM" DECIMAL(65,30),
    "larguraM" DECIMAL(65,30),
    "tipoPiso" TEXT,
    "orientacao" TEXT,
    "latitude" DECIMAL(65,30),
    "longitude" DECIMAL(65,30),
    "usoNoturno" BOOLEAN NOT NULL DEFAULT false,
    "hangar" BOOLEAN NOT NULL DEFAULT false,
    "combustivelDisponivel" BOOLEAN NOT NULL DEFAULT false,
    "documentoHabilitacao" JSONB,
    "fotos" JSONB,
    "observacoes" TEXT,
    "imovelId" UUID NOT NULL,

    CONSTRAINT "PistaAviacaoRural_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BenfeitoriaRural" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID,
    "createdByMemberId" UUID,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedByUserId" UUID,
    "updatedByMemberId" UUID,
    "archivedAt" TIMESTAMPTZ(3),
    "archivedByMemberId" UUID,
    "importHash" TEXT,
    "nome" TEXT NOT NULL,
    "tipo" TEXT,
    "quantidade" INTEGER,
    "areaConstruidaM2" DECIMAL(65,30),
    "anoConstrucao" INTEGER,
    "estadoConservacao" TEXT,
    "valorEstimado" DECIMAL(65,30),
    "moeda" TEXT,
    "incluidaVenda" BOOLEAN NOT NULL DEFAULT false,
    "fotos" JSONB,
    "documentos" JSONB,
    "observacoes" TEXT,
    "imovelId" UUID NOT NULL,

    CONSTRAINT "BenfeitoriaRural_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DivisaoOperacionalRural" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID,
    "createdByMemberId" UUID,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedByUserId" UUID,
    "updatedByMemberId" UUID,
    "archivedAt" TIMESTAMPTZ(3),
    "archivedByMemberId" UUID,
    "importHash" TEXT,
    "nome" TEXT NOT NULL,
    "tipo" TEXT,
    "areaHa" DECIMAL(65,30),
    "usoAtual" TEXT,
    "capacidadeCabecas" INTEGER,
    "cercaTipo" TEXT,
    "cercaEstado" TEXT,
    "bebedouro" BOOLEAN NOT NULL DEFAULT false,
    "cocho" BOOLEAN NOT NULL DEFAULT false,
    "kml" JSONB,
    "observacoes" TEXT,
    "imovelId" UUID NOT NULL,

    CONSTRAINT "DivisaoOperacionalRural_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProducaoHistoricaRural" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID,
    "createdByMemberId" UUID,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedByUserId" UUID,
    "updatedByMemberId" UUID,
    "archivedAt" TIMESTAMPTZ(3),
    "archivedByMemberId" UUID,
    "importHash" TEXT,
    "safraAno" TEXT NOT NULL,
    "atividade" TEXT,
    "areaHa" DECIMAL(65,30),
    "producaoTotal" DECIMAL(65,30),
    "unidadeProducao" TEXT,
    "produtividadePorHa" DECIMAL(65,30),
    "cabecasMediaAno" INTEGER,
    "uaHa" DECIMAL(65,30),
    "observacoes" TEXT,
    "documentos" JSONB,
    "imovelId" UUID NOT NULL,

    CONSTRAINT "ProducaoHistoricaRural_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SistemaProdutivoRural" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID,
    "createdByMemberId" UUID,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedByUserId" UUID,
    "updatedByMemberId" UUID,
    "archivedAt" TIMESTAMPTZ(3),
    "archivedByMemberId" UUID,
    "importHash" TEXT,
    "nome" TEXT NOT NULL,
    "tipo" TEXT,
    "areaHa" DECIMAL(65,30),
    "irrigado" BOOLEAN NOT NULL DEFAULT false,
    "tipoIrrigacao" TEXT,
    "quantidadePivos" INTEGER,
    "areaIrrigadaHa" DECIMAL(65,30),
    "fonteAgua" TEXT,
    "capacidadeIrrigacaoHa" DECIMAL(65,30),
    "certificadoOrganico" BOOLEAN NOT NULL DEFAULT false,
    "observacoes" TEXT,
    "imovelId" UUID NOT NULL,

    CONSTRAINT "SistemaProdutivoRural_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AtivoIncluidoVendaRural" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID,
    "createdByMemberId" UUID,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedByUserId" UUID,
    "updatedByMemberId" UUID,
    "archivedAt" TIMESTAMPTZ(3),
    "archivedByMemberId" UUID,
    "importHash" TEXT,
    "nome" TEXT NOT NULL,
    "tipo" TEXT,
    "descricao" TEXT,
    "quantidade" DECIMAL(65,30),
    "valorEstimado" DECIMAL(65,30),
    "moeda" TEXT,
    "incluidoPreco" BOOLEAN NOT NULL DEFAULT false,
    "documentos" JSONB,
    "fotos" JSONB,
    "imovelId" UUID NOT NULL,

    CONSTRAINT "AtivoIncluidoVendaRural_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RestricaoTerritorialRural" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID,
    "createdByMemberId" UUID,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedByUserId" UUID,
    "updatedByMemberId" UUID,
    "archivedAt" TIMESTAMPTZ(3),
    "archivedByMemberId" UUID,
    "importHash" TEXT,
    "tipo" TEXT NOT NULL,
    "descricao" TEXT,
    "areaAfetadaHa" DECIMAL(65,30),
    "extensaoKm" DECIMAL(65,30),
    "impacto" TEXT,
    "regularizada" BOOLEAN NOT NULL DEFAULT false,
    "documentos" JSONB,
    "kml" JSONB,
    "imovelId" UUID NOT NULL,

    CONSTRAINT "RestricaoTerritorialRural_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiscoRural" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID,
    "createdByMemberId" UUID,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedByUserId" UUID,
    "updatedByMemberId" UUID,
    "archivedAt" TIMESTAMPTZ(3),
    "archivedByMemberId" UUID,
    "importHash" TEXT,
    "tipo" TEXT NOT NULL,
    "nivel" TEXT,
    "descricao" TEXT,
    "historicoOcorrencia" BOOLEAN NOT NULL DEFAULT false,
    "ultimaOcorrencia" TEXT,
    "areaAfetadaHa" DECIMAL(65,30),
    "mitigacaoExistente" BOOLEAN NOT NULL DEFAULT false,
    "descricaoMitigacao" TEXT,
    "documentos" JSONB,
    "imovelId" UUID NOT NULL,

    CONSTRAINT "RiscoRural_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CertificacaoSustentabilidadeRural" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID,
    "createdByMemberId" UUID,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedByUserId" UUID,
    "updatedByMemberId" UUID,
    "archivedAt" TIMESTAMPTZ(3),
    "archivedByMemberId" UUID,
    "importHash" TEXT,
    "nome" TEXT NOT NULL,
    "tipo" TEXT,
    "entidadeCertificadora" TEXT,
    "numeroCertificado" TEXT,
    "dataEmissao" TEXT,
    "dataValidade" TEXT,
    "status" TEXT,
    "areaCertificadaHa" DECIMAL(65,30),
    "potencialCreditoCarbono" BOOLEAN NOT NULL DEFAULT false,
    "projetoCarbonoAtivo" BOOLEAN NOT NULL DEFAULT false,
    "estimativaCarbonoTco2e" DECIMAL(65,30),
    "documentos" JSONB,
    "imovelId" UUID NOT NULL,

    CONSTRAINT "CertificacaoSustentabilidadeRural_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CondicaoComercialRural" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID,
    "createdByMemberId" UUID,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedByUserId" UUID,
    "updatedByMemberId" UUID,
    "archivedAt" TIMESTAMPTZ(3),
    "archivedByMemberId" UUID,
    "importHash" TEXT,
    "precoPorHa" DECIMAL(65,30) NOT NULL,
    "moeda" TEXT,
    "valorTotal" DECIMAL(65,30),
    "aceitaParcelamento" BOOLEAN NOT NULL DEFAULT false,
    "percentualEntrada" DECIMAL(65,30),
    "numeroParcelas" INTEGER,
    "aceitaPermuta" BOOLEAN NOT NULL DEFAULT false,
    "aceitaFinanciamento" BOOLEAN NOT NULL DEFAULT false,
    "comissaoImobiliariaPercentual" DECIMAL(65,30),
    "comissaoCorretorPercentual" DECIMAL(65,30),
    "exclusividade" BOOLEAN NOT NULL DEFAULT false,
    "dataInicioExclusividade" TEXT,
    "dataFimExclusividade" TEXT,
    "motivoVenda" TEXT,
    "observacoes" TEXT,
    "imovelId" UUID NOT NULL,

    CONSTRAINT "CondicaoComercialRural_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DueDiligenceRural" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" UUID,
    "createdByMemberId" UUID,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedByUserId" UUID,
    "updatedByMemberId" UUID,
    "archivedAt" TIMESTAMPTZ(3),
    "archivedByMemberId" UUID,
    "importHash" TEXT,
    "titulo" TEXT NOT NULL,
    "dataAnalise" TEXT,
    "status" TEXT,
    "riscoFundiario" TEXT,
    "riscoAmbiental" TEXT,
    "riscoFiscal" TEXT,
    "riscoTrabalhista" TEXT,
    "riscoDocumental" TEXT,
    "notaDocumentacao" DECIMAL(65,30),
    "notaInfraestrutura" DECIMAL(65,30),
    "notaLogistica" DECIMAL(65,30),
    "notaRecursosHidricos" DECIMAL(65,30),
    "notaClima" DECIMAL(65,30),
    "notaSolo" DECIMAL(65,30),
    "notaAptidaoAgricola" DECIMAL(65,30),
    "notaAptidaoPecuaria" DECIMAL(65,30),
    "notaAmbiental" DECIMAL(65,30),
    "scoreGeral" DECIMAL(65,30),
    "classificacaoFinal" TEXT,
    "pendencias" TEXT,
    "recomendacoes" TEXT,
    "relatorio" JSONB,
    "imovelId" UUID NOT NULL,

    CONSTRAINT "DueDiligenceRural_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invitation" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "organizationId" UUID NOT NULL,
    "inviterId" UUID NOT NULL,
    "role" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatbotUsage" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "date" DATE NOT NULL,
    "inputTokens" INTEGER NOT NULL DEFAULT 0,
    "outputTokens" INTEGER NOT NULL DEFAULT 0,
    "totalTokens" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ChatbotUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" UUID NOT NULL,
    "activeOrganizationId" UUID,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TwoFactor" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "secret" TEXT NOT NULL,
    "backupCodes" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT true,
    "userId" UUID NOT NULL,

    CONSTRAINT "TwoFactor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMPTZ(3),
    "refreshTokenExpiresAt" TIMESTAMPTZ(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Verification" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OauthApplication" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT,
    "icon" TEXT,
    "metadata" TEXT,
    "clientId" TEXT,
    "clientSecret" TEXT,
    "redirectUrls" TEXT,
    "type" TEXT,
    "disabled" BOOLEAN DEFAULT false,
    "userId" UUID,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "OauthApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OauthAccessToken" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMPTZ(3),
    "refreshTokenExpiresAt" TIMESTAMPTZ(3),
    "clientId" TEXT,
    "userId" UUID,
    "scopes" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "OauthAccessToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OauthConsent" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clientId" TEXT,
    "userId" UUID,
    "scopes" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "consentGiven" BOOLEAN,

    CONSTRAINT "OauthConsent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_key_key" ON "ApiKey"("key");

-- CreateIndex
CREATE INDEX "ApiKey_organizationId_idx" ON "ApiKey"("organizationId");

-- CreateIndex
CREATE INDEX "PushToken_userId_idx" ON "PushToken"("userId");

-- CreateIndex
CREATE INDEX "PushToken_type_idx" ON "PushToken"("type");

-- CreateIndex
CREATE UNIQUE INDEX "PushToken_userId_token_key" ON "PushToken"("userId", "token");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_organizationId_idx" ON "Notification"("organizationId");

-- CreateIndex
CREATE INDEX "Notification_userId_readAt_idx" ON "Notification"("userId", "readAt");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Member_importHash_key" ON "Member"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "Member_id_organizationId_key" ON "Member"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Member_userId_organizationId_key" ON "Member"("userId", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripeSubscriptionId_key" ON "Subscription"("stripeSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "Filial_importHash_key" ON "Filial"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "Filial_codigo_organizationId_key" ON "Filial"("codigo", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Filial_id_organizationId_key" ON "Filial"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Corretor_importHash_key" ON "Corretor"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "Corretor_cpfCnpj_organizationId_key" ON "Corretor"("cpfCnpj", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Corretor_creci_organizationId_key" ON "Corretor"("creci", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Corretor_id_organizationId_key" ON "Corretor"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Proprietario_importHash_key" ON "Proprietario"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "Proprietario_cpfCnpj_organizationId_key" ON "Proprietario"("cpfCnpj", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Proprietario_id_organizationId_key" ON "Proprietario"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_importHash_key" ON "Cliente"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_cpfCnpj_organizationId_key" ON "Cliente"("cpfCnpj", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_id_organizationId_key" ON "Cliente"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Condominio_importHash_key" ON "Condominio"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "Condominio_id_organizationId_key" ON "Condominio"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Empreendimento_importHash_key" ON "Empreendimento"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "Empreendimento_id_organizationId_key" ON "Empreendimento"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Imovel_importHash_key" ON "Imovel"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "Imovel_codigo_organizationId_key" ON "Imovel"("codigo", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Imovel_id_organizationId_key" ON "Imovel"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "CaracteristicaImovel_importHash_key" ON "CaracteristicaImovel"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "CaracteristicaImovel_nome_organizationId_key" ON "CaracteristicaImovel"("nome", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "CaracteristicaImovel_id_organizationId_key" ON "CaracteristicaImovel"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "ImovelCaracteristica_importHash_key" ON "ImovelCaracteristica"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "ImovelCaracteristica_id_organizationId_key" ON "ImovelCaracteristica"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "MidiaImovel_importHash_key" ON "MidiaImovel"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "MidiaImovel_id_organizationId_key" ON "MidiaImovel"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentoImovel_importHash_key" ON "DocumentoImovel"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentoImovel_id_organizationId_key" ON "DocumentoImovel"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "CaptacaoImovel_importHash_key" ON "CaptacaoImovel"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "CaptacaoImovel_codigo_organizationId_key" ON "CaptacaoImovel"("codigo", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "CaptacaoImovel_id_organizationId_key" ON "CaptacaoImovel"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "AvaliacaoImovel_importHash_key" ON "AvaliacaoImovel"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "AvaliacaoImovel_codigo_organizationId_key" ON "AvaliacaoImovel"("codigo", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "AvaliacaoImovel_id_organizationId_key" ON "AvaliacaoImovel"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "ChaveImovel_importHash_key" ON "ChaveImovel"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "ChaveImovel_codigo_organizationId_key" ON "ChaveImovel"("codigo", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "ChaveImovel_id_organizationId_key" ON "ChaveImovel"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Vistoria_importHash_key" ON "Vistoria"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "Vistoria_codigo_organizationId_key" ON "Vistoria"("codigo", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Vistoria_id_organizationId_key" ON "Vistoria"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "ItemVistoria_importHash_key" ON "ItemVistoria"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "ItemVistoria_id_organizationId_key" ON "ItemVistoria"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Anuncio_importHash_key" ON "Anuncio"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "Anuncio_slug_organizationId_key" ON "Anuncio"("slug", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Anuncio_id_organizationId_key" ON "Anuncio"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "PortalImobiliario_importHash_key" ON "PortalImobiliario"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "PortalImobiliario_nome_organizationId_key" ON "PortalImobiliario"("nome", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "PortalImobiliario_id_organizationId_key" ON "PortalImobiliario"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "PublicacaoPortal_importHash_key" ON "PublicacaoPortal"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "PublicacaoPortal_id_organizationId_key" ON "PublicacaoPortal"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "CampanhaMarketing_importHash_key" ON "CampanhaMarketing"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "CampanhaMarketing_id_organizationId_key" ON "CampanhaMarketing"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "CampanhaAnuncio_importHash_key" ON "CampanhaAnuncio"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "CampanhaAnuncio_id_organizationId_key" ON "CampanhaAnuncio"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_importHash_key" ON "Lead"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_id_organizationId_key" ON "Lead"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "InteracaoLead_importHash_key" ON "InteracaoLead"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "InteracaoLead_id_organizationId_key" ON "InteracaoLead"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "TarefaComercial_importHash_key" ON "TarefaComercial"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "TarefaComercial_id_organizationId_key" ON "TarefaComercial"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Visita_importHash_key" ON "Visita"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "Visita_codigo_organizationId_key" ON "Visita"("codigo", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Visita_id_organizationId_key" ON "Visita"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Proposta_importHash_key" ON "Proposta"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "Proposta_codigo_organizationId_key" ON "Proposta"("codigo", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Proposta_id_organizationId_key" ON "Proposta"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "CondicaoProposta_importHash_key" ON "CondicaoProposta"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "CondicaoProposta_id_organizationId_key" ON "CondicaoProposta"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "ReservaImovel_importHash_key" ON "ReservaImovel"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "ReservaImovel_codigo_organizationId_key" ON "ReservaImovel"("codigo", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "ReservaImovel_id_organizationId_key" ON "ReservaImovel"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Venda_importHash_key" ON "Venda"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "Venda_codigo_organizationId_key" ON "Venda"("codigo", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Venda_id_organizationId_key" ON "Venda"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "ContratoVenda_importHash_key" ON "ContratoVenda"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "ContratoVenda_numero_organizationId_key" ON "ContratoVenda"("numero", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "ContratoVenda_id_organizationId_key" ON "ContratoVenda"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "ParcelaVenda_importHash_key" ON "ParcelaVenda"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "ParcelaVenda_id_organizationId_key" ON "ParcelaVenda"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Locacao_importHash_key" ON "Locacao"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "Locacao_codigo_organizationId_key" ON "Locacao"("codigo", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Locacao_id_organizationId_key" ON "Locacao"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "ParticipanteLocacao_importHash_key" ON "ParticipanteLocacao"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "ParticipanteLocacao_id_organizationId_key" ON "ParticipanteLocacao"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "GarantiaLocacao_importHash_key" ON "GarantiaLocacao"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "GarantiaLocacao_id_organizationId_key" ON "GarantiaLocacao"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "ContratoLocacao_importHash_key" ON "ContratoLocacao"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "ContratoLocacao_numero_organizationId_key" ON "ContratoLocacao"("numero", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "ContratoLocacao_id_organizationId_key" ON "ContratoLocacao"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "CobrancaLocacao_importHash_key" ON "CobrancaLocacao"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "CobrancaLocacao_id_organizationId_key" ON "CobrancaLocacao"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "PagamentoLocacao_importHash_key" ON "PagamentoLocacao"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "PagamentoLocacao_id_organizationId_key" ON "PagamentoLocacao"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "ReajusteLocacao_importHash_key" ON "ReajusteLocacao"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "ReajusteLocacao_id_organizationId_key" ON "ReajusteLocacao"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "RepasseProprietario_importHash_key" ON "RepasseProprietario"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "RepasseProprietario_id_organizationId_key" ON "RepasseProprietario"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Comissao_importHash_key" ON "Comissao"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "Comissao_codigo_organizationId_key" ON "Comissao"("codigo", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Comissao_id_organizationId_key" ON "Comissao"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "PagamentoComissao_importHash_key" ON "PagamentoComissao"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "PagamentoComissao_id_organizationId_key" ON "PagamentoComissao"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Fornecedor_importHash_key" ON "Fornecedor"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "Fornecedor_cpfCnpj_organizationId_key" ON "Fornecedor"("cpfCnpj", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Fornecedor_id_organizationId_key" ON "Fornecedor"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "SolicitacaoManutencao_importHash_key" ON "SolicitacaoManutencao"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "SolicitacaoManutencao_codigo_organizationId_key" ON "SolicitacaoManutencao"("codigo", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "SolicitacaoManutencao_id_organizationId_key" ON "SolicitacaoManutencao"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "OrdemServico_importHash_key" ON "OrdemServico"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "OrdemServico_codigo_organizationId_key" ON "OrdemServico"("codigo", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "OrdemServico_id_organizationId_key" ON "OrdemServico"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "DespesaImovel_importHash_key" ON "DespesaImovel"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "DespesaImovel_id_organizationId_key" ON "DespesaImovel"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "ContaFinanceira_importHash_key" ON "ContaFinanceira"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "ContaFinanceira_nome_organizationId_key" ON "ContaFinanceira"("nome", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "ContaFinanceira_id_organizationId_key" ON "ContaFinanceira"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "CategoriaFinanceira_importHash_key" ON "CategoriaFinanceira"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "CategoriaFinanceira_nome_organizationId_key" ON "CategoriaFinanceira"("nome", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "CategoriaFinanceira_id_organizationId_key" ON "CategoriaFinanceira"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "LancamentoFinanceiro_importHash_key" ON "LancamentoFinanceiro"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "LancamentoFinanceiro_id_organizationId_key" ON "LancamentoFinanceiro"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentoPessoa_importHash_key" ON "DocumentoPessoa"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentoPessoa_id_organizationId_key" ON "DocumentoPessoa"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "ConsentimentoLGPD_importHash_key" ON "ConsentimentoLGPD"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "ConsentimentoLGPD_id_organizationId_key" ON "ConsentimentoLGPD"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "FavoritoCliente_importHash_key" ON "FavoritoCliente"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "FavoritoCliente_id_organizationId_key" ON "FavoritoCliente"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "SolicitacaoContato_importHash_key" ON "SolicitacaoContato"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "SolicitacaoContato_id_organizationId_key" ON "SolicitacaoContato"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "SimulacaoFinanciamento_importHash_key" ON "SimulacaoFinanciamento"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "SimulacaoFinanciamento_id_organizationId_key" ON "SimulacaoFinanciamento"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "ContratoAdministracao_importHash_key" ON "ContratoAdministracao"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "ContratoAdministracao_numero_organizationId_key" ON "ContratoAdministracao"("numero", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "ContratoAdministracao_id_organizationId_key" ON "ContratoAdministracao"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "SeguroImovel_importHash_key" ON "SeguroImovel"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "SeguroImovel_numeroApolice_organizationId_key" ON "SeguroImovel"("numeroApolice", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "SeguroImovel_id_organizationId_key" ON "SeguroImovel"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "OcorrenciaImovel_importHash_key" ON "OcorrenciaImovel"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "OcorrenciaImovel_codigo_organizationId_key" ON "OcorrenciaImovel"("codigo", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "OcorrenciaImovel_id_organizationId_key" ON "OcorrenciaImovel"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "ArquivoKml_importHash_key" ON "ArquivoKml"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "ArquivoKml_id_organizationId_key" ON "ArquivoKml"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentacaoRuralBrasil_importHash_key" ON "DocumentacaoRuralBrasil"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentacaoRuralBrasil_id_organizationId_key" ON "DocumentacaoRuralBrasil"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "ReferenciaClimaticaRural_importHash_key" ON "ReferenciaClimaticaRural"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "ReferenciaClimaticaRural_id_organizationId_key" ON "ReferenciaClimaticaRural"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "TipoSolo_importHash_key" ON "TipoSolo"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "TipoSolo_id_organizationId_key" ON "TipoSolo"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "SoloImovelRural_importHash_key" ON "SoloImovelRural"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "SoloImovelRural_id_organizationId_key" ON "SoloImovelRural"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "TopografiaRural_importHash_key" ON "TopografiaRural"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "TopografiaRural_id_organizationId_key" ON "TopografiaRural"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "RecursoHidricoRural_importHash_key" ON "RecursoHidricoRural"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "RecursoHidricoRural_id_organizationId_key" ON "RecursoHidricoRural"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "InfraestruturaEnergiaConectividade_importHash_key" ON "InfraestruturaEnergiaConectividade"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "InfraestruturaEnergiaConectividade_id_organizationId_key" ON "InfraestruturaEnergiaConectividade"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "LogisticaRural_importHash_key" ON "LogisticaRural"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "LogisticaRural_id_organizationId_key" ON "LogisticaRural"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "PistaAviacaoRural_importHash_key" ON "PistaAviacaoRural"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "PistaAviacaoRural_id_organizationId_key" ON "PistaAviacaoRural"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "BenfeitoriaRural_importHash_key" ON "BenfeitoriaRural"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "BenfeitoriaRural_id_organizationId_key" ON "BenfeitoriaRural"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "DivisaoOperacionalRural_importHash_key" ON "DivisaoOperacionalRural"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "DivisaoOperacionalRural_id_organizationId_key" ON "DivisaoOperacionalRural"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "ProducaoHistoricaRural_importHash_key" ON "ProducaoHistoricaRural"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "ProducaoHistoricaRural_id_organizationId_key" ON "ProducaoHistoricaRural"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "SistemaProdutivoRural_importHash_key" ON "SistemaProdutivoRural"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "SistemaProdutivoRural_id_organizationId_key" ON "SistemaProdutivoRural"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "AtivoIncluidoVendaRural_importHash_key" ON "AtivoIncluidoVendaRural"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "AtivoIncluidoVendaRural_id_organizationId_key" ON "AtivoIncluidoVendaRural"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "RestricaoTerritorialRural_importHash_key" ON "RestricaoTerritorialRural"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "RestricaoTerritorialRural_id_organizationId_key" ON "RestricaoTerritorialRural"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "RiscoRural_importHash_key" ON "RiscoRural"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "RiscoRural_id_organizationId_key" ON "RiscoRural"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "CertificacaoSustentabilidadeRural_importHash_key" ON "CertificacaoSustentabilidadeRural"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "CertificacaoSustentabilidadeRural_id_organizationId_key" ON "CertificacaoSustentabilidadeRural"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "CondicaoComercialRural_importHash_key" ON "CondicaoComercialRural"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "CondicaoComercialRural_id_organizationId_key" ON "CondicaoComercialRural"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "DueDiligenceRural_importHash_key" ON "DueDiligenceRural"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "DueDiligenceRural_id_organizationId_key" ON "DueDiligenceRural"("id", "organizationId");

-- CreateIndex
CREATE INDEX "ChatbotUsage_organizationId_date_idx" ON "ChatbotUsage"("organizationId", "date");

-- CreateIndex
CREATE INDEX "ChatbotUsage_date_idx" ON "ChatbotUsage"("date");

-- CreateIndex
CREATE UNIQUE INDEX "ChatbotUsage_userId_date_key" ON "ChatbotUsage"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE INDEX "TwoFactor_secret_idx" ON "TwoFactor"("secret");

-- CreateIndex
CREATE INDEX "TwoFactor_userId_idx" ON "TwoFactor"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "OauthApplication_clientId_key" ON "OauthApplication"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "OauthAccessToken_accessToken_key" ON "OauthAccessToken"("accessToken");

-- CreateIndex
CREATE UNIQUE INDEX "OauthAccessToken_refreshToken_key" ON "OauthAccessToken"("refreshToken");

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_referenceId_fkey" FOREIGN KEY ("referenceId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PushToken" ADD CONSTRAINT "PushToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_updatedByMemberId_fkey" FOREIGN KEY ("updatedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Filial" ADD CONSTRAINT "filialOrganization" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Filial" ADD CONSTRAINT "Filial_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Filial" ADD CONSTRAINT "Filial_updatedByMemberId_fkey" FOREIGN KEY ("updatedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Filial" ADD CONSTRAINT "Filial_archivedByMemberId_fkey" FOREIGN KEY ("archivedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Corretor" ADD CONSTRAINT "corretorOrganization" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Corretor" ADD CONSTRAINT "Corretor_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Corretor" ADD CONSTRAINT "Corretor_updatedByMemberId_fkey" FOREIGN KEY ("updatedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Corretor" ADD CONSTRAINT "Corretor_archivedByMemberId_fkey" FOREIGN KEY ("archivedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Corretor" ADD CONSTRAINT "Corretor_contaMembroId_fkey" FOREIGN KEY ("contaMembroId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Corretor" ADD CONSTRAINT "Corretor_filialId_fkey" FOREIGN KEY ("filialId") REFERENCES "Filial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proprietario" ADD CONSTRAINT "proprietarioOrganization" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proprietario" ADD CONSTRAINT "Proprietario_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proprietario" ADD CONSTRAINT "Proprietario_updatedByMemberId_fkey" FOREIGN KEY ("updatedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proprietario" ADD CONSTRAINT "Proprietario_archivedByMemberId_fkey" FOREIGN KEY ("archivedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proprietario" ADD CONSTRAINT "Proprietario_filialId_fkey" FOREIGN KEY ("filialId") REFERENCES "Filial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cliente" ADD CONSTRAINT "clienteOrganization" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cliente" ADD CONSTRAINT "Cliente_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cliente" ADD CONSTRAINT "Cliente_updatedByMemberId_fkey" FOREIGN KEY ("updatedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cliente" ADD CONSTRAINT "Cliente_archivedByMemberId_fkey" FOREIGN KEY ("archivedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cliente" ADD CONSTRAINT "Cliente_filialId_fkey" FOREIGN KEY ("filialId") REFERENCES "Filial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Condominio" ADD CONSTRAINT "condominioOrganization" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Condominio" ADD CONSTRAINT "Condominio_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Condominio" ADD CONSTRAINT "Condominio_updatedByMemberId_fkey" FOREIGN KEY ("updatedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Condominio" ADD CONSTRAINT "Condominio_archivedByMemberId_fkey" FOREIGN KEY ("archivedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Empreendimento" ADD CONSTRAINT "empreendimentoOrganization" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Empreendimento" ADD CONSTRAINT "Empreendimento_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Empreendimento" ADD CONSTRAINT "Empreendimento_updatedByMemberId_fkey" FOREIGN KEY ("updatedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Empreendimento" ADD CONSTRAINT "Empreendimento_archivedByMemberId_fkey" FOREIGN KEY ("archivedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Imovel" ADD CONSTRAINT "imovelOrganization" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Imovel" ADD CONSTRAINT "Imovel_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Imovel" ADD CONSTRAINT "Imovel_updatedByMemberId_fkey" FOREIGN KEY ("updatedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Imovel" ADD CONSTRAINT "Imovel_archivedByMemberId_fkey" FOREIGN KEY ("archivedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Imovel" ADD CONSTRAINT "Imovel_filialId_fkey" FOREIGN KEY ("filialId") REFERENCES "Filial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Imovel" ADD CONSTRAINT "Imovel_proprietarioId_fkey" FOREIGN KEY ("proprietarioId") REFERENCES "Proprietario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Imovel" ADD CONSTRAINT "Imovel_corretorResponsavelId_fkey" FOREIGN KEY ("corretorResponsavelId") REFERENCES "Corretor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Imovel" ADD CONSTRAINT "Imovel_condominioId_fkey" FOREIGN KEY ("condominioId") REFERENCES "Condominio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Imovel" ADD CONSTRAINT "Imovel_empreendimentoId_fkey" FOREIGN KEY ("empreendimentoId") REFERENCES "Empreendimento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaracteristicaImovel" ADD CONSTRAINT "caracteristicaImovelOrganization" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaracteristicaImovel" ADD CONSTRAINT "CaracteristicaImovel_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaracteristicaImovel" ADD CONSTRAINT "CaracteristicaImovel_updatedByMemberId_fkey" FOREIGN KEY ("updatedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaracteristicaImovel" ADD CONSTRAINT "CaracteristicaImovel_archivedByMemberId_fkey" FOREIGN KEY ("archivedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImovelCaracteristica" ADD CONSTRAINT "imovelCaracteristicaOrganization" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImovelCaracteristica" ADD CONSTRAINT "ImovelCaracteristica_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImovelCaracteristica" ADD CONSTRAINT "ImovelCaracteristica_updatedByMemberId_fkey" FOREIGN KEY ("updatedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImovelCaracteristica" ADD CONSTRAINT "ImovelCaracteristica_archivedByMemberId_fkey" FOREIGN KEY ("archivedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImovelCaracteristica" ADD CONSTRAINT "ImovelCaracteristica_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "Imovel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImovelCaracteristica" ADD CONSTRAINT "ImovelCaracteristica_caracteristicaId_fkey" FOREIGN KEY ("caracteristicaId") REFERENCES "CaracteristicaImovel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MidiaImovel" ADD CONSTRAINT "midiaImovelOrganization" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MidiaImovel" ADD CONSTRAINT "MidiaImovel_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MidiaImovel" ADD CONSTRAINT "MidiaImovel_updatedByMemberId_fkey" FOREIGN KEY ("updatedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MidiaImovel" ADD CONSTRAINT "MidiaImovel_archivedByMemberId_fkey" FOREIGN KEY ("archivedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MidiaImovel" ADD CONSTRAINT "MidiaImovel_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "Imovel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoImovel" ADD CONSTRAINT "documentoImovelOrganization" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoImovel" ADD CONSTRAINT "DocumentoImovel_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoImovel" ADD CONSTRAINT "DocumentoImovel_updatedByMemberId_fkey" FOREIGN KEY ("updatedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoImovel" ADD CONSTRAINT "DocumentoImovel_archivedByMemberId_fkey" FOREIGN KEY ("archivedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoImovel" ADD CONSTRAINT "DocumentoImovel_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "Imovel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaptacaoImovel" ADD CONSTRAINT "captacaoImovelOrganization" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaptacaoImovel" ADD CONSTRAINT "CaptacaoImovel_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaptacaoImovel" ADD CONSTRAINT "CaptacaoImovel_updatedByMemberId_fkey" FOREIGN KEY ("updatedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaptacaoImovel" ADD CONSTRAINT "CaptacaoImovel_archivedByMemberId_fkey" FOREIGN KEY ("archivedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaptacaoImovel" ADD CONSTRAINT "CaptacaoImovel_filialId_fkey" FOREIGN KEY ("filialId") REFERENCES "Filial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaptacaoImovel" ADD CONSTRAINT "CaptacaoImovel_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "Imovel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaptacaoImovel" ADD CONSTRAINT "CaptacaoImovel_proprietarioId_fkey" FOREIGN KEY ("proprietarioId") REFERENCES "Proprietario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaptacaoImovel" ADD CONSTRAINT "CaptacaoImovel_corretorId_fkey" FOREIGN KEY ("corretorId") REFERENCES "Corretor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvaliacaoImovel" ADD CONSTRAINT "avaliacaoImovelOrganization" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvaliacaoImovel" ADD CONSTRAINT "AvaliacaoImovel_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvaliacaoImovel" ADD CONSTRAINT "AvaliacaoImovel_updatedByMemberId_fkey" FOREIGN KEY ("updatedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvaliacaoImovel" ADD CONSTRAINT "AvaliacaoImovel_archivedByMemberId_fkey" FOREIGN KEY ("archivedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvaliacaoImovel" ADD CONSTRAINT "AvaliacaoImovel_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "Imovel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvaliacaoImovel" ADD CONSTRAINT "AvaliacaoImovel_avaliadorId_fkey" FOREIGN KEY ("avaliadorId") REFERENCES "Corretor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChaveImovel" ADD CONSTRAINT "chaveImovelOrganization" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChaveImovel" ADD CONSTRAINT "ChaveImovel_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChaveImovel" ADD CONSTRAINT "ChaveImovel_updatedByMemberId_fkey" FOREIGN KEY ("updatedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChaveImovel" ADD CONSTRAINT "ChaveImovel_archivedByMemberId_fkey" FOREIGN KEY ("archivedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChaveImovel" ADD CONSTRAINT "ChaveImovel_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "Imovel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vistoria" ADD CONSTRAINT "vistoriaOrganization" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vistoria" ADD CONSTRAINT "Vistoria_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vistoria" ADD CONSTRAINT "Vistoria_updatedByMemberId_fkey" FOREIGN KEY ("updatedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vistoria" ADD CONSTRAINT "Vistoria_archivedByMemberId_fkey" FOREIGN KEY ("archivedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vistoria" ADD CONSTRAINT "Vistoria_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "Imovel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vistoria" ADD CONSTRAINT "Vistoria_corretorId_fkey" FOREIGN KEY ("corretorId") REFERENCES "Corretor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemVistoria" ADD CONSTRAINT "itemVistoriaOrganization" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemVistoria" ADD CONSTRAINT "ItemVistoria_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemVistoria" ADD CONSTRAINT "ItemVistoria_updatedByMemberId_fkey" FOREIGN KEY ("updatedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemVistoria" ADD CONSTRAINT "ItemVistoria_archivedByMemberId_fkey" FOREIGN KEY ("archivedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemVistoria" ADD CONSTRAINT "ItemVistoria_vistoriaId_fkey" FOREIGN KEY ("vistoriaId") REFERENCES "Vistoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anuncio" ADD CONSTRAINT "anuncioOrganization" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anuncio" ADD CONSTRAINT "Anuncio_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anuncio" ADD CONSTRAINT "Anuncio_updatedByMemberId_fkey" FOREIGN KEY ("updatedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anuncio" ADD CONSTRAINT "Anuncio_archivedByMemberId_fkey" FOREIGN KEY ("archivedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anuncio" ADD CONSTRAINT "Anuncio_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "Imovel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anuncio" ADD CONSTRAINT "Anuncio_corretorId_fkey" FOREIGN KEY ("corretorId") REFERENCES "Corretor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortalImobiliario" ADD CONSTRAINT "portalImobiliarioOrganization" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortalImobiliario" ADD CONSTRAINT "PortalImobiliario_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortalImobiliario" ADD CONSTRAINT "PortalImobiliario_updatedByMemberId_fkey" FOREIGN KEY ("updatedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortalImobiliario" ADD CONSTRAINT "PortalImobiliario_archivedByMemberId_fkey" FOREIGN KEY ("archivedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicacaoPortal" ADD CONSTRAINT "publicacaoPortalOrganization" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicacaoPortal" ADD CONSTRAINT "PublicacaoPortal_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicacaoPortal" ADD CONSTRAINT "PublicacaoPortal_updatedByMemberId_fkey" FOREIGN KEY ("updatedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicacaoPortal" ADD CONSTRAINT "PublicacaoPortal_archivedByMemberId_fkey" FOREIGN KEY ("archivedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicacaoPortal" ADD CONSTRAINT "PublicacaoPortal_anuncioId_fkey" FOREIGN KEY ("anuncioId") REFERENCES "Anuncio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicacaoPortal" ADD CONSTRAINT "PublicacaoPortal_portalId_fkey" FOREIGN KEY ("portalId") REFERENCES "PortalImobiliario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampanhaMarketing" ADD CONSTRAINT "campanhaMarketingOrganization" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampanhaMarketing" ADD CONSTRAINT "CampanhaMarketing_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampanhaMarketing" ADD CONSTRAINT "CampanhaMarketing_updatedByMemberId_fkey" FOREIGN KEY ("updatedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampanhaMarketing" ADD CONSTRAINT "CampanhaMarketing_archivedByMemberId_fkey" FOREIGN KEY ("archivedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampanhaMarketing" ADD CONSTRAINT "CampanhaMarketing_filialId_fkey" FOREIGN KEY ("filialId") REFERENCES "Filial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampanhaAnuncio" ADD CONSTRAINT "campanhaAnuncioOrganization" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampanhaAnuncio" ADD CONSTRAINT "CampanhaAnuncio_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampanhaAnuncio" ADD CONSTRAINT "CampanhaAnuncio_updatedByMemberId_fkey" FOREIGN KEY ("updatedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampanhaAnuncio" ADD CONSTRAINT "CampanhaAnuncio_archivedByMemberId_fkey" FOREIGN KEY ("archivedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampanhaAnuncio" ADD CONSTRAINT "CampanhaAnuncio_campanhaId_fkey" FOREIGN KEY ("campanhaId") REFERENCES "CampanhaMarketing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampanhaAnuncio" ADD CONSTRAINT "CampanhaAnuncio_anuncioId_fkey" FOREIGN KEY ("anuncioId") REFERENCES "Anuncio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "leadOrganization" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_updatedByMemberId_fkey" FOREIGN KEY ("updatedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_archivedByMemberId_fkey" FOREIGN KEY ("archivedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_filialId_fkey" FOREIGN KEY ("filialId") REFERENCES "Filial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_corretorResponsavelId_fkey" FOREIGN KEY ("corretorResponsavelId") REFERENCES "Corretor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_anuncioOrigemId_fkey" FOREIGN KEY ("anuncioOrigemId") REFERENCES "Anuncio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_campanhaOrigemId_fkey" FOREIGN KEY ("campanhaOrigemId") REFERENCES "CampanhaMarketing"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_portalOrigemId_fkey" FOREIGN KEY ("portalOrigemId") REFERENCES "PortalImobiliario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_clienteConvertidoId_fkey" FOREIGN KEY ("clienteConvertidoId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InteracaoLead" ADD CONSTRAINT "interacaoLeadOrganization" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InteracaoLead" ADD CONSTRAINT "InteracaoLead_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InteracaoLead" ADD CONSTRAINT "InteracaoLead_updatedByMemberId_fkey" FOREIGN KEY ("updatedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InteracaoLead" ADD CONSTRAINT "InteracaoLead_archivedByMemberId_fkey" FOREIGN KEY ("archivedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InteracaoLead" ADD CONSTRAINT "InteracaoLead_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InteracaoLead" ADD CONSTRAINT "InteracaoLead_corretorId_fkey" FOREIGN KEY ("corretorId") REFERENCES "Corretor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TarefaComercial" ADD CONSTRAINT "tarefaComercialOrganization" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TarefaComercial" ADD CONSTRAINT "TarefaComercial_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TarefaComercial" ADD CONSTRAINT "TarefaComercial_updatedByMemberId_fkey" FOREIGN KEY ("updatedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TarefaComercial" ADD CONSTRAINT "TarefaComercial_archivedByMemberId_fkey" FOREIGN KEY ("archivedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TarefaComercial" ADD CONSTRAINT "TarefaComercial_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TarefaComercial" ADD CONSTRAINT "TarefaComercial_corretorId_fkey" FOREIGN KEY ("corretorId") REFERENCES "Corretor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TarefaComercial" ADD CONSTRAINT "TarefaComercial_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visita" ADD CONSTRAINT "visitaOrganization" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visita" ADD CONSTRAINT "Visita_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visita" ADD CONSTRAINT "Visita_updatedByMemberId_fkey" FOREIGN KEY ("updatedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visita" ADD CONSTRAINT "Visita_archivedByMemberId_fkey" FOREIGN KEY ("archivedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visita" ADD CONSTRAINT "Visita_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visita" ADD CONSTRAINT "Visita_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visita" ADD CONSTRAINT "Visita_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "Imovel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visita" ADD CONSTRAINT "Visita_corretorId_fkey" FOREIGN KEY ("corretorId") REFERENCES "Corretor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposta" ADD CONSTRAINT "propostaOrganization" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposta" ADD CONSTRAINT "Proposta_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposta" ADD CONSTRAINT "Proposta_updatedByMemberId_fkey" FOREIGN KEY ("updatedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposta" ADD CONSTRAINT "Proposta_archivedByMemberId_fkey" FOREIGN KEY ("archivedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposta" ADD CONSTRAINT "Proposta_visitaOrigemId_fkey" FOREIGN KEY ("visitaOrigemId") REFERENCES "Visita"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposta" ADD CONSTRAINT "Proposta_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposta" ADD CONSTRAINT "Proposta_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposta" ADD CONSTRAINT "Proposta_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "Imovel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposta" ADD CONSTRAINT "Proposta_corretorId_fkey" FOREIGN KEY ("corretorId") REFERENCES "Corretor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CondicaoProposta" ADD CONSTRAINT "condicaoPropostaOrganization" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CondicaoProposta" ADD CONSTRAINT "CondicaoProposta_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CondicaoProposta" ADD CONSTRAINT "CondicaoProposta_updatedByMemberId_fkey" FOREIGN KEY ("updatedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CondicaoProposta" ADD CONSTRAINT "CondicaoProposta_archivedByMemberId_fkey" FOREIGN KEY ("archivedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CondicaoProposta" ADD CONSTRAINT "CondicaoProposta_propostaId_fkey" FOREIGN KEY ("propostaId") REFERENCES "Proposta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservaImovel" ADD CONSTRAINT "reservaImovelOrganization" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservaImovel" ADD CONSTRAINT "ReservaImovel_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservaImovel" ADD CONSTRAINT "ReservaImovel_updatedByMemberId_fkey" FOREIGN KEY ("updatedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservaImovel" ADD CONSTRAINT "ReservaImovel_archivedByMemberId_fkey" FOREIGN KEY ("archivedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservaImovel" ADD CONSTRAINT "ReservaImovel_propostaId_fkey" FOREIGN KEY ("propostaId") REFERENCES "Proposta"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservaImovel" ADD CONSTRAINT "ReservaImovel_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "Imovel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservaImovel" ADD CONSTRAINT "ReservaImovel_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservaImovel" ADD CONSTRAINT "ReservaImovel_corretorId_fkey" FOREIGN KEY ("corretorId") REFERENCES "Corretor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venda" ADD CONSTRAINT "vendaOrganization" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venda" ADD CONSTRAINT "Venda_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venda" ADD CONSTRAINT "Venda_updatedByMemberId_fkey" FOREIGN KEY ("updatedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venda" ADD CONSTRAINT "Venda_archivedByMemberId_fkey" FOREIGN KEY ("archivedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venda" ADD CONSTRAINT "Venda_filialId_fkey" FOREIGN KEY ("filialId") REFERENCES "Filial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venda" ADD CONSTRAINT "Venda_propostaId_fkey" FOREIGN KEY ("propostaId") REFERENCES "Proposta"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venda" ADD CONSTRAINT "Venda_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "Imovel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venda" ADD CONSTRAINT "Venda_proprietarioId_fkey" FOREIGN KEY ("proprietarioId") REFERENCES "Proprietario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venda" ADD CONSTRAINT "Venda_compradorId_fkey" FOREIGN KEY ("compradorId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venda" ADD CONSTRAINT "Venda_corretorId_fkey" FOREIGN KEY ("corretorId") REFERENCES "Corretor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContratoVenda" ADD CONSTRAINT "contratoVendaOrganization" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContratoVenda" ADD CONSTRAINT "ContratoVenda_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContratoVenda" ADD CONSTRAINT "ContratoVenda_updatedByMemberId_fkey" FOREIGN KEY ("updatedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContratoVenda" ADD CONSTRAINT "ContratoVenda_archivedByMemberId_fkey" FOREIGN KEY ("archivedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContratoVenda" ADD CONSTRAINT "ContratoVenda_vendaId_fkey" FOREIGN KEY ("vendaId") REFERENCES "Venda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParcelaVenda" ADD CONSTRAINT "parcelaVendaOrganization" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParcelaVenda" ADD CONSTRAINT "ParcelaVenda_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParcelaVenda" ADD CONSTRAINT "ParcelaVenda_updatedByMemberId_fkey" FOREIGN KEY ("updatedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParcelaVenda" ADD CONSTRAINT "ParcelaVenda_archivedByMemberId_fkey" FOREIGN KEY ("archivedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParcelaVenda" ADD CONSTRAINT "ParcelaVenda_vendaId_fkey" FOREIGN KEY ("vendaId") REFERENCES "Venda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Locacao" ADD CONSTRAINT "locacaoOrganization" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Locacao" ADD CONSTRAINT "Locacao_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Locacao" ADD CONSTRAINT "Locacao_updatedByMemberId_fkey" FOREIGN KEY ("updatedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Locacao" ADD CONSTRAINT "Locacao_archivedByMemberId_fkey" FOREIGN KEY ("archivedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Locacao" ADD CONSTRAINT "Locacao_filialId_fkey" FOREIGN KEY ("filialId") REFERENCES "Filial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Locacao" ADD CONSTRAINT "Locacao_propostaId_fkey" FOREIGN KEY ("propostaId") REFERENCES "Proposta"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Locacao" ADD CONSTRAINT "Locacao_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "Imovel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Locacao" ADD CONSTRAINT "Locacao_proprietarioId_fkey" FOREIGN KEY ("proprietarioId") REFERENCES "Proprietario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Locacao" ADD CONSTRAINT "Locacao_corretorId_fkey" FOREIGN KEY ("corretorId") REFERENCES "Corretor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParticipanteLocacao" ADD CONSTRAINT "participanteLocacaoOrganization" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParticipanteLocacao" ADD CONSTRAINT "ParticipanteLocacao_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParticipanteLocacao" ADD CONSTRAINT "ParticipanteLocacao_updatedByMemberId_fkey" FOREIGN KEY ("updatedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParticipanteLocacao" ADD CONSTRAINT "ParticipanteLocacao_archivedByMemberId_fkey" FOREIGN KEY ("archivedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParticipanteLocacao" ADD CONSTRAINT "ParticipanteLocacao_locacaoId_fkey" FOREIGN KEY ("locacaoId") REFERENCES "Locacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParticipanteLocacao" ADD CONSTRAINT "ParticipanteLocacao_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GarantiaLocacao" ADD CONSTRAINT "garantiaLocacaoOrganization" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GarantiaLocacao" ADD CONSTRAINT "GarantiaLocacao_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GarantiaLocacao" ADD CONSTRAINT "GarantiaLocacao_updatedByMemberId_fkey" FOREIGN KEY ("updatedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GarantiaLocacao" ADD CONSTRAINT "GarantiaLocacao_archivedByMemberId_fkey" FOREIGN KEY ("archivedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GarantiaLocacao" ADD CONSTRAINT "GarantiaLocacao_locacaoId_fkey" FOREIGN KEY ("locacaoId") REFERENCES "Locacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContratoLocacao" ADD CONSTRAINT "contratoLocacaoOrganization" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContratoLocacao" ADD CONSTRAINT "ContratoLocacao_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContratoLocacao" ADD CONSTRAINT "ContratoLocacao_updatedByMemberId_fkey" FOREIGN KEY ("updatedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContratoLocacao" ADD CONSTRAINT "ContratoLocacao_archivedByMemberId_fkey" FOREIGN KEY ("archivedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContratoLocacao" ADD CONSTRAINT "ContratoLocacao_locacaoId_fkey" FOREIGN KEY ("locacaoId") REFERENCES "Locacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CobrancaLocacao" ADD CONSTRAINT "cobrancaLocacaoOrganization" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CobrancaLocacao" ADD CONSTRAINT "CobrancaLocacao_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CobrancaLocacao" ADD CONSTRAINT "CobrancaLocacao_updatedByMemberId_fkey" FOREIGN KEY ("updatedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CobrancaLocacao" ADD CONSTRAINT "CobrancaLocacao_archivedByMemberId_fkey" FOREIGN KEY ("archivedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CobrancaLocacao" ADD CONSTRAINT "CobrancaLocacao_locacaoId_fkey" FOREIGN KEY ("locacaoId") REFERENCES "Locacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagamentoLocacao" ADD CONSTRAINT "pagamentoLocacaoOrganization" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagamentoLocacao" ADD CONSTRAINT "PagamentoLocacao_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagamentoLocacao" ADD CONSTRAINT "PagamentoLocacao_updatedByMemberId_fkey" FOREIGN KEY ("updatedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagamentoLocacao" ADD CONSTRAINT "PagamentoLocacao_archivedByMemberId_fkey" FOREIGN KEY ("archivedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagamentoLocacao" ADD CONSTRAINT "PagamentoLocacao_cobrancaId_fkey" FOREIGN KEY ("cobrancaId") REFERENCES "CobrancaLocacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReajusteLocacao" ADD CONSTRAINT "reajusteLocacaoOrganization" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReajusteLocacao" ADD CONSTRAINT "ReajusteLocacao_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReajusteLocacao" ADD CONSTRAINT "ReajusteLocacao_updatedByMemberId_fkey" FOREIGN KEY ("updatedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReajusteLocacao" ADD CONSTRAINT "ReajusteLocacao_archivedByMemberId_fkey" FOREIGN KEY ("archivedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReajusteLocacao" ADD CONSTRAINT "ReajusteLocacao_locacaoId_fkey" FOREIGN KEY ("locacaoId") REFERENCES "Locacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepasseProprietario" ADD CONSTRAINT "repasseProprietarioOrganization" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepasseProprietario" ADD CONSTRAINT "RepasseProprietario_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepasseProprietario" ADD CONSTRAINT "RepasseProprietario_updatedByMemberId_fkey" FOREIGN KEY ("updatedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepasseProprietario" ADD CONSTRAINT "RepasseProprietario_archivedByMemberId_fkey" FOREIGN KEY ("archivedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepasseProprietario" ADD CONSTRAINT "RepasseProprietario_locacaoId_fkey" FOREIGN KEY ("locacaoId") REFERENCES "Locacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepasseProprietario" ADD CONSTRAINT "RepasseProprietario_proprietarioId_fkey" FOREIGN KEY ("proprietarioId") REFERENCES "Proprietario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comissao" ADD CONSTRAINT "comissaoOrganization" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comissao" ADD CONSTRAINT "Comissao_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comissao" ADD CONSTRAINT "Comissao_updatedByMemberId_fkey" FOREIGN KEY ("updatedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comissao" ADD CONSTRAINT "Comissao_archivedByMemberId_fkey" FOREIGN KEY ("archivedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comissao" ADD CONSTRAINT "Comissao_vendaId_fkey" FOREIGN KEY ("vendaId") REFERENCES "Venda"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comissao" ADD CONSTRAINT "Comissao_locacaoId_fkey" FOREIGN KEY ("locacaoId") REFERENCES "Locacao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comissao" ADD CONSTRAINT "Comissao_corretorId_fkey" FOREIGN KEY ("corretorId") REFERENCES "Corretor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagamentoComissao" ADD CONSTRAINT "pagamentoComissaoOrganization" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagamentoComissao" ADD CONSTRAINT "PagamentoComissao_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagamentoComissao" ADD CONSTRAINT "PagamentoComissao_updatedByMemberId_fkey" FOREIGN KEY ("updatedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagamentoComissao" ADD CONSTRAINT "PagamentoComissao_archivedByMemberId_fkey" FOREIGN KEY ("archivedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagamentoComissao" ADD CONSTRAINT "PagamentoComissao_comissaoId_fkey" FOREIGN KEY ("comissaoId") REFERENCES "Comissao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fornecedor" ADD CONSTRAINT "fornecedorOrganization" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fornecedor" ADD CONSTRAINT "Fornecedor_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fornecedor" ADD CONSTRAINT "Fornecedor_updatedByMemberId_fkey" FOREIGN KEY ("updatedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fornecedor" ADD CONSTRAINT "Fornecedor_archivedByMemberId_fkey" FOREIGN KEY ("archivedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fornecedor" ADD CONSTRAINT "Fornecedor_filialId_fkey" FOREIGN KEY ("filialId") REFERENCES "Filial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitacaoManutencao" ADD CONSTRAINT "solicitacaoManutencaoOrganization" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitacaoManutencao" ADD CONSTRAINT "SolicitacaoManutencao_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitacaoManutencao" ADD CONSTRAINT "SolicitacaoManutencao_updatedByMemberId_fkey" FOREIGN KEY ("updatedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitacaoManutencao" ADD CONSTRAINT "SolicitacaoManutencao_archivedByMemberId_fkey" FOREIGN KEY ("archivedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitacaoManutencao" ADD CONSTRAINT "SolicitacaoManutencao_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "Imovel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitacaoManutencao" ADD CONSTRAINT "SolicitacaoManutencao_locacaoId_fkey" FOREIGN KEY ("locacaoId") REFERENCES "Locacao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitacaoManutencao" ADD CONSTRAINT "SolicitacaoManutencao_clienteSolicitanteId_fkey" FOREIGN KEY ("clienteSolicitanteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitacaoManutencao" ADD CONSTRAINT "SolicitacaoManutencao_corretorResponsavelId_fkey" FOREIGN KEY ("corretorResponsavelId") REFERENCES "Corretor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdemServico" ADD CONSTRAINT "ordemServicoOrganization" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdemServico" ADD CONSTRAINT "OrdemServico_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdemServico" ADD CONSTRAINT "OrdemServico_updatedByMemberId_fkey" FOREIGN KEY ("updatedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdemServico" ADD CONSTRAINT "OrdemServico_archivedByMemberId_fkey" FOREIGN KEY ("archivedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdemServico" ADD CONSTRAINT "OrdemServico_solicitacaoId_fkey" FOREIGN KEY ("solicitacaoId") REFERENCES "SolicitacaoManutencao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdemServico" ADD CONSTRAINT "OrdemServico_fornecedorId_fkey" FOREIGN KEY ("fornecedorId") REFERENCES "Fornecedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DespesaImovel" ADD CONSTRAINT "despesaImovelOrganization" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DespesaImovel" ADD CONSTRAINT "DespesaImovel_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DespesaImovel" ADD CONSTRAINT "DespesaImovel_updatedByMemberId_fkey" FOREIGN KEY ("updatedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DespesaImovel" ADD CONSTRAINT "DespesaImovel_archivedByMemberId_fkey" FOREIGN KEY ("archivedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DespesaImovel" ADD CONSTRAINT "DespesaImovel_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "Imovel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DespesaImovel" ADD CONSTRAINT "DespesaImovel_fornecedorId_fkey" FOREIGN KEY ("fornecedorId") REFERENCES "Fornecedor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DespesaImovel" ADD CONSTRAINT "DespesaImovel_locacaoId_fkey" FOREIGN KEY ("locacaoId") REFERENCES "Locacao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DespesaImovel" ADD CONSTRAINT "DespesaImovel_ordemServicoId_fkey" FOREIGN KEY ("ordemServicoId") REFERENCES "OrdemServico"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContaFinanceira" ADD CONSTRAINT "contaFinanceiraOrganization" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContaFinanceira" ADD CONSTRAINT "ContaFinanceira_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContaFinanceira" ADD CONSTRAINT "ContaFinanceira_updatedByMemberId_fkey" FOREIGN KEY ("updatedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContaFinanceira" ADD CONSTRAINT "ContaFinanceira_archivedByMemberId_fkey" FOREIGN KEY ("archivedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContaFinanceira" ADD CONSTRAINT "ContaFinanceira_filialId_fkey" FOREIGN KEY ("filialId") REFERENCES "Filial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoriaFinanceira" ADD CONSTRAINT "categoriaFinanceiraOrganization" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoriaFinanceira" ADD CONSTRAINT "CategoriaFinanceira_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoriaFinanceira" ADD CONSTRAINT "CategoriaFinanceira_updatedByMemberId_fkey" FOREIGN KEY ("updatedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoriaFinanceira" ADD CONSTRAINT "CategoriaFinanceira_archivedByMemberId_fkey" FOREIGN KEY ("archivedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LancamentoFinanceiro" ADD CONSTRAINT "lancamentoFinanceiroOrganization" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LancamentoFinanceiro" ADD CONSTRAINT "LancamentoFinanceiro_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LancamentoFinanceiro" ADD CONSTRAINT "LancamentoFinanceiro_updatedByMemberId_fkey" FOREIGN KEY ("updatedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LancamentoFinanceiro" ADD CONSTRAINT "LancamentoFinanceiro_archivedByMemberId_fkey" FOREIGN KEY ("archivedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LancamentoFinanceiro" ADD CONSTRAINT "LancamentoFinanceiro_filialId_fkey" FOREIGN KEY ("filialId") REFERENCES "Filial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LancamentoFinanceiro" ADD CONSTRAINT "LancamentoFinanceiro_contaFinanceiraId_fkey" FOREIGN KEY ("contaFinanceiraId") REFERENCES "ContaFinanceira"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LancamentoFinanceiro" ADD CONSTRAINT "LancamentoFinanceiro_categoriaFinanceiraId_fkey" FOREIGN KEY ("categoriaFinanceiraId") REFERENCES "CategoriaFinanceira"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LancamentoFinanceiro" ADD CONSTRAINT "LancamentoFinanceiro_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "Imovel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LancamentoFinanceiro" ADD CONSTRAINT "LancamentoFinanceiro_vendaId_fkey" FOREIGN KEY ("vendaId") REFERENCES "Venda"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LancamentoFinanceiro" ADD CONSTRAINT "LancamentoFinanceiro_locacaoId_fkey" FOREIGN KEY ("locacaoId") REFERENCES "Locacao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LancamentoFinanceiro" ADD CONSTRAINT "LancamentoFinanceiro_cobrancaLocacaoId_fkey" FOREIGN KEY ("cobrancaLocacaoId") REFERENCES "CobrancaLocacao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LancamentoFinanceiro" ADD CONSTRAINT "LancamentoFinanceiro_repasseProprietarioId_fkey" FOREIGN KEY ("repasseProprietarioId") REFERENCES "RepasseProprietario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LancamentoFinanceiro" ADD CONSTRAINT "LancamentoFinanceiro_comissaoId_fkey" FOREIGN KEY ("comissaoId") REFERENCES "Comissao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LancamentoFinanceiro" ADD CONSTRAINT "LancamentoFinanceiro_despesaImovelId_fkey" FOREIGN KEY ("despesaImovelId") REFERENCES "DespesaImovel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoPessoa" ADD CONSTRAINT "documentoPessoaOrganization" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoPessoa" ADD CONSTRAINT "DocumentoPessoa_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoPessoa" ADD CONSTRAINT "DocumentoPessoa_updatedByMemberId_fkey" FOREIGN KEY ("updatedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoPessoa" ADD CONSTRAINT "DocumentoPessoa_archivedByMemberId_fkey" FOREIGN KEY ("archivedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoPessoa" ADD CONSTRAINT "DocumentoPessoa_proprietarioId_fkey" FOREIGN KEY ("proprietarioId") REFERENCES "Proprietario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoPessoa" ADD CONSTRAINT "DocumentoPessoa_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoPessoa" ADD CONSTRAINT "DocumentoPessoa_corretorId_fkey" FOREIGN KEY ("corretorId") REFERENCES "Corretor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsentimentoLGPD" ADD CONSTRAINT "consentimentoLGPDOrganization" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsentimentoLGPD" ADD CONSTRAINT "ConsentimentoLGPD_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsentimentoLGPD" ADD CONSTRAINT "ConsentimentoLGPD_updatedByMemberId_fkey" FOREIGN KEY ("updatedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsentimentoLGPD" ADD CONSTRAINT "ConsentimentoLGPD_archivedByMemberId_fkey" FOREIGN KEY ("archivedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsentimentoLGPD" ADD CONSTRAINT "ConsentimentoLGPD_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsentimentoLGPD" ADD CONSTRAINT "ConsentimentoLGPD_proprietarioId_fkey" FOREIGN KEY ("proprietarioId") REFERENCES "Proprietario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsentimentoLGPD" ADD CONSTRAINT "ConsentimentoLGPD_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoritoCliente" ADD CONSTRAINT "favoritoClienteOrganization" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoritoCliente" ADD CONSTRAINT "FavoritoCliente_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoritoCliente" ADD CONSTRAINT "FavoritoCliente_updatedByMemberId_fkey" FOREIGN KEY ("updatedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoritoCliente" ADD CONSTRAINT "FavoritoCliente_archivedByMemberId_fkey" FOREIGN KEY ("archivedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoritoCliente" ADD CONSTRAINT "FavoritoCliente_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoritoCliente" ADD CONSTRAINT "FavoritoCliente_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "Imovel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitacaoContato" ADD CONSTRAINT "solicitacaoContatoOrganization" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitacaoContato" ADD CONSTRAINT "SolicitacaoContato_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitacaoContato" ADD CONSTRAINT "SolicitacaoContato_updatedByMemberId_fkey" FOREIGN KEY ("updatedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitacaoContato" ADD CONSTRAINT "SolicitacaoContato_archivedByMemberId_fkey" FOREIGN KEY ("archivedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitacaoContato" ADD CONSTRAINT "SolicitacaoContato_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "Imovel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitacaoContato" ADD CONSTRAINT "SolicitacaoContato_anuncioId_fkey" FOREIGN KEY ("anuncioId") REFERENCES "Anuncio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitacaoContato" ADD CONSTRAINT "SolicitacaoContato_corretorResponsavelId_fkey" FOREIGN KEY ("corretorResponsavelId") REFERENCES "Corretor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimulacaoFinanciamento" ADD CONSTRAINT "simulacaoFinanciamentoOrganization" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimulacaoFinanciamento" ADD CONSTRAINT "SimulacaoFinanciamento_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimulacaoFinanciamento" ADD CONSTRAINT "SimulacaoFinanciamento_updatedByMemberId_fkey" FOREIGN KEY ("updatedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimulacaoFinanciamento" ADD CONSTRAINT "SimulacaoFinanciamento_archivedByMemberId_fkey" FOREIGN KEY ("archivedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimulacaoFinanciamento" ADD CONSTRAINT "SimulacaoFinanciamento_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimulacaoFinanciamento" ADD CONSTRAINT "SimulacaoFinanciamento_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "Imovel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimulacaoFinanciamento" ADD CONSTRAINT "SimulacaoFinanciamento_propostaId_fkey" FOREIGN KEY ("propostaId") REFERENCES "Proposta"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContratoAdministracao" ADD CONSTRAINT "contratoAdministracaoOrganization" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContratoAdministracao" ADD CONSTRAINT "ContratoAdministracao_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContratoAdministracao" ADD CONSTRAINT "ContratoAdministracao_updatedByMemberId_fkey" FOREIGN KEY ("updatedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContratoAdministracao" ADD CONSTRAINT "ContratoAdministracao_archivedByMemberId_fkey" FOREIGN KEY ("archivedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContratoAdministracao" ADD CONSTRAINT "ContratoAdministracao_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "Imovel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContratoAdministracao" ADD CONSTRAINT "ContratoAdministracao_proprietarioId_fkey" FOREIGN KEY ("proprietarioId") REFERENCES "Proprietario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContratoAdministracao" ADD CONSTRAINT "ContratoAdministracao_filialId_fkey" FOREIGN KEY ("filialId") REFERENCES "Filial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeguroImovel" ADD CONSTRAINT "seguroImovelOrganization" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeguroImovel" ADD CONSTRAINT "SeguroImovel_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeguroImovel" ADD CONSTRAINT "SeguroImovel_updatedByMemberId_fkey" FOREIGN KEY ("updatedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeguroImovel" ADD CONSTRAINT "SeguroImovel_archivedByMemberId_fkey" FOREIGN KEY ("archivedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeguroImovel" ADD CONSTRAINT "SeguroImovel_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "Imovel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeguroImovel" ADD CONSTRAINT "SeguroImovel_locacaoId_fkey" FOREIGN KEY ("locacaoId") REFERENCES "Locacao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OcorrenciaImovel" ADD CONSTRAINT "ocorrenciaImovelOrganization" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OcorrenciaImovel" ADD CONSTRAINT "OcorrenciaImovel_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OcorrenciaImovel" ADD CONSTRAINT "OcorrenciaImovel_updatedByMemberId_fkey" FOREIGN KEY ("updatedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OcorrenciaImovel" ADD CONSTRAINT "OcorrenciaImovel_archivedByMemberId_fkey" FOREIGN KEY ("archivedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OcorrenciaImovel" ADD CONSTRAINT "OcorrenciaImovel_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "Imovel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OcorrenciaImovel" ADD CONSTRAINT "OcorrenciaImovel_locacaoId_fkey" FOREIGN KEY ("locacaoId") REFERENCES "Locacao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OcorrenciaImovel" ADD CONSTRAINT "OcorrenciaImovel_clienteRelatorId_fkey" FOREIGN KEY ("clienteRelatorId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OcorrenciaImovel" ADD CONSTRAINT "OcorrenciaImovel_corretorResponsavelId_fkey" FOREIGN KEY ("corretorResponsavelId") REFERENCES "Corretor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArquivoKml" ADD CONSTRAINT "arquivoKmlOrganization" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArquivoKml" ADD CONSTRAINT "ArquivoKml_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArquivoKml" ADD CONSTRAINT "ArquivoKml_updatedByMemberId_fkey" FOREIGN KEY ("updatedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArquivoKml" ADD CONSTRAINT "ArquivoKml_archivedByMemberId_fkey" FOREIGN KEY ("archivedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArquivoKml" ADD CONSTRAINT "ArquivoKml_documentacaoRuralBrasilId_fkey" FOREIGN KEY ("documentacaoRuralBrasilId") REFERENCES "DocumentacaoRuralBrasil"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArquivoKml" ADD CONSTRAINT "ArquivoKml_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "Imovel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArquivoKml" ADD CONSTRAINT "ArquivoKml_empreendimentoId_fkey" FOREIGN KEY ("empreendimentoId") REFERENCES "Empreendimento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArquivoKml" ADD CONSTRAINT "ArquivoKml_condominioId_fkey" FOREIGN KEY ("condominioId") REFERENCES "Condominio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArquivoKml" ADD CONSTRAINT "ArquivoKml_cadastradoPorId_fkey" FOREIGN KEY ("cadastradoPorId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArquivoKml" ADD CONSTRAINT "ArquivoKml_versaoAnteriorId_fkey" FOREIGN KEY ("versaoAnteriorId") REFERENCES "ArquivoKml"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentacaoRuralBrasil" ADD CONSTRAINT "documentacaoRuralBrasilOrganization" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentacaoRuralBrasil" ADD CONSTRAINT "DocumentacaoRuralBrasil_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentacaoRuralBrasil" ADD CONSTRAINT "DocumentacaoRuralBrasil_updatedByMemberId_fkey" FOREIGN KEY ("updatedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentacaoRuralBrasil" ADD CONSTRAINT "DocumentacaoRuralBrasil_archivedByMemberId_fkey" FOREIGN KEY ("archivedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentacaoRuralBrasil" ADD CONSTRAINT "DocumentacaoRuralBrasil_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "Imovel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferenciaClimaticaRural" ADD CONSTRAINT "referenciaClimaticaRuralOrganization" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferenciaClimaticaRural" ADD CONSTRAINT "ReferenciaClimaticaRural_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferenciaClimaticaRural" ADD CONSTRAINT "ReferenciaClimaticaRural_updatedByMemberId_fkey" FOREIGN KEY ("updatedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferenciaClimaticaRural" ADD CONSTRAINT "ReferenciaClimaticaRural_archivedByMemberId_fkey" FOREIGN KEY ("archivedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferenciaClimaticaRural" ADD CONSTRAINT "ReferenciaClimaticaRural_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "Imovel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TipoSolo" ADD CONSTRAINT "tipoSoloOrganization" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TipoSolo" ADD CONSTRAINT "TipoSolo_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TipoSolo" ADD CONSTRAINT "TipoSolo_updatedByMemberId_fkey" FOREIGN KEY ("updatedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TipoSolo" ADD CONSTRAINT "TipoSolo_archivedByMemberId_fkey" FOREIGN KEY ("archivedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoloImovelRural" ADD CONSTRAINT "soloImovelRuralOrganization" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoloImovelRural" ADD CONSTRAINT "SoloImovelRural_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoloImovelRural" ADD CONSTRAINT "SoloImovelRural_updatedByMemberId_fkey" FOREIGN KEY ("updatedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoloImovelRural" ADD CONSTRAINT "SoloImovelRural_archivedByMemberId_fkey" FOREIGN KEY ("archivedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoloImovelRural" ADD CONSTRAINT "SoloImovelRural_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "Imovel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoloImovelRural" ADD CONSTRAINT "SoloImovelRural_tipoSoloId_fkey" FOREIGN KEY ("tipoSoloId") REFERENCES "TipoSolo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopografiaRural" ADD CONSTRAINT "topografiaRuralOrganization" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopografiaRural" ADD CONSTRAINT "TopografiaRural_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopografiaRural" ADD CONSTRAINT "TopografiaRural_updatedByMemberId_fkey" FOREIGN KEY ("updatedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopografiaRural" ADD CONSTRAINT "TopografiaRural_archivedByMemberId_fkey" FOREIGN KEY ("archivedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopografiaRural" ADD CONSTRAINT "TopografiaRural_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "Imovel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecursoHidricoRural" ADD CONSTRAINT "recursoHidricoRuralOrganization" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecursoHidricoRural" ADD CONSTRAINT "RecursoHidricoRural_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecursoHidricoRural" ADD CONSTRAINT "RecursoHidricoRural_updatedByMemberId_fkey" FOREIGN KEY ("updatedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecursoHidricoRural" ADD CONSTRAINT "RecursoHidricoRural_archivedByMemberId_fkey" FOREIGN KEY ("archivedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecursoHidricoRural" ADD CONSTRAINT "RecursoHidricoRural_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "Imovel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InfraestruturaEnergiaConectividade" ADD CONSTRAINT "infraestruturaEnergiaConectividadeOrganization" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InfraestruturaEnergiaConectividade" ADD CONSTRAINT "InfraestruturaEnergiaConectividade_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InfraestruturaEnergiaConectividade" ADD CONSTRAINT "InfraestruturaEnergiaConectividade_updatedByMemberId_fkey" FOREIGN KEY ("updatedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InfraestruturaEnergiaConectividade" ADD CONSTRAINT "InfraestruturaEnergiaConectividade_archivedByMemberId_fkey" FOREIGN KEY ("archivedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InfraestruturaEnergiaConectividade" ADD CONSTRAINT "InfraestruturaEnergiaConectividade_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "Imovel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogisticaRural" ADD CONSTRAINT "logisticaRuralOrganization" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogisticaRural" ADD CONSTRAINT "LogisticaRural_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogisticaRural" ADD CONSTRAINT "LogisticaRural_updatedByMemberId_fkey" FOREIGN KEY ("updatedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogisticaRural" ADD CONSTRAINT "LogisticaRural_archivedByMemberId_fkey" FOREIGN KEY ("archivedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogisticaRural" ADD CONSTRAINT "LogisticaRural_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "Imovel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PistaAviacaoRural" ADD CONSTRAINT "pistaAviacaoRuralOrganization" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PistaAviacaoRural" ADD CONSTRAINT "PistaAviacaoRural_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PistaAviacaoRural" ADD CONSTRAINT "PistaAviacaoRural_updatedByMemberId_fkey" FOREIGN KEY ("updatedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PistaAviacaoRural" ADD CONSTRAINT "PistaAviacaoRural_archivedByMemberId_fkey" FOREIGN KEY ("archivedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PistaAviacaoRural" ADD CONSTRAINT "PistaAviacaoRural_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "Imovel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BenfeitoriaRural" ADD CONSTRAINT "benfeitoriaRuralOrganization" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BenfeitoriaRural" ADD CONSTRAINT "BenfeitoriaRural_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BenfeitoriaRural" ADD CONSTRAINT "BenfeitoriaRural_updatedByMemberId_fkey" FOREIGN KEY ("updatedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BenfeitoriaRural" ADD CONSTRAINT "BenfeitoriaRural_archivedByMemberId_fkey" FOREIGN KEY ("archivedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BenfeitoriaRural" ADD CONSTRAINT "BenfeitoriaRural_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "Imovel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DivisaoOperacionalRural" ADD CONSTRAINT "divisaoOperacionalRuralOrganization" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DivisaoOperacionalRural" ADD CONSTRAINT "DivisaoOperacionalRural_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DivisaoOperacionalRural" ADD CONSTRAINT "DivisaoOperacionalRural_updatedByMemberId_fkey" FOREIGN KEY ("updatedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DivisaoOperacionalRural" ADD CONSTRAINT "DivisaoOperacionalRural_archivedByMemberId_fkey" FOREIGN KEY ("archivedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DivisaoOperacionalRural" ADD CONSTRAINT "DivisaoOperacionalRural_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "Imovel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProducaoHistoricaRural" ADD CONSTRAINT "producaoHistoricaRuralOrganization" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProducaoHistoricaRural" ADD CONSTRAINT "ProducaoHistoricaRural_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProducaoHistoricaRural" ADD CONSTRAINT "ProducaoHistoricaRural_updatedByMemberId_fkey" FOREIGN KEY ("updatedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProducaoHistoricaRural" ADD CONSTRAINT "ProducaoHistoricaRural_archivedByMemberId_fkey" FOREIGN KEY ("archivedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProducaoHistoricaRural" ADD CONSTRAINT "ProducaoHistoricaRural_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "Imovel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SistemaProdutivoRural" ADD CONSTRAINT "sistemaProdutivoRuralOrganization" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SistemaProdutivoRural" ADD CONSTRAINT "SistemaProdutivoRural_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SistemaProdutivoRural" ADD CONSTRAINT "SistemaProdutivoRural_updatedByMemberId_fkey" FOREIGN KEY ("updatedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SistemaProdutivoRural" ADD CONSTRAINT "SistemaProdutivoRural_archivedByMemberId_fkey" FOREIGN KEY ("archivedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SistemaProdutivoRural" ADD CONSTRAINT "SistemaProdutivoRural_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "Imovel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AtivoIncluidoVendaRural" ADD CONSTRAINT "ativoIncluidoVendaRuralOrganization" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AtivoIncluidoVendaRural" ADD CONSTRAINT "AtivoIncluidoVendaRural_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AtivoIncluidoVendaRural" ADD CONSTRAINT "AtivoIncluidoVendaRural_updatedByMemberId_fkey" FOREIGN KEY ("updatedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AtivoIncluidoVendaRural" ADD CONSTRAINT "AtivoIncluidoVendaRural_archivedByMemberId_fkey" FOREIGN KEY ("archivedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AtivoIncluidoVendaRural" ADD CONSTRAINT "AtivoIncluidoVendaRural_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "Imovel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestricaoTerritorialRural" ADD CONSTRAINT "restricaoTerritorialRuralOrganization" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestricaoTerritorialRural" ADD CONSTRAINT "RestricaoTerritorialRural_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestricaoTerritorialRural" ADD CONSTRAINT "RestricaoTerritorialRural_updatedByMemberId_fkey" FOREIGN KEY ("updatedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestricaoTerritorialRural" ADD CONSTRAINT "RestricaoTerritorialRural_archivedByMemberId_fkey" FOREIGN KEY ("archivedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestricaoTerritorialRural" ADD CONSTRAINT "RestricaoTerritorialRural_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "Imovel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiscoRural" ADD CONSTRAINT "riscoRuralOrganization" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiscoRural" ADD CONSTRAINT "RiscoRural_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiscoRural" ADD CONSTRAINT "RiscoRural_updatedByMemberId_fkey" FOREIGN KEY ("updatedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiscoRural" ADD CONSTRAINT "RiscoRural_archivedByMemberId_fkey" FOREIGN KEY ("archivedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiscoRural" ADD CONSTRAINT "RiscoRural_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "Imovel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificacaoSustentabilidadeRural" ADD CONSTRAINT "certificacaoSustentabilidadeRuralOrganization" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificacaoSustentabilidadeRural" ADD CONSTRAINT "CertificacaoSustentabilidadeRural_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificacaoSustentabilidadeRural" ADD CONSTRAINT "CertificacaoSustentabilidadeRural_updatedByMemberId_fkey" FOREIGN KEY ("updatedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificacaoSustentabilidadeRural" ADD CONSTRAINT "CertificacaoSustentabilidadeRural_archivedByMemberId_fkey" FOREIGN KEY ("archivedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificacaoSustentabilidadeRural" ADD CONSTRAINT "CertificacaoSustentabilidadeRural_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "Imovel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CondicaoComercialRural" ADD CONSTRAINT "condicaoComercialRuralOrganization" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CondicaoComercialRural" ADD CONSTRAINT "CondicaoComercialRural_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CondicaoComercialRural" ADD CONSTRAINT "CondicaoComercialRural_updatedByMemberId_fkey" FOREIGN KEY ("updatedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CondicaoComercialRural" ADD CONSTRAINT "CondicaoComercialRural_archivedByMemberId_fkey" FOREIGN KEY ("archivedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CondicaoComercialRural" ADD CONSTRAINT "CondicaoComercialRural_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "Imovel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DueDiligenceRural" ADD CONSTRAINT "dueDiligenceRuralOrganization" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DueDiligenceRural" ADD CONSTRAINT "DueDiligenceRural_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DueDiligenceRural" ADD CONSTRAINT "DueDiligenceRural_updatedByMemberId_fkey" FOREIGN KEY ("updatedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DueDiligenceRural" ADD CONSTRAINT "DueDiligenceRural_archivedByMemberId_fkey" FOREIGN KEY ("archivedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DueDiligenceRural" ADD CONSTRAINT "DueDiligenceRural_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "Imovel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TwoFactor" ADD CONSTRAINT "TwoFactor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OauthApplication" ADD CONSTRAINT "OauthApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OauthAccessToken" ADD CONSTRAINT "OauthAccessToken_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "OauthApplication"("clientId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OauthAccessToken" ADD CONSTRAINT "OauthAccessToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OauthConsent" ADD CONSTRAINT "OauthConsent_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "OauthApplication"("clientId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OauthConsent" ADD CONSTRAINT "OauthConsent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
