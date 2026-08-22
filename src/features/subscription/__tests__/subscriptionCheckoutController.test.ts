import { describe, it, expect, beforeEach, vi } from 'vitest';
import { testPrismaClient } from '../../../test/testPrismaClient';
import { createTestUserWithOrganization } from '../../../test/testFactories';
import {
  createAuthenticatedContext,
  mockStripeCheckoutSession,
} from '../../../test/testUtils';
import { subscriptionCheckoutController } from '../controllers/subscriptionCheckoutController';
import { Error400 } from '../../../shared/errors/Error400';
import type { Env } from '../../../env';

// Create mock Stripe methods that will be used
const mockCheckoutSessionsCreate = vi.fn();
const mockCustomersList = vi.fn();
const mockCustomersCreate = vi.fn();

// Create mutable mock env object (hoisted for vi.mock)
const mockEnv = vi.hoisted(
  () =>
    ({
      STRIPE_SECRET_KEY: 'sk_test_mock',
      FRONTEND_URL: 'http://localhost:3000',
      SUBSCRIPTION_MODE: 'organization',
    }) as Partial<Env>,
);

// Mock env module with mutable object
vi.mock('../../../env', () => ({
  env: mockEnv,
}));
vi.mock('stripe', () => {
  return {
    default: class MockStripe {
      checkout = {
        sessions: {
          create: mockCheckoutSessionsCreate,
        },
      };
      customers = {
        list: mockCustomersList,
        create: mockCustomersCreate,
      };
    },
  };
});

// Mock subscription helpers
vi.mock('../subscriptionIsValidStripePriceId', () => ({
  subscriptionIsValidStripePriceId: vi.fn(),
}));

import { subscriptionIsValidStripePriceId } from '../subscriptionIsValidStripePriceId';

describe('SubscriptionCheckoutController', () => {
  let prisma: ReturnType<typeof testPrismaClient>;

  beforeEach(() => {
    vi.resetModules();
    prisma = testPrismaClient();
    vi.clearAllMocks();

    // Reset mock env to defaults
    mockEnv.STRIPE_SECRET_KEY = 'sk_test_mock';
    mockEnv.FRONTEND_URL = 'http://localhost:3000';
    mockEnv.SUBSCRIPTION_MODE = 'organization';
  });

  describe('Success Cases', () => {
    it('should create checkout session for new customer', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      const stripePriceId = 'price_test_123';

      vi.mocked(subscriptionIsValidStripePriceId).mockResolvedValue(true);

      const mockCustomer = {
        id: 'cus_test_123',
        email: user.email,
        metadata: {},
      };

      const mockSession = mockStripeCheckoutSession();

      mockCustomersList.mockResolvedValue({
        data: [],
      });
      mockCustomersCreate.mockResolvedValue(mockCustomer);
      mockCheckoutSessionsCreate.mockResolvedValue(mockSession);

      const result = await subscriptionCheckoutController(
        { stripePriceId },
        context,
      );

      expect(result).toBeDefined();
      expect(result.url).toBeDefined();
      expect(typeof result.url).toBe('string');
    });

    it('should reuse existing Stripe customer', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      const stripePriceId = 'price_test_456';

      vi.mocked(subscriptionIsValidStripePriceId).mockResolvedValue(true);

      const existingCustomer = {
        id: 'cus_existing_123',
        email: user.email,
        metadata: {
          userId: user.id,
          organizationId: organization.id,
        },
      };

      const mockSession = mockStripeCheckoutSession();

      mockCustomersList.mockResolvedValue({
        data: [existingCustomer],
      });
      mockCheckoutSessionsCreate.mockResolvedValue(mockSession);

      const result = await subscriptionCheckoutController(
        { stripePriceId },
        context,
      );

      expect(result).toBeDefined();
      expect(result.url).toBeDefined();
      expect(mockCustomersCreate).not.toHaveBeenCalled();
    });
  });

  describe('Validation', () => {
    it('should reject invalid stripe price ID', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      vi.mocked(subscriptionIsValidStripePriceId).mockResolvedValue(false);

      await expect(
        subscriptionCheckoutController(
          { stripePriceId: 'invalid_price' },
          context,
        ),
      ).rejects.toThrow(Error400);
    });

    it('should reject when user already has active subscription', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();

      // Mock active subscription
      const context = createAuthenticatedContext(user, organization, member, {
        currentSubscription: {
          id: '550e8400-e29b-41d4-a716-446655440900',
          status: 'active',
        } as any,
      });

      vi.mocked(subscriptionIsValidStripePriceId).mockResolvedValue(true);

      await expect(
        subscriptionCheckoutController(
          { stripePriceId: 'price_test_789' },
          context,
        ),
      ).rejects.toThrow(Error400);
    });

    it('should reject when Stripe is not configured', async () => {
      mockEnv.STRIPE_SECRET_KEY = undefined;

      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      vi.mocked(subscriptionIsValidStripePriceId).mockResolvedValue(true);

      await expect(
        subscriptionCheckoutController(
          { stripePriceId: 'price_test_000' },
          context,
        ),
      ).rejects.toThrow(Error400);

      // Restore in afterEach via beforeEach
    });
  });
});
