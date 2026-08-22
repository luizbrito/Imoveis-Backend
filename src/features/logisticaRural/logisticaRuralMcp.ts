import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { logisticaRuralFindManyMcpTool } from './controllers/logisticaRuralFindManyController';
import { logisticaRuralFindMcpTool } from './controllers/logisticaRuralFindController';
import { logisticaRuralCreateMcpTool } from './controllers/logisticaRuralCreateController';
import { logisticaRuralUpdateMcpTool } from './controllers/logisticaRuralUpdateController';
import { logisticaRuralDeleteManyMcpTool } from './controllers/logisticaRuralDeleteManyController';
import { logisticaRuralArchiveManyMcpTool } from './controllers/logisticaRuralArchiveManyController';
import { logisticaRuralRestoreManyMcpTool } from './controllers/logisticaRuralRestoreManyController';
import { logisticaRuralAutocompleteMcpTool } from './controllers/logisticaRuralAutocompleteController';

export function getLogisticaRuralMcpTools(dictionary: Dictionary): McpTool[] {
  return [
    logisticaRuralFindManyMcpTool(dictionary),
    logisticaRuralFindMcpTool(dictionary),
    logisticaRuralCreateMcpTool(dictionary),
    logisticaRuralUpdateMcpTool(dictionary),
    logisticaRuralDeleteManyMcpTool(dictionary),
    logisticaRuralArchiveManyMcpTool(dictionary),
    logisticaRuralRestoreManyMcpTool(dictionary),
    logisticaRuralAutocompleteMcpTool(dictionary),
  ];
}
