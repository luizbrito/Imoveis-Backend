import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { pistaAviacaoRuralFindManyMcpTool } from './controllers/pistaAviacaoRuralFindManyController';
import { pistaAviacaoRuralFindMcpTool } from './controllers/pistaAviacaoRuralFindController';
import { pistaAviacaoRuralCreateMcpTool } from './controllers/pistaAviacaoRuralCreateController';
import { pistaAviacaoRuralUpdateMcpTool } from './controllers/pistaAviacaoRuralUpdateController';
import { pistaAviacaoRuralDeleteManyMcpTool } from './controllers/pistaAviacaoRuralDeleteManyController';
import { pistaAviacaoRuralArchiveManyMcpTool } from './controllers/pistaAviacaoRuralArchiveManyController';
import { pistaAviacaoRuralRestoreManyMcpTool } from './controllers/pistaAviacaoRuralRestoreManyController';
import { pistaAviacaoRuralAutocompleteMcpTool } from './controllers/pistaAviacaoRuralAutocompleteController';

export function getPistaAviacaoRuralMcpTools(
  dictionary: Dictionary,
): McpTool[] {
  return [
    pistaAviacaoRuralFindManyMcpTool(dictionary),
    pistaAviacaoRuralFindMcpTool(dictionary),
    pistaAviacaoRuralCreateMcpTool(dictionary),
    pistaAviacaoRuralUpdateMcpTool(dictionary),
    pistaAviacaoRuralDeleteManyMcpTool(dictionary),
    pistaAviacaoRuralArchiveManyMcpTool(dictionary),
    pistaAviacaoRuralRestoreManyMcpTool(dictionary),
    pistaAviacaoRuralAutocompleteMcpTool(dictionary),
  ];
}
