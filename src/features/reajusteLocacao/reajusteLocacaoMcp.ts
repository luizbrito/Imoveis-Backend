import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { reajusteLocacaoFindManyMcpTool } from './controllers/reajusteLocacaoFindManyController';
import { reajusteLocacaoFindMcpTool } from './controllers/reajusteLocacaoFindController';
import { reajusteLocacaoCreateMcpTool } from './controllers/reajusteLocacaoCreateController';
import { reajusteLocacaoUpdateMcpTool } from './controllers/reajusteLocacaoUpdateController';
import { reajusteLocacaoDeleteManyMcpTool } from './controllers/reajusteLocacaoDeleteManyController';
import { reajusteLocacaoArchiveManyMcpTool } from './controllers/reajusteLocacaoArchiveManyController';
import { reajusteLocacaoRestoreManyMcpTool } from './controllers/reajusteLocacaoRestoreManyController';
import { reajusteLocacaoAutocompleteMcpTool } from './controllers/reajusteLocacaoAutocompleteController';

export function getReajusteLocacaoMcpTools(dictionary: Dictionary): McpTool[] {
  return [
    reajusteLocacaoFindManyMcpTool(dictionary),
    reajusteLocacaoFindMcpTool(dictionary),
    reajusteLocacaoCreateMcpTool(dictionary),
    reajusteLocacaoUpdateMcpTool(dictionary),
    reajusteLocacaoDeleteManyMcpTool(dictionary),
    reajusteLocacaoArchiveManyMcpTool(dictionary),
    reajusteLocacaoRestoreManyMcpTool(dictionary),
    reajusteLocacaoAutocompleteMcpTool(dictionary),
  ];
}
