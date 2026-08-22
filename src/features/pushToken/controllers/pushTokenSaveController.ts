import { AppContext } from '../../../shared/controller/appContext';
import { prisma } from '../../../prisma';
import { PushTokenSave } from '../pushTokenSchemas';

export async function pushTokenSaveController(
  data: PushTokenSave,
  context: AppContext,
) {
  const { currentUser } = context;

  if (!currentUser) {
    throw new Error('User not authenticated');
  }

  // Upsert: create if doesn't exist, update if exists
  const pushToken = await prisma.pushToken.upsert({
    where: {
      userId_token: {
        userId: currentUser.id,
        token: data.token,
      },
    },
    create: {
      userId: currentUser.id,
      type: data.type,
      token: data.token,
      platform: data.platform || null,
      p256dh: data.p256dh || null,
      auth: data.auth || null,
      expirationTime: data.expirationTime
        ? new Date(data.expirationTime)
        : null,
    },
    update: {
      type: data.type,
      platform: data.platform || null,
      p256dh: data.p256dh || null,
      auth: data.auth || null,
      expirationTime: data.expirationTime
        ? new Date(data.expirationTime)
        : null,
    },
  });

  return pushToken;
}
