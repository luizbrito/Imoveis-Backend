import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { dueDiligenceRuralFindManyMcpTool } from './controllers/dueDiligenceRuralFindManyController';
import { dueDiligenceRuralFindMcpTool } from './controllers/dueDiligenceRuralFindController';
import { dueDiligenceRuralCreateMcpTool } from './controllers/dueDiligenceRuralCreateController';
import { dueDiligenceRuralUpdateMcpTool } from './controllers/dueDiligenceRuralUpdateController';
import { dueDiligenceRuralDeleteManyMcpTool } from './controllers/dueDiligenceRuralDeleteManyController';
import { dueDiligenceRuralArchiveManyMcpTool } from './controllers/dueDiligenceRuralArchiveManyController';
import { dueDiligenceRuralRestoreManyMcpTool } from './controllers/dueDiligenceRuralRestoreManyController';
import { dueDiligenceRuralAutocompleteMcpTool } from './controllers/dueDiligenceRuralAutocompleteController';

export function getDueDiligenceRuralMcpTools(
  dictionary: Dictionary,
): McpTool[] {
  return [
    dueDiligenceRuralFindManyMcpTool(dictionary),
    dueDiligenceRuralFindMcpTool(dictionary),
    dueDiligenceRuralCreateMcpTool(dictionary),
    dueDiligenceRuralUpdateMcpTool(dictionary),
    dueDiligenceRuralDeleteManyMcpTool(dictionary),
    dueDiligenceRuralArchiveManyMcpTool(dictionary),
    dueDiligenceRuralRestoreManyMcpTool(dictionary),
    dueDiligenceRuralAutocompleteMcpTool(dictionary),
  ];
}
