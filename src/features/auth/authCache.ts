import { redisConnection } from '../../shared/lib/redisConnection';
import { env } from '../../env';

const CACHE_TTL_SECONDS = 300; // 5 minutes

// Sentinel values to distinguish between "no data" and "cache miss"
const NO_SUBSCRIPTION_SENTINEL = '__NO_SUBSCRIPTION__';
const NO_MEMBER_SENTINEL = '__NO_MEMBER__';
const NO_ORGANIZATION_SENTINEL = '__NO_ORGANIZATION__';

// Check if Redis is available based on environment
function isRedisAvailable(): boolean {
  return Boolean(env.REDIS_URL);
}

// Cache key generators
function getMemberCacheKey(userId: string, organizationId: string): string {
  return `auth:member:${userId}:${organizationId}`;
}

function getOrganizationCacheKey(organizationId: string): string {
  return `auth:organization:${organizationId}`;
}

function getSubscriptionCacheKey(subscriptionKey: string): string {
  return `auth:subscription:${subscriptionKey}`;
}

// Helper function to generate subscription cache key based on mode
export function buildSubscriptionCacheKey(
  mode: string,
  userId?: string,
  organizationId?: string,
  memberId?: string,
): string | null {
  if (mode === 'user' && userId) {
    return `user:${userId}`;
  }
  if (mode === 'organization' && organizationId) {
    return `organization:${organizationId}`;
  }
  if (mode === 'member' && memberId) {
    return `member:${memberId}`;
  }
  return null;
}

// Get cached member data
// Returns: member object, null (if no member exists), or undefined (cache miss)
export async function getCachedMember(
  userId: string,
  organizationId: string,
): Promise<any | null | undefined> {
  if (!isRedisAvailable()) {
    return undefined;
  }

  try {
    const key = getMemberCacheKey(userId, organizationId);
    const data = await redisConnection.get(key);
    if (data === null) {
      // Key doesn't exist - cache miss
      return undefined;
    }
    if (data === NO_MEMBER_SENTINEL) {
      // Cached as "no member"
      return null;
    }
    // Key exists - parse and return
    return JSON.parse(data);
  } catch (error) {
    console.error('Error getting cached member:', error);
    return undefined;
  }
}

// Set cached member data
export async function setCachedMember(
  userId: string,
  organizationId: string,
  data: any,
  ttl: number = CACHE_TTL_SECONDS,
): Promise<void> {
  if (!isRedisAvailable()) {
    return;
  }

  try {
    const key = getMemberCacheKey(userId, organizationId);
    const value = data === null ? NO_MEMBER_SENTINEL : JSON.stringify(data);
    await redisConnection.set(key, value, 'EX', ttl);
  } catch (error) {
    console.error('Error setting cached member:', error);
  }
}

// Invalidate member cache
export async function invalidateMember(
  userId: string,
  organizationId: string,
): Promise<void> {
  if (!isRedisAvailable()) {
    return;
  }

  try {
    const key = getMemberCacheKey(userId, organizationId);
    await redisConnection.del(key);
  } catch (error) {
    console.error('Error invalidating member cache:', error);
  }
}

// Get cached organization data
// Returns: organization object, null (if no organization exists), or undefined (cache miss)
export async function getCachedOrganization(
  organizationId: string,
): Promise<any | null | undefined> {
  if (!isRedisAvailable()) {
    return undefined;
  }

  try {
    const key = getOrganizationCacheKey(organizationId);
    const data = await redisConnection.get(key);
    if (data === null) {
      // Key doesn't exist - cache miss
      return undefined;
    }
    if (data === NO_ORGANIZATION_SENTINEL) {
      // Cached as "no organization"
      return null;
    }
    // Key exists - parse and return
    return JSON.parse(data);
  } catch (error) {
    console.error('Error getting cached organization:', error);
    return undefined;
  }
}

// Set cached organization data
export async function setCachedOrganization(
  organizationId: string,
  data: any,
  ttl: number = CACHE_TTL_SECONDS,
): Promise<void> {
  if (!isRedisAvailable()) {
    return;
  }

  try {
    const key = getOrganizationCacheKey(organizationId);
    const value =
      data === null ? NO_ORGANIZATION_SENTINEL : JSON.stringify(data);
    await redisConnection.set(key, value, 'EX', ttl);
  } catch (error) {
    console.error('Error setting cached organization:', error);
  }
}

// Invalidate organization cache
export async function invalidateOrganization(
  organizationId: string,
): Promise<void> {
  if (!isRedisAvailable()) {
    return;
  }

  try {
    const key = getOrganizationCacheKey(organizationId);
    await redisConnection.del(key);
  } catch (error) {
    console.error('Error invalidating organization cache:', error);
  }
}

// Get cached subscription data
// Returns: subscription object, null (if no subscription exists), or undefined (cache miss)
export async function getCachedSubscription(
  subscriptionKey: string,
): Promise<any | null | undefined> {
  if (!isRedisAvailable()) {
    return undefined;
  }

  try {
    const key = getSubscriptionCacheKey(subscriptionKey);
    const data = await redisConnection.get(key);
    if (data === null) {
      // Key doesn't exist - cache miss
      return undefined;
    }
    if (data === NO_SUBSCRIPTION_SENTINEL) {
      // Cached as "no subscription"
      return null;
    }
    // Key exists - parse and return
    return JSON.parse(data);
  } catch (error) {
    console.error('Error getting cached subscription:', error);
    return undefined;
  }
}

// Set cached subscription data
export async function setCachedSubscription(
  subscriptionKey: string,
  data: any,
  ttl: number = CACHE_TTL_SECONDS,
): Promise<void> {
  if (!isRedisAvailable()) {
    return;
  }

  try {
    const key = getSubscriptionCacheKey(subscriptionKey);
    const value =
      data === null ? NO_SUBSCRIPTION_SENTINEL : JSON.stringify(data);
    await redisConnection.set(key, value, 'EX', ttl);
  } catch (error) {
    console.error('Error setting cached subscription:', error);
  }
}

// Invalidate subscription cache
export async function invalidateSubscription(
  subscriptionKey: string,
): Promise<void> {
  if (!isRedisAvailable()) {
    return;
  }

  try {
    const key = getSubscriptionCacheKey(subscriptionKey);
    await redisConnection.del(key);
  } catch (error) {
    console.error('Error invalidating subscription cache:', error);
  }
}

// Invalidate all member caches for a user (across all organizations)
export async function invalidateAllMemberCaches(userId: string): Promise<void> {
  if (!isRedisAvailable()) {
    return;
  }

  try {
    const pattern = `auth:member:${userId}:*`;
    const keys = await redisConnection.keys(pattern);
    if (keys.length > 0) {
      await redisConnection.del(...keys);
    }
  } catch (error) {
    console.error('Error invalidating all member caches:', error);
  }
}

// Invalidate all organization-related caches (org + all members)
export async function invalidateOrganizationAndMembers(
  organizationId: string,
): Promise<void> {
  if (!isRedisAvailable()) {
    return;
  }

  try {
    // Invalidate organization cache
    await invalidateOrganization(organizationId);

    // Invalidate all member caches for this organization
    const memberPattern = `auth:member:*:${organizationId}`;
    const memberKeys = await redisConnection.keys(memberPattern);
    if (memberKeys.length > 0) {
      await redisConnection.del(...memberKeys);
    }
  } catch (error) {
    console.error('Error invalidating organization and members:', error);
  }
}
