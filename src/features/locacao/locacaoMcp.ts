import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { locacaoFindManyMcpTool } from './controllers/locacaoFindManyController';
import { locacaoFindMcpTool } from './controllers/locacaoFindController';
import { locacaoCreateMcpTool } from './controllers/locacaoCreateController';
import { locacaoUpdateMcpTool } from './controllers/locacaoUpdateController';
import { locacaoDeleteManyMcpTool } from './controllers/locacaoDeleteManyController';
import { locacaoArchiveManyMcpTool } from './controllers/locacaoArchiveManyController';
import { locacaoRestoreManyMcpTool } from './controllers/locacaoRestoreManyController';
import { locacaoAutocompleteMcpTool } from './controllers/locacaoAutocompleteController';

export function getLocacaoMcpTools(dictionary: Dictionary): McpTool[] {
  return [
    locacaoFindManyMcpTool(dictionary),
    locacaoFindMcpTool(dictionary),
    locacaoCreateMcpTool(dictionary),
    locacaoUpdateMcpTool(dictionary),
    locacaoDeleteManyMcpTool(dictionary),
    locacaoArchiveManyMcpTool(dictionary),
    locacaoRestoreManyMcpTool(dictionary),
    locacaoAutocompleteMcpTool(dictionary),
  ];
}
