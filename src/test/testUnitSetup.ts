import { beforeEach, afterEach } from 'vitest';
import { cleanTestDatabase } from './testPrismaClient';

beforeEach(async () => {
  await cleanTestDatabase();
});

afterEach(() => {});
