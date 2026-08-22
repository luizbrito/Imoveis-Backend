import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { repasseProprietarioFindManyMcpTool } from './controllers/repasseProprietarioFindManyController';
import { repasseProprietarioFindMcpTool } from './controllers/repasseProprietarioFindController';
import { repasseProprietarioCreateMcpTool } from './controllers/repasseProprietarioCreateController';
import { repasseProprietarioUpdateMcpTool } from './controllers/repasseProprietarioUpdateController';
import { repasseProprietarioDeleteManyMcpTool } from './controllers/repasseProprietarioDeleteManyController';
import { repasseProprietarioArchiveManyMcpTool } from './controllers/repasseProprietarioArchiveManyController';
import { repasseProprietarioRestoreManyMcpTool } from './controllers/repasseProprietarioRestoreManyController';
import { repasseProprietarioAutocompleteMcpTool } from './controllers/repasseProprietarioAutocompleteController';

export function getRepasseProprietarioMcpTools(
  dictionary: Dictionary,
): McpTool[] {
  return [
    repasseProprietarioFindManyMcpTool(dictionary),
    repasseProprietarioFindMcpTool(dictionary),
    repasseProprietarioCreateMcpTool(dictionary),
    repasseProprietarioUpdateMcpTool(dictionary),
    repasseProprietarioDeleteManyMcpTool(dictionary),
    repasseProprietarioArchiveManyMcpTool(dictionary),
    repasseProprietarioRestoreManyMcpTool(dictionary),
    repasseProprietarioAutocompleteMcpTool(dictionary),
  ];
}
