import Stripe from 'stripe';
import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { Error400 } from '../../../shared/errors/Error400';
import { Error403 } from '../../../shared/errors/Error403';
import { getFrontendUrl } from '../../../shared/lib/getFrontendUrl';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { authGuardBackend } from '../../auth/authGuardBackend';
import { subscriptionPortalOutputSchema } from '../subscriptionSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { env } from '../../../env';

export const subscriptionPortalApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/subscription/portal',
  response: subscriptionPortalOutputSchema,
};

export const subscriptionPortalMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'subscription_portal',
  description: dictionary.subscription.mcpDescription.portal,
  requiredPermissions: { subscription: ['create'] },
  schema: toMcpJsonSchema(z.object({})),
  handler: async (params, context) => {
    return await subscriptionPortalController(context);
  },
});

export async function subscriptionPortalController(
  context: AppContext,
): Promise<z.output<typeof subscriptionPortalOutputSchema>> {
  await authGuardBackend(
    {
      subscription: ['create'],
    },
    context,
  );

  if (!context.currentSubscription) {
    throw new Error403();
  }

  if (!env.STRIPE_SECRET_KEY) {
    throw new Error400(
      context.dictionary.subscription.errors.stripeNotConfigured,
    );
  }

  const isSubscriptionUser =
    context.currentUser?.id === context.currentSubscription.userId;
  if (!isSubscriptionUser) {
    throw new Error403();
  }

  const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-04-22.dahlia',
  });

  const frontendUrl = getFrontendUrl(context.currentOrganization?.slug);

  const session = await stripe.billingPortal.sessions.create({
    customer: context.currentSubscription.stripeCustomerId,
    return_url: `${frontendUrl}/subscription`,
  });

  return { url: session.url };
}
