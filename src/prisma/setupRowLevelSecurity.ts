import { Client } from 'pg';
import { env } from '../env';

/**
 * Setup Row Level Security (RLS) for all multi-tenant tables.
 * This function is intended to run after database migrations and in test setup
 * to ensure RLS policies are in place before the application or tests access
 * multi-tenant tables.
 *
 * This requires elevated database privileges (ALTER TABLE, CREATE POLICY) so it
 * uses the DATABASE_MIGRATION_URL (postgres superuser).
 *
 * APPROACH: Role-based RLS using PostgreSQL's native BYPASSRLS privilege:
 * - DATABASE_RLS_USER: Has NOBYPASSRLS, subject to RLS policies
 * - DATABASE_BYPASS_RLS_URL: Uses a user with BYPASSRLS privilege
 * - DATABASE_MIGRATION_URL: Postgres superuser for migrations
 *
 * RLS provides an additional security layer at the database level to complement
 * the application-level organization filtering.
 */

/**
 * Create a PostgreSQL client with elevated privileges for RLS setup
 */
async function createMigrationClient(): Promise<Client> {
  const client = new Client({
    connectionString: env.DATABASE_MIGRATION_URL,
  });
  await client.connect();
  return client;
}

/**
 * Ensure the RLS database user exists with proper permissions (NOBYPASSRLS)
 */
async function ensureRlsUserExists(client: Client): Promise<void> {
  const rlsUser = env.DATABASE_RLS_USER;
  const rlsPassword = env.DATABASE_RLS_PASSWORD;
  const dbName = env.DATABASE_NAME;
  const schema = env.DATABASE_SCHEMA;

  if (!rlsUser || !rlsPassword) {
    console.warn(
      '⚠ DATABASE_RLS_USER or DATABASE_RLS_PASSWORD not set, skipping user creation',
    );
    return;
  }

  try {
    const result = await client.query(
      'SELECT 1 FROM pg_roles WHERE rolname = $1',
      [rlsUser],
    );

    if (result.rows.length === 0) {
      console.log(`Creating RLS database user: ${rlsUser}`);
      // Escape single quotes in password to prevent SQL injection
      const escapedPassword = rlsPassword.replace(/'/g, "''");
      await client.query(
        `CREATE USER "${rlsUser}" WITH PASSWORD '${escapedPassword}' NOBYPASSRLS`,
      );
    } else {
      // Ensure existing user has NOBYPASSRLS
      await client.query(`ALTER USER "${rlsUser}" NOBYPASSRLS`);
    }

    // Quote identifiers to handle special characters like hyphens
    if (env.NODE_ENV !== 'test') {
      console.log(`Granting permissions to RLS user: ${rlsUser}`);
    }
    await client.query(`GRANT CONNECT ON DATABASE "${dbName}" TO "${rlsUser}"`);
    await client.query(`GRANT USAGE ON SCHEMA "${schema}" TO "${rlsUser}"`);
    await client.query(
      `GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA "${schema}" TO "${rlsUser}"`,
    );
    await client.query(
      `GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA "${schema}" TO "${rlsUser}"`,
    );

    // Grant default privileges for future tables
    await client.query(
      `ALTER DEFAULT PRIVILEGES IN SCHEMA "${schema}" GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO "${rlsUser}"`,
    );
    await client.query(
      `ALTER DEFAULT PRIVILEGES IN SCHEMA "${schema}" GRANT USAGE, SELECT ON SEQUENCES TO "${rlsUser}"`,
    );

    if (env.NODE_ENV !== 'test') {
      console.log(`✓ RLS database user ${rlsUser} configured successfully`);
    }
  } catch (error) {
    console.error(`✗ Failed to setup RLS database user ${rlsUser}:`, error);
    throw error;
  }
}

/**
 * Fetch all tables that have an organizationId column from the database
 */
async function getTablesWithOrganizationId(client: Client): Promise<string[]> {
  const schema = env.DATABASE_SCHEMA;

  const result = await client.query<{ table_name: string }>(
    `
    SELECT DISTINCT t.table_name
    FROM information_schema.tables t
    INNER JOIN information_schema.columns c
      ON t.table_name = c.table_name
      AND t.table_schema = c.table_schema
    WHERE t.table_schema = $1
      AND t.table_type = 'BASE TABLE'
      AND c.column_name = 'organizationId'
    ORDER BY t.table_name;
  `,
    [schema],
  );

  return result.rows.map((row) => row.table_name);
}

/**
 * Enable RLS and create policies for a single table
 */
async function setupRLSForTable(
  client: Client,
  tableName: string,
): Promise<void> {
  const schema = env.DATABASE_SCHEMA;
  const rlsUser = env.DATABASE_RLS_USER;
  const qualifiedTable = `"${schema}"."${tableName}"`;

  try {
    // Enable Row Level Security
    await client.query(
      `ALTER TABLE ${qualifiedTable} ENABLE ROW LEVEL SECURITY;`,
    );

    // NOTE: We intentionally do NOT use FORCE ROW LEVEL SECURITY
    // This allows table owners (postgres) and users with BYPASSRLS to bypass RLS
    // Only the RLS user (with NOBYPASSRLS) will be subject to RLS policies

    // Create tenant isolation policy for RLS user only
    // Uses TO clause to target specific role
    await client.query(`
      DO
      $do$
      BEGIN
        IF NOT EXISTS (
          SELECT FROM pg_catalog.pg_policies
          WHERE policyname = 'tenant_isolation_policy'
            AND tablename = '${tableName}'
            AND schemaname = '${schema}'
        ) THEN
          EXECUTE format('CREATE POLICY tenant_isolation_policy ON ${qualifiedTable} ${rlsUser ? `TO "${rlsUser}"` : ''} USING ("organizationId"::text = current_setting(''app.current_organization_id'', TRUE))');
        END IF;
      END
      $do$;
    `);

    if (env.NODE_ENV !== 'test') {
      console.log(`✓ RLS enabled for table: ${tableName}`);
    }
  } catch (error) {
    console.error(`✗ Failed to setup RLS for table ${tableName}:`, error);
    throw error;
  }
}

/**
 * Setup Row Level Security for all multi-tenant tables
 */
export async function setupRowLevelSecurity(): Promise<void> {
  let client: Client | null = null;

  try {
    if (env.NODE_ENV !== 'test') {
      console.log('Setting up Row Level Security (RLS)...');
    }

    // Connect with elevated privileges (postgres user)
    client = await createMigrationClient();

    // Ensure RLS user exists with NOBYPASSRLS
    await ensureRlsUserExists(client);

    // Dynamically fetch all tables with organizationId
    const tables = await getTablesWithOrganizationId(client);

    if (tables.length === 0) {
      console.warn('⚠ No tables with organizationId found');
      return;
    }

    if (env.NODE_ENV !== 'test') {
      console.log(
        `Found ${tables.length} tables with organizationId:`,
        tables.join(', '),
      );
    }

    for (const tableName of tables) {
      await setupRLSForTable(client, tableName);
    }

    if (env.NODE_ENV !== 'test') {
      console.log('✓ Row Level Security setup completed successfully');
    }
  } catch (error) {
    console.error('✗ Failed to setup Row Level Security:', error);
    // Don't throw - allow the application to start even if RLS setup fails
    // This prevents startup failures in development environments
    console.warn('⚠ Application will continue without RLS protection');
  } finally {
    // Always close the client connection
    if (client) {
      await client.end();
    }
  }
}
