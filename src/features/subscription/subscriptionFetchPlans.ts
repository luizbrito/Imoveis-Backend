import Stripe from 'stripe';
import {
  redisConnection,
  isRedisAvailable,
} from '../../shared/lib/redisConnection';
import { env } from '../../env';

export interface SubscriptionPlan {
  stripePriceId: string;
  name: string;
  description: string | null;
  currency: string;
  unitAmount: number;
  interval: 'day' | 'week' | 'month' | 'year';
  intervalCount: number;
  marketingFeatures: Array<{ name: string }>;
  unitLabel: string | null;
  active: boolean;
}

const REDIS_KEY = 'stripe:subscription:plans';
const CACHE_TTL = 300;

// Fetches all plans (active and inactive) from Stripe with Redis caching
// Plan is active only if both product AND price are active
// Frontend filters archived plans unless user has active subscription for that price
export async function fetchStripePlans(): Promise<SubscriptionPlan[]> {
  if (!env.STRIPE_SECRET_KEY) {
    return [];
  }

  if (await isRedisAvailable()) {
    try {
      const cached = await redisConnection.get(REDIS_KEY);
      if (cached) {
        return JSON.parse(cached) as SubscriptionPlan[];
      }
    } catch (error) {
      console.error('Redis cache read error:', error);
    }
  }

  const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-04-22.dahlia',
  });

  try {
    const prices = await stripe.prices.list({
      type: 'recurring',
      expand: ['data.product'],
      limit: 100,
    });

    const plans: SubscriptionPlan[] = prices.data
      .filter((price) => price.product && typeof price.product === 'object')
      .map((price) => {
        const product = price.product as Stripe.Product;
        return {
          stripePriceId: price.id,
          name: product.name,
          description: product.description || null,
          currency: price.currency,
          unitAmount: price.unit_amount || 0,
          interval: price.recurring!.interval,
          intervalCount: price.recurring!.interval_count,
          marketingFeatures:
            product.marketing_features
              ?.filter((f) => f.name)
              .map((f) => ({ name: f.name! })) || [],
          unitLabel: product.unit_label || null,
          active: product.active && price.active,
        };
      });

    if (await isRedisAvailable()) {
      try {
        await redisConnection.setex(
          REDIS_KEY,
          CACHE_TTL,
          JSON.stringify(plans),
        );
      } catch (error) {
        console.error('Redis cache write error:', error);
      }
    }

    return plans;
  } catch (error) {
    console.error('Error fetching Stripe plans:', error);
    return [];
  }
}

export async function invalidateStripePlansCache(): Promise<void> {
  if (await isRedisAvailable()) {
    try {
      await redisConnection.del(REDIS_KEY);
    } catch (error) {
      console.error('Redis cache invalidation error:', error);
    }
  }
}
