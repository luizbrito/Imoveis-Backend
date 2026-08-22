import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { soloImovelRuralFindManyMcpTool } from './controllers/soloImovelRuralFindManyController';
import { soloImovelRuralFindMcpTool } from './controllers/soloImovelRuralFindController';
import { soloImovelRuralCreateMcpTool } from './controllers/soloImovelRuralCreateController';
import { soloImovelRuralUpdateMcpTool } from './controllers/soloImovelRuralUpdateController';
import { soloImovelRuralDeleteManyMcpTool } from './controllers/soloImovelRuralDeleteManyController';
import { soloImovelRuralArchiveManyMcpTool } from './controllers/soloImovelRuralArchiveManyController';
import { soloImovelRuralRestoreManyMcpTool } from './controllers/soloImovelRuralRestoreManyController';
import { soloImovelRuralAutocompleteMcpTool } from './controllers/soloImovelRuralAutocompleteController';

export function getSoloImovelRuralMcpTools(dictionary: Dictionary): McpTool[] {
  return [
    soloImovelRuralFindManyMcpTool(dictionary),
    soloImovelRuralFindMcpTool(dictionary),
    soloImovelRuralCreateMcpTool(dictionary),
    soloImovelRuralUpdateMcpTool(dictionary),
    soloImovelRuralDeleteManyMcpTool(dictionary),
    soloImovelRuralArchiveManyMcpTool(dictionary),
    soloImovelRuralRestoreManyMcpTool(dictionary),
    soloImovelRuralAutocompleteMcpTool(dictionary),
  ];
}
