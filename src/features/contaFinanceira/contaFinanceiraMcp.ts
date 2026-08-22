import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { contaFinanceiraFindManyMcpTool } from './controllers/contaFinanceiraFindManyController';
import { contaFinanceiraFindMcpTool } from './controllers/contaFinanceiraFindController';
import { contaFinanceiraCreateMcpTool } from './controllers/contaFinanceiraCreateController';
import { contaFinanceiraUpdateMcpTool } from './controllers/contaFinanceiraUpdateController';
import { contaFinanceiraDeleteManyMcpTool } from './controllers/contaFinanceiraDeleteManyController';
import { contaFinanceiraArchiveManyMcpTool } from './controllers/contaFinanceiraArchiveManyController';
import { contaFinanceiraRestoreManyMcpTool } from './controllers/contaFinanceiraRestoreManyController';
import { contaFinanceiraAutocompleteMcpTool } from './controllers/contaFinanceiraAutocompleteController';

export function getContaFinanceiraMcpTools(dictionary: Dictionary): McpTool[] {
  return [
    contaFinanceiraFindManyMcpTool(dictionary),
    contaFinanceiraFindMcpTool(dictionary),
    contaFinanceiraCreateMcpTool(dictionary),
    contaFinanceiraUpdateMcpTool(dictionary),
    contaFinanceiraDeleteManyMcpTool(dictionary),
    contaFinanceiraArchiveManyMcpTool(dictionary),
    contaFinanceiraRestoreManyMcpTool(dictionary),
    contaFinanceiraAutocompleteMcpTool(dictionary),
  ];
}
