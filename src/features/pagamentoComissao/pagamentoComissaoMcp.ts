import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { pagamentoComissaoFindManyMcpTool } from './controllers/pagamentoComissaoFindManyController';
import { pagamentoComissaoFindMcpTool } from './controllers/pagamentoComissaoFindController';
import { pagamentoComissaoCreateMcpTool } from './controllers/pagamentoComissaoCreateController';
import { pagamentoComissaoUpdateMcpTool } from './controllers/pagamentoComissaoUpdateController';
import { pagamentoComissaoDeleteManyMcpTool } from './controllers/pagamentoComissaoDeleteManyController';
import { pagamentoComissaoArchiveManyMcpTool } from './controllers/pagamentoComissaoArchiveManyController';
import { pagamentoComissaoRestoreManyMcpTool } from './controllers/pagamentoComissaoRestoreManyController';
import { pagamentoComissaoAutocompleteMcpTool } from './controllers/pagamentoComissaoAutocompleteController';

export function getPagamentoComissaoMcpTools(
  dictionary: Dictionary,
): McpTool[] {
  return [
    pagamentoComissaoFindManyMcpTool(dictionary),
    pagamentoComissaoFindMcpTool(dictionary),
    pagamentoComissaoCreateMcpTool(dictionary),
    pagamentoComissaoUpdateMcpTool(dictionary),
    pagamentoComissaoDeleteManyMcpTool(dictionary),
    pagamentoComissaoArchiveManyMcpTool(dictionary),
    pagamentoComissaoRestoreManyMcpTool(dictionary),
    pagamentoComissaoAutocompleteMcpTool(dictionary),
  ];
}
