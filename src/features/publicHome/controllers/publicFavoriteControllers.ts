import { AppContext } from '../../../shared/controller/appContext';
import { Error403 } from '../../../shared/errors/Error403';
import { Error404 } from '../../../shared/errors/Error404';
import { prisma } from '../../../prisma';
import { auditLogCreate } from '../../auditLog/auditLogCreate';
import { auditLogOperations } from '../../auditLog/auditLogOperations';
import { PublicFavoriteList, PublicFavoriteToggle } from '../publicHomeSchemas';

function publicFavoriteAuth(context: AppContext) {
  const { currentUser, currentMember, currentOrganization } = context;
  if (
    !currentUser ||
    !currentMember ||
    !currentOrganization ||
    currentMember.disabled
  ) {
    throw new Error403();
  }
  return { currentUser, currentOrganization };
}

export async function publicFavoriteListController(
  context: AppContext,
): Promise<PublicFavoriteList> {
  const { currentUser, currentOrganization } = publicFavoriteAuth(context);
  return prisma.$withRLS({ organization: currentOrganization }, async (tx) => {
    const favorites = await tx.favoritoPublico.findMany({
      where: { userId: currentUser.id },
      select: { imovelId: true },
    });
    return { imovelIds: favorites.map(({ imovelId }) => imovelId) };
  });
}

export async function publicFavoriteToggleController(
  imovelId: string,
  context: AppContext,
): Promise<PublicFavoriteToggle> {
  const { currentUser, currentOrganization } = publicFavoriteAuth(context);
  const now = new Date();

  return prisma.$withRLS({ organization: currentOrganization }, async (tx) => {
    const imovel = await tx.imovel.findFirst({
      where: {
        id: imovelId,
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
      },
      select: { id: true, titulo: true },
    });
    if (!imovel) throw new Error404();

    const existing = await tx.favoritoPublico.findUnique({
      where: {
        organizationId_userId_imovelId: {
          organizationId: currentOrganization.id,
          userId: currentUser.id,
          imovelId,
        },
      },
    });

    if (existing) {
      await tx.favoritoPublico.delete({ where: { id: existing.id } });
      await auditLogCreate({
        entityId: existing.id,
        entityName: 'FavoritoPublico',
        operation: auditLogOperations.delete,
        context,
        oldData: existing,
        tx,
      });
      return { imovelId, isFavorite: false };
    }

    const favorite = await tx.favoritoPublico.create({
      data: {
        organizationId: currentOrganization.id,
        userId: currentUser.id,
        imovelId,
      },
    });
    await auditLogCreate({
      entityId: favorite.id,
      entityName: 'FavoritoPublico',
      operation: auditLogOperations.create,
      context,
      newData: favorite,
      tx,
    });
    return { imovelId, isFavorite: true };
  });
}
