import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { topografiaRuralFindManyMcpTool } from './controllers/topografiaRuralFindManyController';
import { topografiaRuralFindMcpTool } from './controllers/topografiaRuralFindController';
import { topografiaRuralCreateMcpTool } from './controllers/topografiaRuralCreateController';
import { topografiaRuralUpdateMcpTool } from './controllers/topografiaRuralUpdateController';
import { topografiaRuralDeleteManyMcpTool } from './controllers/topografiaRuralDeleteManyController';
import { topografiaRuralArchiveManyMcpTool } from './controllers/topografiaRuralArchiveManyController';
import { topografiaRuralRestoreManyMcpTool } from './controllers/topografiaRuralRestoreManyController';
import { topografiaRuralAutocompleteMcpTool } from './controllers/topografiaRuralAutocompleteController';

export function getTopografiaRuralMcpTools(dictionary: Dictionary): McpTool[] {
  return [
    topografiaRuralFindManyMcpTool(dictionary),
    topografiaRuralFindMcpTool(dictionary),
    topografiaRuralCreateMcpTool(dictionary),
    topografiaRuralUpdateMcpTool(dictionary),
    topografiaRuralDeleteManyMcpTool(dictionary),
    topografiaRuralArchiveManyMcpTool(dictionary),
    topografiaRuralRestoreManyMcpTool(dictionary),
    topografiaRuralAutocompleteMcpTool(dictionary),
  ];
}
