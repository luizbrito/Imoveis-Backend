import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { recursoHidricoRuralFindManyMcpTool } from './controllers/recursoHidricoRuralFindManyController';
import { recursoHidricoRuralFindMcpTool } from './controllers/recursoHidricoRuralFindController';
import { recursoHidricoRuralCreateMcpTool } from './controllers/recursoHidricoRuralCreateController';
import { recursoHidricoRuralUpdateMcpTool } from './controllers/recursoHidricoRuralUpdateController';
import { recursoHidricoRuralDeleteManyMcpTool } from './controllers/recursoHidricoRuralDeleteManyController';
import { recursoHidricoRuralArchiveManyMcpTool } from './controllers/recursoHidricoRuralArchiveManyController';
import { recursoHidricoRuralRestoreManyMcpTool } from './controllers/recursoHidricoRuralRestoreManyController';
import { recursoHidricoRuralAutocompleteMcpTool } from './controllers/recursoHidricoRuralAutocompleteController';

export function getRecursoHidricoRuralMcpTools(
  dictionary: Dictionary,
): McpTool[] {
  return [
    recursoHidricoRuralFindManyMcpTool(dictionary),
    recursoHidricoRuralFindMcpTool(dictionary),
    recursoHidricoRuralCreateMcpTool(dictionary),
    recursoHidricoRuralUpdateMcpTool(dictionary),
    recursoHidricoRuralDeleteManyMcpTool(dictionary),
    recursoHidricoRuralArchiveManyMcpTool(dictionary),
    recursoHidricoRuralRestoreManyMcpTool(dictionary),
    recursoHidricoRuralAutocompleteMcpTool(dictionary),
  ];
}
