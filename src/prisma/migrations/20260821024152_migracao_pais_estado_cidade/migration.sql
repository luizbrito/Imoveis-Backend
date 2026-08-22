-- AlterTable
ALTER TABLE "Imovel" ADD COLUMN     "cidadeCadastroId" UUID,
ADD COLUMN     "estadoId" UUID,
ADD COLUMN     "paisId" UUID;

-- CreateTable
CREATE TABLE "Pais" (
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
    "sigla" TEXT NOT NULL,
    "codigoTelefone" TEXT NOT NULL,
    "nacionalidade" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT false,
    "observacoes" TEXT,

    CONSTRAINT "Pais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Estado" (
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
    "sigla" TEXT,
    "codigoOficial" TEXT,
    "tipoDivisao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT false,
    "observacoes" TEXT,
    "paisId" UUID NOT NULL,

    CONSTRAINT "Estado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cidade" (
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
    "codigoOficial" TEXT,
    "codigoPostal" TEXT,
    "latitude" DECIMAL(65,30),
    "longitude" DECIMAL(65,30),
    "ativo" BOOLEAN NOT NULL DEFAULT false,
    "observacoes" TEXT,
    "estadoId" UUID NOT NULL,

    CONSTRAINT "Cidade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Pais_importHash_key" ON "Pais"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "Pais_nome_organizationId_key" ON "Pais"("nome", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Pais_sigla_organizationId_key" ON "Pais"("sigla", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Pais_id_organizationId_key" ON "Pais"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Estado_importHash_key" ON "Estado"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "Estado_id_organizationId_key" ON "Estado"("id", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Cidade_importHash_key" ON "Cidade"("importHash");

-- CreateIndex
CREATE UNIQUE INDEX "Cidade_id_organizationId_key" ON "Cidade"("id", "organizationId");

-- AddForeignKey
ALTER TABLE "Imovel" ADD CONSTRAINT "Imovel_paisId_fkey" FOREIGN KEY ("paisId") REFERENCES "Pais"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Imovel" ADD CONSTRAINT "Imovel_estadoId_fkey" FOREIGN KEY ("estadoId") REFERENCES "Estado"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Imovel" ADD CONSTRAINT "Imovel_cidadeCadastroId_fkey" FOREIGN KEY ("cidadeCadastroId") REFERENCES "Cidade"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pais" ADD CONSTRAINT "paisOrganization" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pais" ADD CONSTRAINT "Pais_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pais" ADD CONSTRAINT "Pais_updatedByMemberId_fkey" FOREIGN KEY ("updatedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pais" ADD CONSTRAINT "Pais_archivedByMemberId_fkey" FOREIGN KEY ("archivedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Estado" ADD CONSTRAINT "estadoOrganization" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Estado" ADD CONSTRAINT "Estado_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Estado" ADD CONSTRAINT "Estado_updatedByMemberId_fkey" FOREIGN KEY ("updatedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Estado" ADD CONSTRAINT "Estado_archivedByMemberId_fkey" FOREIGN KEY ("archivedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Estado" ADD CONSTRAINT "Estado_paisId_fkey" FOREIGN KEY ("paisId") REFERENCES "Pais"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cidade" ADD CONSTRAINT "cidadeOrganization" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cidade" ADD CONSTRAINT "Cidade_createdByMemberId_fkey" FOREIGN KEY ("createdByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cidade" ADD CONSTRAINT "Cidade_updatedByMemberId_fkey" FOREIGN KEY ("updatedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cidade" ADD CONSTRAINT "Cidade_archivedByMemberId_fkey" FOREIGN KEY ("archivedByMemberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cidade" ADD CONSTRAINT "Cidade_estadoId_fkey" FOREIGN KEY ("estadoId") REFERENCES "Estado"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
