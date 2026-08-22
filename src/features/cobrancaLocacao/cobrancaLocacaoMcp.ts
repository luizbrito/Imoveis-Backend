import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { cobrancaLocacaoFindManyMcpTool } from './controllers/cobrancaLocacaoFindManyController';
import { cobrancaLocacaoFindMcpTool } from './controllers/cobrancaLocacaoFindController';
import { cobrancaLocacaoCreateMcpTool } from './controllers/cobrancaLocacaoCreateController';
import { cobrancaLocacaoUpdateMcpTool } from './controllers/cobrancaLocacaoUpdateController';
import { cobrancaLocacaoDeleteManyMcpTool } from './controllers/cobrancaLocacaoDeleteManyController';
import { cobrancaLocacaoArchiveManyMcpTool } from './controllers/cobrancaLocacaoArchiveManyController';
import { cobrancaLocacaoRestoreManyMcpTool } from './controllers/cobrancaLocacaoRestoreManyController';
import { cobrancaLocacaoAutocompleteMcpTool } from './controllers/cobrancaLocacaoAutocompleteController';

export function getCobrancaLocacaoMcpTools(dictionary: Dictionary): McpTool[] {
  return [
    cobrancaLocacaoFindManyMcpTool(dictionary),
    cobrancaLocacaoFindMcpTool(dictionary),
    cobrancaLocacaoCreateMcpTool(dictionary),
    cobrancaLocacaoUpdateMcpTool(dictionary),
    cobrancaLocacaoDeleteManyMcpTool(dictionary),
    cobrancaLocacaoArchiveManyMcpTool(dictionary),
    cobrancaLocacaoRestoreManyMcpTool(dictionary),
    cobrancaLocacaoAutocompleteMcpTool(dictionary),
  ];
}
