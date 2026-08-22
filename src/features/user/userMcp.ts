import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { userMeMcpTool } from './controllers/userMeController';

export function getUserMcpTools(dictionary: Dictionary): McpTool[] {
  return [userMeMcpTool(dictionary)];
}
