import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { contratoLocacaoFindManyMcpTool } from './controllers/contratoLocacaoFindManyController';
import { contratoLocacaoFindMcpTool } from './controllers/contratoLocacaoFindController';
import { contratoLocacaoCreateMcpTool } from './controllers/contratoLocacaoCreateController';
import { contratoLocacaoUpdateMcpTool } from './controllers/contratoLocacaoUpdateController';
import { contratoLocacaoDeleteManyMcpTool } from './controllers/contratoLocacaoDeleteManyController';
import { contratoLocacaoArchiveManyMcpTool } from './controllers/contratoLocacaoArchiveManyController';
import { contratoLocacaoRestoreManyMcpTool } from './controllers/contratoLocacaoRestoreManyController';
import { contratoLocacaoAutocompleteMcpTool } from './controllers/contratoLocacaoAutocompleteController';

export function getContratoLocacaoMcpTools(dictionary: Dictionary): McpTool[] {
  return [
    contratoLocacaoFindManyMcpTool(dictionary),
    contratoLocacaoFindMcpTool(dictionary),
    contratoLocacaoCreateMcpTool(dictionary),
    contratoLocacaoUpdateMcpTool(dictionary),
    contratoLocacaoDeleteManyMcpTool(dictionary),
    contratoLocacaoArchiveManyMcpTool(dictionary),
    contratoLocacaoRestoreManyMcpTool(dictionary),
    contratoLocacaoAutocompleteMcpTool(dictionary),
  ];
}
