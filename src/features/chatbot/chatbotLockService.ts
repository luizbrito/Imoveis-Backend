import {
  redisConnection,
  isRedisAvailable,
} from '../../shared/lib/redisConnection';

/**
 * Chatbot Lock Service
 * Prevents concurrent chatbot requests per user using Redis locks (with in-memory fallback)
 */

const LOCK_PREFIX = 'chatbot:lock:user:';
const LOCK_TTL = 300; // 5 minutes - prevents permanent locks from crashed processes

// In-memory lock storage (fallback when Redis is not available)
const inMemoryLocks = new Map<
  string,
  { timestamp: number; timeout: NodeJS.Timeout }
>();

export class ChatbotLockError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ChatbotLockError';
  }
}

async function acquireLockRedis(lockKey: string): Promise<boolean> {
  // SET with NX (only if not exists) and EX (expiry) for atomic lock acquisition
  const result = await redisConnection.set(lockKey, '1', 'EX', LOCK_TTL, 'NX');
  return result === 'OK';
}

async function releaseLockRedis(lockKey: string): Promise<void> {
  await redisConnection.del(lockKey);
}

async function hasLockRedis(lockKey: string): Promise<boolean> {
  const exists = await redisConnection.exists(lockKey);
  return exists === 1;
}

function acquireLockMemory(userId: string): boolean {
  const existing = inMemoryLocks.get(userId);

  if (existing) {
    const elapsed = Date.now() - existing.timestamp;
    if (elapsed < LOCK_TTL * 1000) {
      return false;
    }
    clearTimeout(existing.timeout);
    inMemoryLocks.delete(userId);
  }

  // Auto-cleanup timer prevents memory leaks from unreleased locks
  const timeout = setTimeout(() => {
    inMemoryLocks.delete(userId);
  }, LOCK_TTL * 1000);

  inMemoryLocks.set(userId, {
    timestamp: Date.now(),
    timeout,
  });

  return true;
}

function releaseLockMemory(userId: string): void {
  const existing = inMemoryLocks.get(userId);
  if (existing) {
    clearTimeout(existing.timeout);
    inMemoryLocks.delete(userId);
  }
}

function hasLockMemory(userId: string): boolean {
  const existing = inMemoryLocks.get(userId);
  if (!existing) {
    return false;
  }

  const elapsed = Date.now() - existing.timestamp;
  if (elapsed >= LOCK_TTL * 1000) {
    clearTimeout(existing.timeout);
    inMemoryLocks.delete(userId);
    return false;
  }

  return true;
}

/**
 * Acquire a lock for a user's chatbot request
 * @param userId - The user ID
 * @returns Promise that resolves when lock is acquired
 * @throws ChatbotLockError if lock is already held
 */
export async function acquireChatbotLock(userId: string): Promise<void> {
  const lockKey = `${LOCK_PREFIX}${userId}`;
  const useRedis = await isRedisAvailable();

  let acquired: boolean;

  if (useRedis) {
    acquired = await acquireLockRedis(lockKey);
  } else {
    acquired = acquireLockMemory(userId);
  }

  if (!acquired) {
    throw new ChatbotLockError(
      'You already have a chatbot request in progress. Please wait for it to complete before sending another message.',
    );
  }
}

/**
 * Release a lock for a user's chatbot request
 * @param userId - The user ID
 */
export async function releaseChatbotLock(userId: string): Promise<void> {
  const lockKey = `${LOCK_PREFIX}${userId}`;
  const useRedis = await isRedisAvailable();

  if (useRedis) {
    await releaseLockRedis(lockKey);
  } else {
    releaseLockMemory(userId);
  }
}

/**
 * Check if a user has an active chatbot lock
 * @param userId - The user ID
 * @returns true if lock exists, false otherwise
 */
export async function hasChatbotLock(userId: string): Promise<boolean> {
  const lockKey = `${LOCK_PREFIX}${userId}`;
  const useRedis = await isRedisAvailable();

  if (useRedis) {
    return await hasLockRedis(lockKey);
  } else {
    return hasLockMemory(userId);
  }
}
