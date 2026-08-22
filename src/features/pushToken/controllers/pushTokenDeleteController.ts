import { AppContext } from '../../../shared/controller/appContext';
import { prisma } from '../../../prisma';
import { PushTokenDelete } from '../pushTokenSchemas';

export async function pushTokenDeleteController(
  data: PushTokenDelete,
  context: AppContext,
) {
  const { currentUser } = context;

  if (!currentUser) {
    throw new Error('User not authenticated');
  }

  const pushToken = await prisma.pushToken.deleteMany({
    where: {
      userId: currentUser.id,
      token: data.token,
    },
  });

  return { deleted: pushToken.count > 0 };
}
