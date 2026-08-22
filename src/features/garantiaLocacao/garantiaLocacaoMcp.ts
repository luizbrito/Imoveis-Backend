import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { garantiaLocacaoFindManyMcpTool } from './controllers/garantiaLocacaoFindManyController';
import { garantiaLocacaoFindMcpTool } from './controllers/garantiaLocacaoFindController';
import { garantiaLocacaoCreateMcpTool } from './controllers/garantiaLocacaoCreateController';
import { garantiaLocacaoUpdateMcpTool } from './controllers/garantiaLocacaoUpdateController';
import { garantiaLocacaoDeleteManyMcpTool } from './controllers/garantiaLocacaoDeleteManyController';
import { garantiaLocacaoArchiveManyMcpTool } from './controllers/garantiaLocacaoArchiveManyController';
import { garantiaLocacaoRestoreManyMcpTool } from './controllers/garantiaLocacaoRestoreManyController';
import { garantiaLocacaoAutocompleteMcpTool } from './controllers/garantiaLocacaoAutocompleteController';

export function getGarantiaLocacaoMcpTools(dictionary: Dictionary): McpTool[] {
  return [
    garantiaLocacaoFindManyMcpTool(dictionary),
    garantiaLocacaoFindMcpTool(dictionary),
    garantiaLocacaoCreateMcpTool(dictionary),
    garantiaLocacaoUpdateMcpTool(dictionary),
    garantiaLocacaoDeleteManyMcpTool(dictionary),
    garantiaLocacaoArchiveManyMcpTool(dictionary),
    garantiaLocacaoRestoreManyMcpTool(dictionary),
    garantiaLocacaoAutocompleteMcpTool(dictionary),
  ];
}
