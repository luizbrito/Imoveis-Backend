import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { sistemaProdutivoRuralFindManyMcpTool } from './controllers/sistemaProdutivoRuralFindManyController';
import { sistemaProdutivoRuralFindMcpTool } from './controllers/sistemaProdutivoRuralFindController';
import { sistemaProdutivoRuralCreateMcpTool } from './controllers/sistemaProdutivoRuralCreateController';
import { sistemaProdutivoRuralUpdateMcpTool } from './controllers/sistemaProdutivoRuralUpdateController';
import { sistemaProdutivoRuralDeleteManyMcpTool } from './controllers/sistemaProdutivoRuralDeleteManyController';
import { sistemaProdutivoRuralArchiveManyMcpTool } from './controllers/sistemaProdutivoRuralArchiveManyController';
import { sistemaProdutivoRuralRestoreManyMcpTool } from './controllers/sistemaProdutivoRuralRestoreManyController';
import { sistemaProdutivoRuralAutocompleteMcpTool } from './controllers/sistemaProdutivoRuralAutocompleteController';

export function getSistemaProdutivoRuralMcpTools(
  dictionary: Dictionary,
): McpTool[] {
  return [
    sistemaProdutivoRuralFindManyMcpTool(dictionary),
    sistemaProdutivoRuralFindMcpTool(dictionary),
    sistemaProdutivoRuralCreateMcpTool(dictionary),
    sistemaProdutivoRuralUpdateMcpTool(dictionary),
    sistemaProdutivoRuralDeleteManyMcpTool(dictionary),
    sistemaProdutivoRuralArchiveManyMcpTool(dictionary),
    sistemaProdutivoRuralRestoreManyMcpTool(dictionary),
    sistemaProdutivoRuralAutocompleteMcpTool(dictionary),
  ];
}
