import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { lancamentoFinanceiroFindManyMcpTool } from './controllers/lancamentoFinanceiroFindManyController';
import { lancamentoFinanceiroFindMcpTool } from './controllers/lancamentoFinanceiroFindController';
import { lancamentoFinanceiroCreateMcpTool } from './controllers/lancamentoFinanceiroCreateController';
import { lancamentoFinanceiroUpdateMcpTool } from './controllers/lancamentoFinanceiroUpdateController';
import { lancamentoFinanceiroDeleteManyMcpTool } from './controllers/lancamentoFinanceiroDeleteManyController';
import { lancamentoFinanceiroArchiveManyMcpTool } from './controllers/lancamentoFinanceiroArchiveManyController';
import { lancamentoFinanceiroRestoreManyMcpTool } from './controllers/lancamentoFinanceiroRestoreManyController';
import { lancamentoFinanceiroAutocompleteMcpTool } from './controllers/lancamentoFinanceiroAutocompleteController';

export function getLancamentoFinanceiroMcpTools(
  dictionary: Dictionary,
): McpTool[] {
  return [
    lancamentoFinanceiroFindManyMcpTool(dictionary),
    lancamentoFinanceiroFindMcpTool(dictionary),
    lancamentoFinanceiroCreateMcpTool(dictionary),
    lancamentoFinanceiroUpdateMcpTool(dictionary),
    lancamentoFinanceiroDeleteManyMcpTool(dictionary),
    lancamentoFinanceiroArchiveManyMcpTool(dictionary),
    lancamentoFinanceiroRestoreManyMcpTool(dictionary),
    lancamentoFinanceiroAutocompleteMcpTool(dictionary),
  ];
}
