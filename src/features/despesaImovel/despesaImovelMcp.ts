import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { despesaImovelFindManyMcpTool } from './controllers/despesaImovelFindManyController';
import { despesaImovelFindMcpTool } from './controllers/despesaImovelFindController';
import { despesaImovelCreateMcpTool } from './controllers/despesaImovelCreateController';
import { despesaImovelUpdateMcpTool } from './controllers/despesaImovelUpdateController';
import { despesaImovelDeleteManyMcpTool } from './controllers/despesaImovelDeleteManyController';
import { despesaImovelArchiveManyMcpTool } from './controllers/despesaImovelArchiveManyController';
import { despesaImovelRestoreManyMcpTool } from './controllers/despesaImovelRestoreManyController';
import { despesaImovelAutocompleteMcpTool } from './controllers/despesaImovelAutocompleteController';

export function getDespesaImovelMcpTools(dictionary: Dictionary): McpTool[] {
  return [
    despesaImovelFindManyMcpTool(dictionary),
    despesaImovelFindMcpTool(dictionary),
    despesaImovelCreateMcpTool(dictionary),
    despesaImovelUpdateMcpTool(dictionary),
    despesaImovelDeleteManyMcpTool(dictionary),
    despesaImovelArchiveManyMcpTool(dictionary),
    despesaImovelRestoreManyMcpTool(dictionary),
    despesaImovelAutocompleteMcpTool(dictionary),
  ];
}
