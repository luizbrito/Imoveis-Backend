import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { restricaoTerritorialRuralFindManyMcpTool } from './controllers/restricaoTerritorialRuralFindManyController';
import { restricaoTerritorialRuralFindMcpTool } from './controllers/restricaoTerritorialRuralFindController';
import { restricaoTerritorialRuralCreateMcpTool } from './controllers/restricaoTerritorialRuralCreateController';
import { restricaoTerritorialRuralUpdateMcpTool } from './controllers/restricaoTerritorialRuralUpdateController';
import { restricaoTerritorialRuralDeleteManyMcpTool } from './controllers/restricaoTerritorialRuralDeleteManyController';
import { restricaoTerritorialRuralArchiveManyMcpTool } from './controllers/restricaoTerritorialRuralArchiveManyController';
import { restricaoTerritorialRuralRestoreManyMcpTool } from './controllers/restricaoTerritorialRuralRestoreManyController';
import { restricaoTerritorialRuralAutocompleteMcpTool } from './controllers/restricaoTerritorialRuralAutocompleteController';

export function getRestricaoTerritorialRuralMcpTools(
  dictionary: Dictionary,
): McpTool[] {
  return [
    restricaoTerritorialRuralFindManyMcpTool(dictionary),
    restricaoTerritorialRuralFindMcpTool(dictionary),
    restricaoTerritorialRuralCreateMcpTool(dictionary),
    restricaoTerritorialRuralUpdateMcpTool(dictionary),
    restricaoTerritorialRuralDeleteManyMcpTool(dictionary),
    restricaoTerritorialRuralArchiveManyMcpTool(dictionary),
    restricaoTerritorialRuralRestoreManyMcpTool(dictionary),
    restricaoTerritorialRuralAutocompleteMcpTool(dictionary),
  ];
}
