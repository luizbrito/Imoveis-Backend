import { resetTestDatabase } from './testPrismaClient';
import { setupRowLevelSecurity } from '../prisma/setupRowLevelSecurity';

async function globalSetup() {
  console.log('Resetting test database...');
  await resetTestDatabase();

  console.log('Setting up Row Level Security...');
  await setupRowLevelSecurity();

  console.log('Test database setup complete');
}

export default globalSetup;
