import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { divisaoOperacionalRuralFindManyMcpTool } from './controllers/divisaoOperacionalRuralFindManyController';
import { divisaoOperacionalRuralFindMcpTool } from './controllers/divisaoOperacionalRuralFindController';
import { divisaoOperacionalRuralCreateMcpTool } from './controllers/divisaoOperacionalRuralCreateController';
import { divisaoOperacionalRuralUpdateMcpTool } from './controllers/divisaoOperacionalRuralUpdateController';
import { divisaoOperacionalRuralDeleteManyMcpTool } from './controllers/divisaoOperacionalRuralDeleteManyController';
import { divisaoOperacionalRuralArchiveManyMcpTool } from './controllers/divisaoOperacionalRuralArchiveManyController';
import { divisaoOperacionalRuralRestoreManyMcpTool } from './controllers/divisaoOperacionalRuralRestoreManyController';
import { divisaoOperacionalRuralAutocompleteMcpTool } from './controllers/divisaoOperacionalRuralAutocompleteController';

export function getDivisaoOperacionalRuralMcpTools(
  dictionary: Dictionary,
): McpTool[] {
  return [
    divisaoOperacionalRuralFindManyMcpTool(dictionary),
    divisaoOperacionalRuralFindMcpTool(dictionary),
    divisaoOperacionalRuralCreateMcpTool(dictionary),
    divisaoOperacionalRuralUpdateMcpTool(dictionary),
    divisaoOperacionalRuralDeleteManyMcpTool(dictionary),
    divisaoOperacionalRuralArchiveManyMcpTool(dictionary),
    divisaoOperacionalRuralRestoreManyMcpTool(dictionary),
    divisaoOperacionalRuralAutocompleteMcpTool(dictionary),
  ];
}
