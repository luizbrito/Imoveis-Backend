import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { benfeitoriaRuralFindManyMcpTool } from './controllers/benfeitoriaRuralFindManyController';
import { benfeitoriaRuralFindMcpTool } from './controllers/benfeitoriaRuralFindController';
import { benfeitoriaRuralCreateMcpTool } from './controllers/benfeitoriaRuralCreateController';
import { benfeitoriaRuralUpdateMcpTool } from './controllers/benfeitoriaRuralUpdateController';
import { benfeitoriaRuralDeleteManyMcpTool } from './controllers/benfeitoriaRuralDeleteManyController';
import { benfeitoriaRuralArchiveManyMcpTool } from './controllers/benfeitoriaRuralArchiveManyController';
import { benfeitoriaRuralRestoreManyMcpTool } from './controllers/benfeitoriaRuralRestoreManyController';
import { benfeitoriaRuralAutocompleteMcpTool } from './controllers/benfeitoriaRuralAutocompleteController';

export function getBenfeitoriaRuralMcpTools(dictionary: Dictionary): McpTool[] {
  return [
    benfeitoriaRuralFindManyMcpTool(dictionary),
    benfeitoriaRuralFindMcpTool(dictionary),
    benfeitoriaRuralCreateMcpTool(dictionary),
    benfeitoriaRuralUpdateMcpTool(dictionary),
    benfeitoriaRuralDeleteManyMcpTool(dictionary),
    benfeitoriaRuralArchiveManyMcpTool(dictionary),
    benfeitoriaRuralRestoreManyMcpTool(dictionary),
    benfeitoriaRuralAutocompleteMcpTool(dictionary),
  ];
}
