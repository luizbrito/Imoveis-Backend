import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { contratoAdministracaoFindManyMcpTool } from './controllers/contratoAdministracaoFindManyController';
import { contratoAdministracaoFindMcpTool } from './controllers/contratoAdministracaoFindController';
import { contratoAdministracaoCreateMcpTool } from './controllers/contratoAdministracaoCreateController';
import { contratoAdministracaoUpdateMcpTool } from './controllers/contratoAdministracaoUpdateController';
import { contratoAdministracaoDeleteManyMcpTool } from './controllers/contratoAdministracaoDeleteManyController';
import { contratoAdministracaoArchiveManyMcpTool } from './controllers/contratoAdministracaoArchiveManyController';
import { contratoAdministracaoRestoreManyMcpTool } from './controllers/contratoAdministracaoRestoreManyController';
import { contratoAdministracaoAutocompleteMcpTool } from './controllers/contratoAdministracaoAutocompleteController';

export function getContratoAdministracaoMcpTools(
  dictionary: Dictionary,
): McpTool[] {
  return [
    contratoAdministracaoFindManyMcpTool(dictionary),
    contratoAdministracaoFindMcpTool(dictionary),
    contratoAdministracaoCreateMcpTool(dictionary),
    contratoAdministracaoUpdateMcpTool(dictionary),
    contratoAdministracaoDeleteManyMcpTool(dictionary),
    contratoAdministracaoArchiveManyMcpTool(dictionary),
    contratoAdministracaoRestoreManyMcpTool(dictionary),
    contratoAdministracaoAutocompleteMcpTool(dictionary),
  ];
}
