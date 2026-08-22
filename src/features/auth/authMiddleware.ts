import { Context } from 'hono';
import { prismaDangerouslyBypassRLS } from '../../prisma';
import { AppContext } from '../../shared/controller/appContext';
import { filePopulateDownloadUrlInTree } from '../file/fileService';
import { subscriptionFindActive } from '../subscription/subscriptionFindActive';
import { subscriptionSelectAndValidateDefaultMode } from '../subscription/subscriptionSelectAndValidateDefaultMode';
import { authBackend } from './authBackend';
import {
  buildSubscriptionCacheKey,
  getCachedMember,
  getCachedSubscription,
  setCachedMember,
  setCachedSubscription,
} from './authCache';
import { Error401 } from '../../shared/errors/Error401';
import { env } from '../../env';

export async function authMiddlewareForApiKey(
  apiKeyHeader: string,
  context: AppContext,
): Promise<AppContext> {
  const apiKeyResult = await authBackend.api.verifyApiKey({
    body: { key: apiKeyHeader },
    headers: context.headers,
  });

  // Must bypass RLS to fetch user - we don't have organization context yet
  const user = await prismaDangerouslyBypassRLS.user.findFirstOrThrow({
    where: { id: apiKeyResult.key?.referenceId },
  });

  context.currentUser = user;

  if (!env.AUTH_BYPASS_EMAIL_VERIFICATION) {
    if (!user.emailVerified) {
      throw new Error401(context.dictionary.auth.errors.EMAIL_NOT_VERIFIED);
    }
  }

  if (apiKeyResult.valid && apiKeyResult.key) {
    context.apiKey = apiKeyResult.key as any;

    // API keys store organizationId in metadata to scope permissions
    // Without this, the key would have access across all user's organizations
    const organizationId = apiKeyResult.key.metadata?.organizationId;

    if (organizationId && typeof organizationId === 'string') {
      const member = await getMemberWithCache(user.id, organizationId);

      if (member) {
        await populateMemberInContext(
          context,
          member,
          user.id,
          organizationId,
          member.id,
        );
      }
    }
  }

  return context;
}

export async function authMiddlewareForSession(
  c: Context,
  context: AppContext,
): Promise<AppContext> {
  const request = c.req.raw;

  const session = await authBackend.api.getSession({
    headers: request.headers,
  });
  context.headers = request.headers;

  // Return early with empty context if not authenticated
  // Allows endpoints to handle unauthenticated requests gracefully
  if (!session || !session.session || !session.user) {
    return context;
  }

  if (!env.AUTH_BYPASS_EMAIL_VERIFICATION) {
    if (!session.user.emailVerified) {
      throw new Error401(context.dictionary.auth.errors.EMAIL_NOT_VERIFIED);
    }
  }

  // Better Auth organization plugin stores the active organization in session
  // This allows users to switch between organizations without re-authenticating
  let activeMember;
  try {
    activeMember = await authBackend.api.getActiveMember({
      headers: request.headers,
    });
  } catch {
    // better-auth 1.5+ throws NO_ACTIVE_ORGANIZATION when no org is selected
  }

  // User is authenticated but hasn't selected an organization yet
  // Common for new users or when accessing organization-agnostic endpoints
  if (!activeMember) {
    context.currentUser = session.user as any;
    return context;
  }

  const currentMember = await getMemberWithCache(
    session.user.id,
    activeMember.organizationId,
    activeMember.id,
  );

  // Member record was deleted or user lost access to organization
  // Return context with user but no member/organization to trigger appropriate error
  if (!currentMember) {
    context.currentUser = session.user as any;
    return context;
  }

  context.currentUser = session.user as any;
  await populateMemberInContext(
    context,
    currentMember,
    session.user.id,
    activeMember.organizationId,
    activeMember.id,
  );

  return context;
}

// MCP (Model Context Protocol) authentication for Claude Code integration
// Trusts userId/organizationId from MCP transport layer (already authenticated)
export async function authMiddlewareForMcp(
  userId: string,
  organizationId: string,
  c: Context,
  context: AppContext,
): Promise<AppContext> {
  try {
    const request = c.req.raw;
    context.headers = request.headers;
    context.isMcpRequest = true;

    // Must bypass RLS - we're building the auth context needed for RLS
    const user = await prismaDangerouslyBypassRLS.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return context;
    }

    if (!env.AUTH_BYPASS_EMAIL_VERIFICATION) {
      if (!user.emailVerified) {
        throw new Error401(context.dictionary.auth.errors.EMAIL_NOT_VERIFIED);
      }
    }

    context.currentUser = user as any;

    const member = await getMemberWithCache(userId, organizationId);

    if (!member) {
      return context;
    }

    await populateMemberInContext(
      context,
      member,
      userId,
      organizationId,
      member.id,
    );

    return context;
  } catch (error) {
    // Swallow errors for MCP requests to prevent Claude Code from breaking
    // MCP tools will handle missing auth context gracefully
    console.error('[authMiddlewareForMcp] Error:', error);
    return context;
  }
}

async function getMemberWithCache(
  userId: string,
  organizationId: string,
  memberId?: string,
) {
  let member = await getCachedMember(userId, organizationId);

  // Cache miss - fetch from database
  // undefined indicates cache miss, null indicates "user not member of org"
  if (member === undefined) {
    // Must bypass RLS - this query is used to build the auth context for RLS
    member = await prismaDangerouslyBypassRLS.member.findFirst({
      where: memberId
        ? { id: memberId }
        : {
            userId: userId,
            organizationId: organizationId,
          },
      include: {
        user: {
          select: {
            email: true,
            emailVerified: true,
            id: true,
          },
        },
        organization: true,
      },
    });

    // Cache both hits and misses to avoid redundant queries
    await setCachedMember(userId, organizationId, member);
  }

  return member;
}

async function populateMemberInContext(
  context: AppContext,
  member: any,
  userId: string,
  organizationId: string,
  memberId: string,
) {
  // Generate presigned URLs for file fields (avatar, etc.) in member object tree
  const populatedMember = await filePopulateDownloadUrlInTree(member);

  context.currentMember = populatedMember;
  context.currentOrganization = populatedMember?.organization;

  const subscriptionMode = subscriptionSelectAndValidateDefaultMode(context);

  if (subscriptionMode === 'disabled') {
    context.currentSubscription = null;
  } else {
    // Subscription cache key varies based on mode (per-user vs per-organization)
    // Returns null when subscription caching is disabled
    const subscriptionCacheKey = buildSubscriptionCacheKey(
      subscriptionMode,
      userId,
      organizationId,
      memberId,
    );

    let subscription: any | null | undefined = undefined;
    if (subscriptionCacheKey) {
      subscription = await getCachedSubscription(subscriptionCacheKey);

      if (subscription === undefined) {
        console.log(
          `[Auth Cache] Subscription cache miss - mode: ${subscriptionMode}, key: ${subscriptionCacheKey}`,
        );
        subscription = await subscriptionFindActive(context);
        await setCachedSubscription(subscriptionCacheKey, subscription);
      }
    } else {
      // No cache key means subscription caching is disabled - always fetch fresh
      subscription = await subscriptionFindActive(context);
    }

    context.currentSubscription = subscription;
  }
}
