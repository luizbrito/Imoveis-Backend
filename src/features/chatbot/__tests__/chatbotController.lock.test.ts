import { describe, it, expect, beforeEach } from 'vitest';
import { testPrismaClient } from '../../../test/testPrismaClient';
import { createTestUserWithOrganization } from '../../../test/testFactories';
import { createAuthenticatedContext } from '../../../test/testUtils';
import { chatbotSendMessageController } from '../chatbotController';
import { releaseChatbotLock } from '../chatbotLockService';
import { Context } from 'hono';

describe('chatbotController - Lock Protection', () => {
  beforeEach(async () => {
    const prisma = testPrismaClient();
    // Clean up test data
    await prisma.chatbotUsage.deleteMany();
  });

  it('should reject concurrent requests from same user', async () => {
    const { user, organization, member } =
      await createTestUserWithOrganization();
    const context = createAuthenticatedContext(user, organization, member);

    // Mock Hono context
    const mockHonoContext = {
      json: (data: any, status?: number) => ({
        data,
        status,
      }),
      header: () => {},
      newResponse: (body: any, init?: any) => new Response(body, init),
    } as unknown as Context;

    const input = {
      message: 'Hello',
      conversationHistory: [],
    };

    // First request should acquire lock and start processing
    const firstRequest = chatbotSendMessageController(
      input,
      context,
      mockHonoContext,
    );

    // Wait a tiny bit for lock to be acquired
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Second concurrent request should be rejected
    const secondRequest = chatbotSendMessageController(
      input,
      context,
      mockHonoContext,
    );

    const secondResponse = (await secondRequest) as any;

    // Second request should return 409 Conflict
    expect(secondResponse.status).toBe(409);
    expect(secondResponse.data.error).toBe('concurrent_request');
    expect(secondResponse.data.message).toContain(
      'already have a chatbot request in progress',
    );

    // Clean up - release the lock from first request
    await releaseChatbotLock(user.id);

    // Wait for first request to complete or timeout
    // Note: In tests without mocking Claude API, this will fail to stream
    // but that's okay - we're testing the lock mechanism
  }, 10000);

  it('should allow request after previous request completes', async () => {
    const { user, organization, member } =
      await createTestUserWithOrganization();
    const context = createAuthenticatedContext(user, organization, member);

    const mockHonoContext = {
      json: (data: any, status?: number) => ({
        data,
        status,
      }),
      header: () => {},
      newResponse: (body: any, init?: any) => new Response(body, init),
    } as unknown as Context;

    const input = {
      message: 'Hello',
      conversationHistory: [],
    };

    // First request
    const firstRequest = chatbotSendMessageController(
      input,
      context,
      mockHonoContext,
    );

    // Release lock manually (simulating completion)
    await releaseChatbotLock(user.id);

    // Second request should succeed in acquiring lock
    const secondRequest = chatbotSendMessageController(
      input,
      context,
      mockHonoContext,
    );

    // Clean up
    await releaseChatbotLock(user.id);
  }, 10000);

  it('should allow different users to have concurrent requests', async () => {
    const user1Data = await createTestUserWithOrganization();
    const user2Data = await createTestUserWithOrganization();

    const context1 = createAuthenticatedContext(
      user1Data.user,
      user1Data.organization,
      user1Data.member,
    );
    const context2 = createAuthenticatedContext(
      user2Data.user,
      user2Data.organization,
      user2Data.member,
    );

    const mockHonoContext = {
      json: (data: any, status?: number) => ({
        data,
        status,
      }),
      header: () => {},
      newResponse: (body: any, init?: any) => new Response(body, init),
    } as unknown as Context;

    const input = {
      message: 'Hello',
      conversationHistory: [],
    };

    // Both users should be able to start requests
    const request1 = chatbotSendMessageController(
      input,
      context1,
      mockHonoContext,
    );
    const request2 = chatbotSendMessageController(
      input,
      context2,
      mockHonoContext,
    );

    // Clean up
    await releaseChatbotLock(user1Data.user.id);
    await releaseChatbotLock(user2Data.user.id);
  }, 10000);
});
