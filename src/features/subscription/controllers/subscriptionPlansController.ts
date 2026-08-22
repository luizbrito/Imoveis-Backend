import { z } from 'zod';
import { AppContext } from '../../../shared/controller/appContext';
import { RouteConfig } from '../../../shared/openapi/routeToPath';
import { subscriptionPlansOutputSchema } from '../subscriptionSchemas';
import { McpTool } from '../../mcp/mcpTypes';
import { toMcpJsonSchema } from '../../mcp/mcpSchemaConverter';
import { Dictionary } from '../../../translation/locales';
import { fetchStripePlans } from '../subscriptionFetchPlans';

export const subscriptionPlansApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/subscription/plans',
  response: subscriptionPlansOutputSchema,
};

export const subscriptionPlansMcpTool = (dictionary: Dictionary): McpTool => ({
  name: 'subscription_plans',
  description: dictionary.subscription.mcpDescription.plans,
  requiredPermissions: {},
  schema: toMcpJsonSchema(z.object({})),
  handler: async (params, context) => {
    return await subscriptionPlansController(context);
  },
});

export async function subscriptionPlansController(
  context: AppContext,
): Promise<z.output<typeof subscriptionPlansOutputSchema>> {
  const plans = await fetchStripePlans();
  return { plans };
}
