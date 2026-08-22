import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { auditLogActivityChartMcpTool } from './controllers/auditLogActivityChartController';
import { auditLogFindManyMcpTool } from './controllers/auditLogFindManyController';

export function getAuditLogMcpTools(dictionary: Dictionary): McpTool[] {
  return [
    auditLogFindManyMcpTool(dictionary),
    auditLogActivityChartMcpTool(dictionary),
  ];
}
