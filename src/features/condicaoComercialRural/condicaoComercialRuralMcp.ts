import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { condicaoComercialRuralFindManyMcpTool } from './controllers/condicaoComercialRuralFindManyController';
import { condicaoComercialRuralFindMcpTool } from './controllers/condicaoComercialRuralFindController';
import { condicaoComercialRuralCreateMcpTool } from './controllers/condicaoComercialRuralCreateController';
import { condicaoComercialRuralUpdateMcpTool } from './controllers/condicaoComercialRuralUpdateController';
import { condicaoComercialRuralDeleteManyMcpTool } from './controllers/condicaoComercialRuralDeleteManyController';
import { condicaoComercialRuralArchiveManyMcpTool } from './controllers/condicaoComercialRuralArchiveManyController';
import { condicaoComercialRuralRestoreManyMcpTool } from './controllers/condicaoComercialRuralRestoreManyController';
import { condicaoComercialRuralAutocompleteMcpTool } from './controllers/condicaoComercialRuralAutocompleteController';

export function getCondicaoComercialRuralMcpTools(
  dictionary: Dictionary,
): McpTool[] {
  return [
    condicaoComercialRuralFindManyMcpTool(dictionary),
    condicaoComercialRuralFindMcpTool(dictionary),
    condicaoComercialRuralCreateMcpTool(dictionary),
    condicaoComercialRuralUpdateMcpTool(dictionary),
    condicaoComercialRuralDeleteManyMcpTool(dictionary),
    condicaoComercialRuralArchiveManyMcpTool(dictionary),
    condicaoComercialRuralRestoreManyMcpTool(dictionary),
    condicaoComercialRuralAutocompleteMcpTool(dictionary),
  ];
}
