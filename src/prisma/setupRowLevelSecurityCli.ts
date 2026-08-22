#!/usr/bin/env tsx

/**
 * CLI wrapper for setupRowLevelSecurity
 * This script is meant to be run after database migrations to ensure
 * Row Level Security policies are properly configured.
 *
 * Usage:
 *   npx tsx src/prisma/setupRowLevelSecurityCli.ts
 */

import { setupRowLevelSecurity } from './setupRowLevelSecurity';

async function main() {
  try {
    await setupRowLevelSecurity();
    process.exit(0);
  } catch (error) {
    console.error('Failed to setup Row Level Security:', error);
    process.exit(1);
  }
}

main();
