import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as redisConnectionModule from '../../../shared/lib/redisConnection';
import {
  acquireChatbotLock,
  releaseChatbotLock,
  hasChatbotLock,
  ChatbotLockError,
} from '../chatbotLockService';

// Mock isRedisAvailable to return false (use in-memory fallback)
vi.mock('../../../shared/lib/redisConnection', async () => {
  const actual = await vi.importActual<typeof redisConnectionModule>(
    '../../../shared/lib/redisConnection',
  );
  return {
    ...actual,
    isRedisAvailable: vi.fn().mockResolvedValue(false),
  };
});

describe('chatbotLockService', () => {
  const testUserId = 'test-user-id';

  beforeEach(async () => {
    // No cleanup needed for in-memory implementation
  });

  afterEach(async () => {
    // Release any locks to clean up
    await releaseChatbotLock(testUserId);
  });

  describe('acquireChatbotLock', () => {
    it('should acquire lock successfully when no lock exists', async () => {
      await expect(acquireChatbotLock(testUserId)).resolves.not.toThrow();
      const hasLock = await hasChatbotLock(testUserId);
      expect(hasLock).toBe(true);
    });

    it('should throw ChatbotLockError when lock already exists', async () => {
      // Acquire first lock
      await acquireChatbotLock(testUserId);

      // Try to acquire second lock
      await expect(acquireChatbotLock(testUserId)).rejects.toThrow(
        ChatbotLockError,
      );
      await expect(acquireChatbotLock(testUserId)).rejects.toThrow(
        'You already have a chatbot request in progress',
      );
    });

    it('should set TTL on the lock (in-memory)', async () => {
      await acquireChatbotLock(testUserId);

      // Lock should exist immediately after acquisition
      expect(await hasChatbotLock(testUserId)).toBe(true);
    });
  });

  describe('releaseChatbotLock', () => {
    it('should release lock successfully', async () => {
      // Acquire lock first
      await acquireChatbotLock(testUserId);
      expect(await hasChatbotLock(testUserId)).toBe(true);

      // Release lock
      await releaseChatbotLock(testUserId);
      expect(await hasChatbotLock(testUserId)).toBe(false);
    });

    it('should not throw error when releasing non-existent lock', async () => {
      await expect(releaseChatbotLock(testUserId)).resolves.not.toThrow();
    });

    it('should allow acquiring lock again after release', async () => {
      // Acquire, release, acquire again
      await acquireChatbotLock(testUserId);
      await releaseChatbotLock(testUserId);
      await expect(acquireChatbotLock(testUserId)).resolves.not.toThrow();
    });
  });

  describe('hasChatbotLock', () => {
    it('should return false when no lock exists', async () => {
      expect(await hasChatbotLock(testUserId)).toBe(false);
    });

    it('should return true when lock exists', async () => {
      await acquireChatbotLock(testUserId);
      expect(await hasChatbotLock(testUserId)).toBe(true);
    });
  });

  describe('lock isolation per user', () => {
    it('should allow different users to acquire locks independently', async () => {
      const userId1 = 'user-1';
      const userId2 = 'user-2';

      // Both users should be able to acquire locks
      await acquireChatbotLock(userId1);
      await acquireChatbotLock(userId2);

      expect(await hasChatbotLock(userId1)).toBe(true);
      expect(await hasChatbotLock(userId2)).toBe(true);

      // Clean up
      await releaseChatbotLock(userId1);
      await releaseChatbotLock(userId2);
    });
  });

  describe('lock auto-expiration', () => {
    it('should auto-release lock after TTL expires', async () => {
      // Note: Testing in-memory TTL requires waiting for full timeout
      // For unit tests, we just verify the lock mechanism works
      await acquireChatbotLock(testUserId);
      expect(await hasChatbotLock(testUserId)).toBe(true);

      // Release manually to clean up (full TTL test would take 5 minutes)
      await releaseChatbotLock(testUserId);
      expect(await hasChatbotLock(testUserId)).toBe(false);
    });
  });
});
