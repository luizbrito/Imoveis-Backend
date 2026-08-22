import { describe, it, expect, beforeEach, vi } from 'vitest';
import { testPrismaClient } from '../../../test/testPrismaClient';
import { createTestUserWithOrganization } from '../../../test/testFactories';
import {
  createAuthenticatedContext,
  mockStripePortalSession,
} from '../../../test/testUtils';
import { subscriptionPortalController } from '../controllers/subscriptionPortalController';
import { Error400 } from '../../../shared/errors/Error400';
import { Error403 } from '../../../shared/errors/Error403';
import type { Env } from '../../../env';

// Create mock Stripe methods that will be used
const mockBillingPortalSessionsCreate = vi.fn();

// Create mutable mock env object (hoisted for vi.mock)
const mockEnv = vi.hoisted(
  () =>
    ({
      STRIPE_SECRET_KEY: 'sk_test_mock',
      FRONTEND_URL: 'http://localhost:3000',
    }) as Partial<Env>,
);

// Mock env module with mutable object
vi.mock('../../../env', () => ({
  env: mockEnv,
}));
vi.mock('stripe', () => {
  return {
    default: class MockStripe {
      billingPortal = {
        sessions: {
          create: mockBillingPortalSessionsCreate,
        },
      };
    },
  };
});

describe('SubscriptionPortalController', () => {
  let prisma: ReturnType<typeof testPrismaClient>;

  beforeEach(() => {
    vi.resetModules();
    prisma = testPrismaClient();
    vi.clearAllMocks();

    // Reset mock env to defaults
    mockEnv.STRIPE_SECRET_KEY = 'sk_test_mock';
    mockEnv.FRONTEND_URL = 'http://localhost:3000';
  });

  describe('Success Cases', () => {
    it('should create portal session for user with subscription', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();

      // Mock subscription
      const mockSubscription = {
        id: '550e8400-e29b-41d4-a716-446655440910',
        userId: user.id,
        organizationId: null,
        stripeCustomerId: 'cus_portal_test',
        status: 'active',
      };

      const context = createAuthenticatedContext(user, organization, member, {
        currentSubscription: mockSubscription as any,
      });

      const mockPortalSession = mockStripePortalSession();

      mockBillingPortalSessionsCreate.mockResolvedValue(mockPortalSession);

      const result = await subscriptionPortalController(context);

      expect(result).toBeDefined();
      expect(result.url).toBeDefined();
      expect(typeof result.url).toBe('string');
    });
  });

  describe('Validation', () => {
    it('should reject when no active subscription', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      await expect(subscriptionPortalController(context)).rejects.toThrow(
        Error403,
      );
    });

    it('should reject when subscription belongs to different user', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();

      const otherUser = await prisma.user.create({
        data: {
          email: `other-${Date.now()}@example.com`,
          emailVerified: true,
        },
      });

      // Subscription belongs to other user
      const mockSubscription = {
        id: '550e8400-e29b-41d4-a716-446655440920',
        userId: otherUser.id,
        organizationId: null,
        stripeCustomerId: 'cus_other_test',
        status: 'active',
      };

      const context = createAuthenticatedContext(user, organization, member, {
        currentSubscription: mockSubscription as any,
      });

      await expect(subscriptionPortalController(context)).rejects.toThrow(
        Error403,
      );
    });

    it('should reject when Stripe is not configured', async () => {
      mockEnv.STRIPE_SECRET_KEY = undefined;

      const { user, organization, member } =
        await createTestUserWithOrganization();

      const mockSubscription = {
        id: '550e8400-e29b-41d4-a716-446655440930',
        userId: user.id,
        stripeCustomerId: 'cus_test',
        status: 'active',
      };

      const context = createAuthenticatedContext(user, organization, member, {
        currentSubscription: mockSubscription as any,
      });

      await expect(subscriptionPortalController(context)).rejects.toThrow(
        Error400,
      );

      // Restore in afterEach via beforeEach
    });
  });
});
