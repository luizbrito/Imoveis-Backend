CREATE TABLE "FavoritoPublico" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "imovelId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FavoritoPublico_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "FavoritoPublico_organizationId_userId_imovelId_key"
ON "FavoritoPublico"("organizationId", "userId", "imovelId");

CREATE INDEX "FavoritoPublico_organizationId_userId_idx"
ON "FavoritoPublico"("organizationId", "userId");

CREATE INDEX "FavoritoPublico_imovelId_idx"
ON "FavoritoPublico"("imovelId");

ALTER TABLE "FavoritoPublico"
ADD CONSTRAINT "favoritoPublicoOrganization"
FOREIGN KEY ("organizationId") REFERENCES "Organization"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "FavoritoPublico"
ADD CONSTRAINT "favoritoPublicoUser"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "FavoritoPublico"
ADD CONSTRAINT "FavoritoPublico_imovelId_fkey"
FOREIGN KEY ("imovelId") REFERENCES "Imovel"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
