import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { referenciaClimaticaRuralFindManyMcpTool } from './controllers/referenciaClimaticaRuralFindManyController';
import { referenciaClimaticaRuralFindMcpTool } from './controllers/referenciaClimaticaRuralFindController';
import { referenciaClimaticaRuralCreateMcpTool } from './controllers/referenciaClimaticaRuralCreateController';
import { referenciaClimaticaRuralUpdateMcpTool } from './controllers/referenciaClimaticaRuralUpdateController';
import { referenciaClimaticaRuralDeleteManyMcpTool } from './controllers/referenciaClimaticaRuralDeleteManyController';
import { referenciaClimaticaRuralArchiveManyMcpTool } from './controllers/referenciaClimaticaRuralArchiveManyController';
import { referenciaClimaticaRuralRestoreManyMcpTool } from './controllers/referenciaClimaticaRuralRestoreManyController';
import { referenciaClimaticaRuralAutocompleteMcpTool } from './controllers/referenciaClimaticaRuralAutocompleteController';

export function getReferenciaClimaticaRuralMcpTools(
  dictionary: Dictionary,
): McpTool[] {
  return [
    referenciaClimaticaRuralFindManyMcpTool(dictionary),
    referenciaClimaticaRuralFindMcpTool(dictionary),
    referenciaClimaticaRuralCreateMcpTool(dictionary),
    referenciaClimaticaRuralUpdateMcpTool(dictionary),
    referenciaClimaticaRuralDeleteManyMcpTool(dictionary),
    referenciaClimaticaRuralArchiveManyMcpTool(dictionary),
    referenciaClimaticaRuralRestoreManyMcpTool(dictionary),
    referenciaClimaticaRuralAutocompleteMcpTool(dictionary),
  ];
}
