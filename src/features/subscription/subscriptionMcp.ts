import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { subscriptionCheckoutMcpTool } from './controllers/subscriptionCheckoutController';
import { subscriptionPortalMcpTool } from './controllers/subscriptionPortalController';
import { subscriptionPlansMcpTool } from './controllers/subscriptionPlansController';

export function getSubscriptionMcpTools(dictionary: Dictionary): McpTool[] {
  return [
    subscriptionCheckoutMcpTool(dictionary),
    subscriptionPortalMcpTool(dictionary),
    subscriptionPlansMcpTool(dictionary),
  ];
}
