import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { fornecedorFindManyMcpTool } from './controllers/fornecedorFindManyController';
import { fornecedorFindMcpTool } from './controllers/fornecedorFindController';
import { fornecedorCreateMcpTool } from './controllers/fornecedorCreateController';
import { fornecedorUpdateMcpTool } from './controllers/fornecedorUpdateController';
import { fornecedorDeleteManyMcpTool } from './controllers/fornecedorDeleteManyController';
import { fornecedorArchiveManyMcpTool } from './controllers/fornecedorArchiveManyController';
import { fornecedorRestoreManyMcpTool } from './controllers/fornecedorRestoreManyController';
import { fornecedorAutocompleteMcpTool } from './controllers/fornecedorAutocompleteController';

export function getFornecedorMcpTools(dictionary: Dictionary): McpTool[] {
  return [
    fornecedorFindManyMcpTool(dictionary),
    fornecedorFindMcpTool(dictionary),
    fornecedorCreateMcpTool(dictionary),
    fornecedorUpdateMcpTool(dictionary),
    fornecedorDeleteManyMcpTool(dictionary),
    fornecedorArchiveManyMcpTool(dictionary),
    fornecedorRestoreManyMcpTool(dictionary),
    fornecedorAutocompleteMcpTool(dictionary),
  ];
}
