import { describe, it, expect, beforeEach, vi } from 'vitest';
import { testPrismaClient } from '../../../test/testPrismaClient';
import { createTestUserWithOrganization } from '../../../test/testFactories';
import {
  createAuthenticatedContext,
  mockStripeWebhookEvent,
} from '../../../test/testUtils';
import { subscriptionWebhookController } from '../controllers/subscriptionWebhookController';
import { Error400 } from '../../../shared/errors/Error400';
import type { Env } from '../../../env';

// Create mock Stripe methods
const mockWebhooksConstructEvent = vi.fn();
const mockCheckoutSessionsRetrieve = vi.fn();
const mockSubscriptionsRetrieve = vi.fn();

// Create mutable mock env object (hoisted for vi.mock)
const mockEnv = vi.hoisted(
  () =>
    ({
      STRIPE_SECRET_KEY: 'sk_test_mock',
      STRIPE_WEBHOOK_SECRET: 'whsec_test_mock', // cspell:disable-line
    }) as Partial<Env>,
);

// Mock env module with mutable object
vi.mock('../../../env', () => ({
  env: mockEnv,
}));
vi.mock('stripe', () => {
  return {
    default: class MockStripe {
      webhooks = {
        constructEvent: mockWebhooksConstructEvent,
      };
      checkout = {
        sessions: {
          retrieve: mockCheckoutSessionsRetrieve,
        },
      };
      subscriptions = {
        retrieve: mockSubscriptionsRetrieve,
      };
    },
  };
});

// Mock subscription helpers
vi.mock('../subscriptionFetchPlans', () => ({
  invalidateStripePlansCache: vi.fn(),
}));

describe('SubscriptionWebhookController', () => {
  beforeEach(() => {
    testPrismaClient();
    vi.clearAllMocks();

    // Reset mock env to defaults
    mockEnv.STRIPE_SECRET_KEY = 'sk_test_mock';
    mockEnv.STRIPE_WEBHOOK_SECRET = 'whsec_test_mock'; // cspell:disable-line
  });

  describe('Validation', () => {
    it('should reject when Stripe is not configured', async () => {
      mockEnv.STRIPE_SECRET_KEY = undefined;

      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      await expect(
        subscriptionWebhookController('raw body', 'sig_test', context),
      ).rejects.toThrow(Error400);

      // Restore in afterEach via beforeEach
    });

    it('should validate webhook signature', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      const mockEvent = mockStripeWebhookEvent('checkout.session.completed', {
        id: 'cs_test_123',
      });

      mockWebhooksConstructEvent.mockReturnValue(mockEvent);
      mockCheckoutSessionsRetrieve.mockResolvedValue({
        mode: 'payment', // Not subscription
      });

      // Should not throw
      const rawBody = JSON.stringify({ test: 'data' });
      const signature = 'valid_signature';

      await subscriptionWebhookController(rawBody, signature, context);

      expect(mockWebhooksConstructEvent).toHaveBeenCalledWith(
        rawBody,
        signature,
        'whsec_test_mock', // cspell:disable-line
      );
    });
  });

  describe('Event Handling', () => {
    it('should handle checkout.session.completed event', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      const mockEvent = mockStripeWebhookEvent('checkout.session.completed', {
        id: 'cs_test_456',
      });

      mockWebhooksConstructEvent.mockReturnValue(mockEvent);
      mockCheckoutSessionsRetrieve.mockResolvedValue({
        mode: 'payment', // Not subscription, should skip
      });

      await subscriptionWebhookController('raw body', 'sig', context);

      expect(mockCheckoutSessionsRetrieve).toHaveBeenCalled();
    });

    it('should handle customer.subscription.updated event', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      const mockEvent = mockStripeWebhookEvent(
        'customer.subscription.updated',
        {
          id: 'sub_test_789',
          customer: 'cus_test',
        },
      );

      mockWebhooksConstructEvent.mockReturnValue(mockEvent);
      mockSubscriptionsRetrieve.mockResolvedValue({
        id: 'sub_test_789',
        customer: {
          id: 'cus_test',
          metadata: {},
        },
      });

      await subscriptionWebhookController('raw body', 'sig', context);

      expect(mockWebhooksConstructEvent).toHaveBeenCalled();
    });

    it('should handle product.updated event', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      const mockEvent = mockStripeWebhookEvent('product.updated', {
        id: 'prod_test_123',
      });

      mockWebhooksConstructEvent.mockReturnValue(mockEvent);

      await subscriptionWebhookController('raw body', 'sig', context);

      expect(mockWebhooksConstructEvent).toHaveBeenCalled();
    });

    it('should handle price.created event', async () => {
      const { user, organization, member } =
        await createTestUserWithOrganization();
      const context = createAuthenticatedContext(user, organization, member);

      const mockEvent = mockStripeWebhookEvent('price.created', {
        id: 'price_test_456',
      });

      mockWebhooksConstructEvent.mockReturnValue(mockEvent);

      await subscriptionWebhookController('raw body', 'sig', context);

      expect(mockWebhooksConstructEvent).toHaveBeenCalled();
    });
  });
});
