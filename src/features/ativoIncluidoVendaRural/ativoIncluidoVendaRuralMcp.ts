import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { ativoIncluidoVendaRuralFindManyMcpTool } from './controllers/ativoIncluidoVendaRuralFindManyController';
import { ativoIncluidoVendaRuralFindMcpTool } from './controllers/ativoIncluidoVendaRuralFindController';
import { ativoIncluidoVendaRuralCreateMcpTool } from './controllers/ativoIncluidoVendaRuralCreateController';
import { ativoIncluidoVendaRuralUpdateMcpTool } from './controllers/ativoIncluidoVendaRuralUpdateController';
import { ativoIncluidoVendaRuralDeleteManyMcpTool } from './controllers/ativoIncluidoVendaRuralDeleteManyController';
import { ativoIncluidoVendaRuralArchiveManyMcpTool } from './controllers/ativoIncluidoVendaRuralArchiveManyController';
import { ativoIncluidoVendaRuralRestoreManyMcpTool } from './controllers/ativoIncluidoVendaRuralRestoreManyController';
import { ativoIncluidoVendaRuralAutocompleteMcpTool } from './controllers/ativoIncluidoVendaRuralAutocompleteController';

export function getAtivoIncluidoVendaRuralMcpTools(
  dictionary: Dictionary,
): McpTool[] {
  return [
    ativoIncluidoVendaRuralFindManyMcpTool(dictionary),
    ativoIncluidoVendaRuralFindMcpTool(dictionary),
    ativoIncluidoVendaRuralCreateMcpTool(dictionary),
    ativoIncluidoVendaRuralUpdateMcpTool(dictionary),
    ativoIncluidoVendaRuralDeleteManyMcpTool(dictionary),
    ativoIncluidoVendaRuralArchiveManyMcpTool(dictionary),
    ativoIncluidoVendaRuralRestoreManyMcpTool(dictionary),
    ativoIncluidoVendaRuralAutocompleteMcpTool(dictionary),
  ];
}
