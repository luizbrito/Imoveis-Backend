import { prisma } from '../../prisma';
import { env } from '../../env';

export const TOKEN_LIMITS = {
  USER: Number(env.CHATBOT_DAILY_TOKEN_LIMIT_USER) || 50000,
  ORGANIZATION: Number(env.CHATBOT_DAILY_TOKEN_LIMIT_ORGANIZATION) || 1000000,
  GLOBAL: Number(env.CHATBOT_DAILY_TOKEN_LIMIT_GLOBAL) || 1000000,
};

export type LimitCheckResult =
  | { allowed: true }
  | {
      allowed: false;
      limitType: 'user' | 'organization' | 'global';
      current: number;
      limit: number;
    };

function getTodayDate(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}

/**
 * Track token usage for a user
 * This function is idempotent - uses upsert to avoid double-counting
 */
export async function trackTokenUsage(
  userId: string,
  organizationId: string,
  inputTokens: number,
  outputTokens: number,
): Promise<void> {
  const date = getTodayDate();
  const totalTokens = inputTokens + outputTokens;

  await prisma.$withRLS(
    { organization: { id: organizationId } },
    async (tx) => {
      await tx.chatbotUsage.upsert({
        where: {
          userId_date: {
            userId,
            date,
          },
        },
        create: {
          userId,
          organizationId,
          date,
          inputTokens,
          outputTokens,
          totalTokens,
        },
        update: {
          inputTokens: {
            increment: inputTokens,
          },
          outputTokens: {
            increment: outputTokens,
          },
          totalTokens: {
            increment: totalTokens,
          },
        },
      });
    },
  );
}

/**
 * Get user's daily token usage
 * Note: This function needs organizationId for RLS context
 */
export async function getUserDailyUsage(
  userId: string,
  organizationId: string,
  date: Date,
): Promise<number> {
  const usage = await prisma.$withRLS(
    { organization: { id: organizationId } },
    async (tx) => {
      return await tx.chatbotUsage.findUnique({
        where: {
          userId_date: {
            userId,
            date,
          },
        },
        select: {
          totalTokens: true,
        },
      });
    },
  );

  return usage?.totalTokens || 0;
}

export async function getOrganizationDailyUsage(
  organizationId: string,
  date: Date,
): Promise<number> {
  const result = await prisma.$withRLS(
    { organization: { id: organizationId } },
    async (tx) => {
      return await tx.chatbotUsage.aggregate({
        where: {
          organizationId,
          date,
        },
        _sum: {
          totalTokens: true,
        },
      });
    },
  );

  return result._sum.totalTokens || 0;
}

export async function getGlobalDailyUsage(date: Date): Promise<number> {
  const result = await prisma.chatbotUsage.aggregate({
    where: {
      date,
    },
    _sum: {
      totalTokens: true,
    },
  });

  return result._sum.totalTokens || 0;
}

/**
 * Check all three limits and return which limit would be exceeded (if any)
 * This is called before processing a message to ensure the user hasn't exceeded their quota
 */
export async function checkAllLimits(
  userId: string,
  organizationId: string,
): Promise<LimitCheckResult> {
  const today = getTodayDate();

  const [userUsage, orgUsage, globalUsage] = await Promise.all([
    getUserDailyUsage(userId, organizationId, today),
    getOrganizationDailyUsage(organizationId, today),
    getGlobalDailyUsage(today),
  ]);

  if (userUsage >= TOKEN_LIMITS.USER) {
    return {
      allowed: false,
      limitType: 'user',
      current: userUsage,
      limit: TOKEN_LIMITS.USER,
    };
  }

  if (orgUsage >= TOKEN_LIMITS.ORGANIZATION) {
    return {
      allowed: false,
      limitType: 'organization',
      current: orgUsage,
      limit: TOKEN_LIMITS.ORGANIZATION,
    };
  }

  if (globalUsage >= TOKEN_LIMITS.GLOBAL) {
    return {
      allowed: false,
      limitType: 'global',
      current: globalUsage,
      limit: TOKEN_LIMITS.GLOBAL,
    };
  }

  return { allowed: true };
}

/**
 * Get remaining tokens for all three tiers
 * Useful for displaying usage stats to users
 */
export async function getRemainingTokens(
  userId: string,
  organizationId: string,
): Promise<{
  user: { current: number; limit: number; remaining: number };
  organization: { current: number; limit: number; remaining: number };
  global: { current: number; limit: number; remaining: number };
}> {
  const today = getTodayDate();

  const [userUsage, orgUsage, globalUsage] = await Promise.all([
    getUserDailyUsage(userId, organizationId, today),
    getOrganizationDailyUsage(organizationId, today),
    getGlobalDailyUsage(today),
  ]);

  return {
    user: {
      current: userUsage,
      limit: TOKEN_LIMITS.USER,
      remaining: Math.max(0, TOKEN_LIMITS.USER - userUsage),
    },
    organization: {
      current: orgUsage,
      limit: TOKEN_LIMITS.ORGANIZATION,
      remaining: Math.max(0, TOKEN_LIMITS.ORGANIZATION - orgUsage),
    },
    global: {
      current: globalUsage,
      limit: TOKEN_LIMITS.GLOBAL,
      remaining: Math.max(0, TOKEN_LIMITS.GLOBAL - globalUsage),
    },
  };
}
