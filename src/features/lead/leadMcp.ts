import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { leadFindManyMcpTool } from './controllers/leadFindManyController';
import { leadFindMcpTool } from './controllers/leadFindController';
import { leadCreateMcpTool } from './controllers/leadCreateController';
import { leadUpdateMcpTool } from './controllers/leadUpdateController';
import { leadDeleteManyMcpTool } from './controllers/leadDeleteManyController';
import { leadArchiveManyMcpTool } from './controllers/leadArchiveManyController';
import { leadRestoreManyMcpTool } from './controllers/leadRestoreManyController';
import { leadAutocompleteMcpTool } from './controllers/leadAutocompleteController';

export function getLeadMcpTools(dictionary: Dictionary): McpTool[] {
  return [
    leadFindManyMcpTool(dictionary),
    leadFindMcpTool(dictionary),
    leadCreateMcpTool(dictionary),
    leadUpdateMcpTool(dictionary),
    leadDeleteManyMcpTool(dictionary),
    leadArchiveManyMcpTool(dictionary),
    leadRestoreManyMcpTool(dictionary),
    leadAutocompleteMcpTool(dictionary),
  ];
}
