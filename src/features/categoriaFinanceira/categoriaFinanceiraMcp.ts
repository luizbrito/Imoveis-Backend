import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { categoriaFinanceiraFindManyMcpTool } from './controllers/categoriaFinanceiraFindManyController';
import { categoriaFinanceiraFindMcpTool } from './controllers/categoriaFinanceiraFindController';
import { categoriaFinanceiraCreateMcpTool } from './controllers/categoriaFinanceiraCreateController';
import { categoriaFinanceiraUpdateMcpTool } from './controllers/categoriaFinanceiraUpdateController';
import { categoriaFinanceiraDeleteManyMcpTool } from './controllers/categoriaFinanceiraDeleteManyController';
import { categoriaFinanceiraArchiveManyMcpTool } from './controllers/categoriaFinanceiraArchiveManyController';
import { categoriaFinanceiraRestoreManyMcpTool } from './controllers/categoriaFinanceiraRestoreManyController';
import { categoriaFinanceiraAutocompleteMcpTool } from './controllers/categoriaFinanceiraAutocompleteController';

export function getCategoriaFinanceiraMcpTools(
  dictionary: Dictionary,
): McpTool[] {
  return [
    categoriaFinanceiraFindManyMcpTool(dictionary),
    categoriaFinanceiraFindMcpTool(dictionary),
    categoriaFinanceiraCreateMcpTool(dictionary),
    categoriaFinanceiraUpdateMcpTool(dictionary),
    categoriaFinanceiraDeleteManyMcpTool(dictionary),
    categoriaFinanceiraArchiveManyMcpTool(dictionary),
    categoriaFinanceiraRestoreManyMcpTool(dictionary),
    categoriaFinanceiraAutocompleteMcpTool(dictionary),
  ];
}
