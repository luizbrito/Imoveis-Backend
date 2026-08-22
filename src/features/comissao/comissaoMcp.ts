import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { comissaoFindManyMcpTool } from './controllers/comissaoFindManyController';
import { comissaoFindMcpTool } from './controllers/comissaoFindController';
import { comissaoCreateMcpTool } from './controllers/comissaoCreateController';
import { comissaoUpdateMcpTool } from './controllers/comissaoUpdateController';
import { comissaoDeleteManyMcpTool } from './controllers/comissaoDeleteManyController';
import { comissaoArchiveManyMcpTool } from './controllers/comissaoArchiveManyController';
import { comissaoRestoreManyMcpTool } from './controllers/comissaoRestoreManyController';
import { comissaoAutocompleteMcpTool } from './controllers/comissaoAutocompleteController';

export function getComissaoMcpTools(dictionary: Dictionary): McpTool[] {
  return [
    comissaoFindManyMcpTool(dictionary),
    comissaoFindMcpTool(dictionary),
    comissaoCreateMcpTool(dictionary),
    comissaoUpdateMcpTool(dictionary),
    comissaoDeleteManyMcpTool(dictionary),
    comissaoArchiveManyMcpTool(dictionary),
    comissaoRestoreManyMcpTool(dictionary),
    comissaoAutocompleteMcpTool(dictionary),
  ];
}
