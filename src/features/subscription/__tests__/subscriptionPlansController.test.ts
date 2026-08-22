import { describe, it, expect, beforeEach, vi } from 'vitest';
import { testPrismaClient } from '../../../test/testPrismaClient';
import { createTestUserWithOrganization } from '../../../test/testFactories';
import { createAuthenticatedContext } from '../../../test/testUtils';
import { subscriptionPlansController } from '../controllers/subscriptionPlansController';

// Mock subscription helpers
vi.mock('../subscriptionFetchPlans', () => ({
  fetchStripePlans: vi.fn(),
}));

import { fetchStripePlans } from '../subscriptionFetchPlans';

describe('SubscriptionPlansController', () => {
  let prisma: ReturnType<typeof testPrismaClient>;

  beforeEach(() => {
    prisma = testPrismaClient();
    vi.clearAllMocks();
  });

  it('should return subscription plans', async () => {
    const { user, organization, member } =
      await createTestUserWithOrganization();
    const context = createAuthenticatedContext(user, organization, member);

    const mockPlans = [
      {
        id: 'price_basic',
        product: {
          id: 'prod_basic',
          name: 'Basic Plan',
        },
        unit_amount: 999,
        currency: 'usd',
        recurring: {
          interval: 'month',
        },
      },
      {
        id: 'price_pro',
        product: {
          id: 'prod_pro',
          name: 'Pro Plan',
        },
        unit_amount: 1999,
        currency: 'usd',
        recurring: {
          interval: 'month',
        },
      },
    ];

    vi.mocked(fetchStripePlans).mockResolvedValue(mockPlans as any);

    const result = await subscriptionPlansController(context);

    expect(result).toBeDefined();
    expect(result.plans).toBeDefined();
    expect(Array.isArray(result.plans)).toBe(true);
    expect(result.plans.length).toBe(2);
  });

  it('should return empty array when no plans configured', async () => {
    const { user, organization, member } =
      await createTestUserWithOrganization();
    const context = createAuthenticatedContext(user, organization, member);

    vi.mocked(fetchStripePlans).mockResolvedValue([]);

    const result = await subscriptionPlansController(context);

    expect(result.plans).toEqual([]);
  });

  it('should work for unauthenticated users (public endpoint)', async () => {
    const context = {
      currentUser: null,
      headers: new Headers(),
    } as any;

    const mockPlans = [
      {
        id: 'price_public',
        product: {
          id: 'prod_public',
          name: 'Public Plan',
        },
        unit_amount: 999,
        currency: 'usd',
        recurring: {
          interval: 'month',
        },
      },
    ];

    vi.mocked(fetchStripePlans).mockResolvedValue(mockPlans as any);

    const result = await subscriptionPlansController(context);

    expect(result.plans).toBeDefined();
    expect(result.plans.length).toBe(1);
  });
});
