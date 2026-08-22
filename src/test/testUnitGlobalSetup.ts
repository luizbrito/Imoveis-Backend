import {
  disconnectPrismaTestClient,
  resetTestDatabase,
} from './testPrismaClient';
import { setupRowLevelSecurity } from '../prisma/setupRowLevelSecurity';

export async function setup() {
  console.log('Global setup: Resetting test database and configuring RLS');

  await resetTestDatabase();
  await setupRowLevelSecurity();
}

export async function teardown() {
  console.log('Global teardown: Disconnecting from database');
  await disconnectPrismaTestClient();
}
