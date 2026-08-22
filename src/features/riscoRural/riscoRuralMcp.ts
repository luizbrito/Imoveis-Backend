import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { riscoRuralFindManyMcpTool } from './controllers/riscoRuralFindManyController';
import { riscoRuralFindMcpTool } from './controllers/riscoRuralFindController';
import { riscoRuralCreateMcpTool } from './controllers/riscoRuralCreateController';
import { riscoRuralUpdateMcpTool } from './controllers/riscoRuralUpdateController';
import { riscoRuralDeleteManyMcpTool } from './controllers/riscoRuralDeleteManyController';
import { riscoRuralArchiveManyMcpTool } from './controllers/riscoRuralArchiveManyController';
import { riscoRuralRestoreManyMcpTool } from './controllers/riscoRuralRestoreManyController';
import { riscoRuralAutocompleteMcpTool } from './controllers/riscoRuralAutocompleteController';

export function getRiscoRuralMcpTools(dictionary: Dictionary): McpTool[] {
  return [
    riscoRuralFindManyMcpTool(dictionary),
    riscoRuralFindMcpTool(dictionary),
    riscoRuralCreateMcpTool(dictionary),
    riscoRuralUpdateMcpTool(dictionary),
    riscoRuralDeleteManyMcpTool(dictionary),
    riscoRuralArchiveManyMcpTool(dictionary),
    riscoRuralRestoreManyMcpTool(dictionary),
    riscoRuralAutocompleteMcpTool(dictionary),
  ];
}
