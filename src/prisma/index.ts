import { PrismaClient } from './generated/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { createPrismaWithRLS, PrismaWithRLS } from './prismaRLS';
import { createPrismaWithBypass } from './prismaWithBypass';
import { env } from '../env';

declare global {
  // eslint-disable-next-line no-var
  var basePrisma: PrismaClient | undefined;
  // eslint-disable-next-line no-var
  var prisma: PrismaWithRLS | undefined;
  // eslint-disable-next-line no-var
  var prismaDangerouslyBypassRLS: PrismaClient | undefined;
}

let prisma: PrismaWithRLS;
let prismaDangerouslyBypassRLS: PrismaClient;

function createPrismaAdapter() {
  return new PrismaPg(
    { connectionString: env.DATABASE_RLS_URL },
    { schema: env.DATABASE_SCHEMA },
  );
}

if (env.NODE_ENV === 'production') {
  const adapter = createPrismaAdapter();
  prisma = createPrismaWithRLS(new PrismaClient({ adapter }));
  prismaDangerouslyBypassRLS = createPrismaWithBypass();
} else {
  if (!global.basePrisma) {
    const adapter = createPrismaAdapter();
    global.basePrisma = new PrismaClient({ adapter });
  }

  if (!global.prisma) {
    global.prisma = createPrismaWithRLS(global.basePrisma);
  }
  prisma = global.prisma;

  if (!global.prismaDangerouslyBypassRLS) {
    global.prismaDangerouslyBypassRLS = createPrismaWithBypass();
  }
  prismaDangerouslyBypassRLS = global.prismaDangerouslyBypassRLS;
}

// Export extended prisma with RLS support for application code (primary usage)
export { prisma };

// ⚠️ Export prisma with RLS bypass for Better Auth and system operations
// WARNING: Only use for webhooks, background jobs, and system operations!
export { prismaDangerouslyBypassRLS };

export type { PrismaWithRLS };
