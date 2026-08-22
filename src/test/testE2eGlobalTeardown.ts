import { disconnectPrismaTestClient } from './testPrismaClient';
import { redisConnection } from '../shared/lib/redisConnection';

async function globalTeardown() {
  try {
    if (typeof redisConnection.flushdb === 'function') {
      await redisConnection.flushdb();
    }
  } catch (error) {
    console.error('Failed to flush Redis:', error);
  }

  await disconnectPrismaTestClient();

  try {
    if (typeof redisConnection.quit === 'function') {
      await redisConnection.quit();
    }
  } catch (error) {
    console.error('Failed to quit Redis connection:', error);
  }
}

export default globalTeardown;
