import { disconnectPrismaTestClient } from './testPrismaClient';
import { redisConnection } from '../shared/lib/redisConnection';

async function globalTeardown() {
  // Flush Redis to clean up test data
  try {
    await redisConnection.flushdb();
  } catch (error) {
    console.error('Failed to flush Redis:', error);
  }

  // Disconnect from database
  await disconnectPrismaTestClient();

  // Disconnect from Redis
  await redisConnection.quit();
}

export default globalTeardown;
