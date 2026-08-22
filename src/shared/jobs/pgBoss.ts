import { PgBoss } from 'pg-boss';
import { env } from '../../env';
import { EMAIL_QUEUE } from '../email/emailSchemas';
import { NOTIFICATION_QUEUE } from '../../features/notification/notificationSchemas';

let boss: PgBoss | null = null;
let starting: Promise<PgBoss> | null = null;

// Queue configuration - pg-boss v10+ requires explicit queue creation
const QUEUE_CONFIG = {
  // Disable retries - handlers should be idempotent or manage their own retry logic
  retryLimit: 0,
};

// All queues that need to be created on startup
const QUEUES = [EMAIL_QUEUE, NOTIFICATION_QUEUE];

export async function getPgBoss(): Promise<PgBoss> {
  if (boss) return boss;
  if (starting) return starting;

  starting = (async () => {
    const instance = new PgBoss({
      // PgBoss require a privilege connection for creating queues
      connectionString: env.DATABASE_MIGRATION_URL,
      schema: env.DATABASE_SCHEMA_JOBS,
    });

    // Must add error listener before start() to prevent unhandled exceptions
    instance.on('error', (error) => {
      console.error('pg-boss error:', error);
    });

    await instance.start();

    // Create all queues on startup (idempotent - safe if already exists)
    for (const queue of QUEUES) {
      await createQueueIfNotExists(instance, queue);
    }

    boss = instance;
    return boss;
  })();

  return starting;
}

async function createQueueIfNotExists(
  instance: PgBoss,
  name: string,
): Promise<void> {
  try {
    await instance.createQueue(name, QUEUE_CONFIG);
  } catch (error) {
    // Queue already exists - expected on subsequent startups
    if (error instanceof Error && error.message.includes('already exists')) {
      return;
    }
    throw error;
  }
}

export async function stopPgBoss(): Promise<void> {
  if (boss) {
    await boss.stop();
    boss = null;
    starting = null;
  }
}

export async function scheduleJob(name: string, cron: string, data?: object) {
  const b = await getPgBoss();
  return b.schedule(name, cron, data ?? {});
}
