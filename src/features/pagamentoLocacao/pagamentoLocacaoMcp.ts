import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { pagamentoLocacaoFindManyMcpTool } from './controllers/pagamentoLocacaoFindManyController';
import { pagamentoLocacaoFindMcpTool } from './controllers/pagamentoLocacaoFindController';
import { pagamentoLocacaoCreateMcpTool } from './controllers/pagamentoLocacaoCreateController';
import { pagamentoLocacaoUpdateMcpTool } from './controllers/pagamentoLocacaoUpdateController';
import { pagamentoLocacaoDeleteManyMcpTool } from './controllers/pagamentoLocacaoDeleteManyController';
import { pagamentoLocacaoArchiveManyMcpTool } from './controllers/pagamentoLocacaoArchiveManyController';
import { pagamentoLocacaoRestoreManyMcpTool } from './controllers/pagamentoLocacaoRestoreManyController';
import { pagamentoLocacaoAutocompleteMcpTool } from './controllers/pagamentoLocacaoAutocompleteController';

export function getPagamentoLocacaoMcpTools(dictionary: Dictionary): McpTool[] {
  return [
    pagamentoLocacaoFindManyMcpTool(dictionary),
    pagamentoLocacaoFindMcpTool(dictionary),
    pagamentoLocacaoCreateMcpTool(dictionary),
    pagamentoLocacaoUpdateMcpTool(dictionary),
    pagamentoLocacaoDeleteManyMcpTool(dictionary),
    pagamentoLocacaoArchiveManyMcpTool(dictionary),
    pagamentoLocacaoRestoreManyMcpTool(dictionary),
    pagamentoLocacaoAutocompleteMcpTool(dictionary),
  ];
}
