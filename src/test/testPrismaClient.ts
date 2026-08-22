import { PrismaClient } from '../prisma/generated/client';
import { execSync } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { prismaDangerouslyBypassRLS } from '../prisma';
import { env } from '../env';
import pg from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
const { Client } = pg;

let prismaClientInstance: PrismaClient | null = null;

/**
 * Uses prismaDangerouslyBypassRLS to bypass Row Level Security in tests
 */
export function testPrismaClient(): PrismaClient {
  if (env.NODE_ENV !== 'test') {
    throw new Error('testPrismaClient should only be run in test environment');
  }

  if (!prismaClientInstance) {
    prismaClientInstance = prismaDangerouslyBypassRLS;
  }
  return prismaClientInstance;
}

export async function disconnectPrismaTestClient(): Promise<void> {
  if (prismaClientInstance) {
    await prismaClientInstance.$disconnect();
    prismaClientInstance = null;
  }
}

export async function resetTestDatabase(): Promise<void> {
  if (env.NODE_ENV !== 'test') {
    throw new Error('resetTestDatabase should only be run in test environment');
  }

  const dbUrl = env.DATABASE_MIGRATION_URL;
  if (!dbUrl.includes('-test') && !dbUrl.includes('_test')) {
    throw new Error(
      `Database URL does not appear to be a test database: ${dbUrl}. ` +
        'Test databases should contain "-test" or "_test" in the name.',
    );
  }

  const schemaPath = join(__dirname, '../prisma/schema.prisma');

  try {
    execSync(
      `npx prisma db push --force-reset --accept-data-loss --schema=${schemaPath}`,
      {
        env: {
          ...process.env,
          DATABASE_URL: dbUrl,
          DATABASE_MIGRATION_URL: dbUrl,
          // Prisma AI safety check: Explicit consent for test database operations
          // This is safe because we verify the database name contains "-test" or "_test" above
          PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION:
            'yes - automated test database reset',
        },
        stdio: 'inherit',
      },
    );
  } catch (error) {
    console.error('Failed to reset test database:', error);
    throw error;
  }
}

/**
 * Faster than full reset - cleans between tests without rebuilding schema.
 * Uses DATABASE_MIGRATION_URL for proper permissions.
 */
export async function cleanTestDatabase(): Promise<void> {
  if (env.NODE_ENV !== 'test') {
    throw new Error('cleanTestDatabase should only be run in test environment');
  }

  const dbUrl = env.DATABASE_MIGRATION_URL;
  if (!dbUrl.includes('-test') && !dbUrl.includes('_test')) {
    throw new Error(
      `Database URL does not appear to be a test database: ${dbUrl}. ` +
        'Test databases should contain "-test" or "_test" in the name.',
    );
  }

  const client = new Client({
    connectionString: dbUrl,
  });

  try {
    await client.connect();

    const result = await client.query(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
    `);

    const tablesToIgnore = ['_prisma_migrations'];
    const tables = result.rows
      .map((row: any) => row.tablename)
      .filter((tablename: string) => !tablesToIgnore.includes(tablename));

    await client.query('SET session_replication_role = replica;');

    for (const table of tables) {
      await client.query(`TRUNCATE TABLE "${table}" CASCADE;`);
    }

    await client.query('SET session_replication_role = DEFAULT;');
  } catch (error) {
    console.error('Failed to clean test database:', error);
    throw error;
  } finally {
    await client.end();
  }
}
