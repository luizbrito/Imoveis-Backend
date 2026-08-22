import { defineConfig } from 'prisma/config';
import { join } from 'node:path';

// Environment variables are loaded by:
// - dotenv-cli in package.json scripts (dev, test, etc.)
// - Prisma CLI automatically for migrations
// Read directly from process.env to avoid validation errors during postinstall

export default defineConfig({
  schema: join('src', 'prisma', 'schema.prisma'),
  migrations: {
    path: join('src', 'prisma', 'migrations'),
  },
  datasource: {
    // Read directly from process.env instead of validated env object
    // to avoid errors during postinstall when .env is not loaded yet
    url: process.env.DATABASE_MIGRATION_URL,
  },
});
