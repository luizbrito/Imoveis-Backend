import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { producaoHistoricaRuralFindManyMcpTool } from './controllers/producaoHistoricaRuralFindManyController';
import { producaoHistoricaRuralFindMcpTool } from './controllers/producaoHistoricaRuralFindController';
import { producaoHistoricaRuralCreateMcpTool } from './controllers/producaoHistoricaRuralCreateController';
import { producaoHistoricaRuralUpdateMcpTool } from './controllers/producaoHistoricaRuralUpdateController';
import { producaoHistoricaRuralDeleteManyMcpTool } from './controllers/producaoHistoricaRuralDeleteManyController';
import { producaoHistoricaRuralArchiveManyMcpTool } from './controllers/producaoHistoricaRuralArchiveManyController';
import { producaoHistoricaRuralRestoreManyMcpTool } from './controllers/producaoHistoricaRuralRestoreManyController';
import { producaoHistoricaRuralAutocompleteMcpTool } from './controllers/producaoHistoricaRuralAutocompleteController';

export function getProducaoHistoricaRuralMcpTools(
  dictionary: Dictionary,
): McpTool[] {
  return [
    producaoHistoricaRuralFindManyMcpTool(dictionary),
    producaoHistoricaRuralFindMcpTool(dictionary),
    producaoHistoricaRuralCreateMcpTool(dictionary),
    producaoHistoricaRuralUpdateMcpTool(dictionary),
    producaoHistoricaRuralDeleteManyMcpTool(dictionary),
    producaoHistoricaRuralArchiveManyMcpTool(dictionary),
    producaoHistoricaRuralRestoreManyMcpTool(dictionary),
    producaoHistoricaRuralAutocompleteMcpTool(dictionary),
  ];
}
