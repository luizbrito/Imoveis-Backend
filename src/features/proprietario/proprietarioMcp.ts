import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { proprietarioFindManyMcpTool } from './controllers/proprietarioFindManyController';
import { proprietarioFindMcpTool } from './controllers/proprietarioFindController';
import { proprietarioCreateMcpTool } from './controllers/proprietarioCreateController';
import { proprietarioUpdateMcpTool } from './controllers/proprietarioUpdateController';
import { proprietarioDeleteManyMcpTool } from './controllers/proprietarioDeleteManyController';
import { proprietarioArchiveManyMcpTool } from './controllers/proprietarioArchiveManyController';
import { proprietarioRestoreManyMcpTool } from './controllers/proprietarioRestoreManyController';
import { proprietarioAutocompleteMcpTool } from './controllers/proprietarioAutocompleteController';

export function getProprietarioMcpTools(dictionary: Dictionary): McpTool[] {
  return [
    proprietarioFindManyMcpTool(dictionary),
    proprietarioFindMcpTool(dictionary),
    proprietarioCreateMcpTool(dictionary),
    proprietarioUpdateMcpTool(dictionary),
    proprietarioDeleteManyMcpTool(dictionary),
    proprietarioArchiveManyMcpTool(dictionary),
    proprietarioRestoreManyMcpTool(dictionary),
    proprietarioAutocompleteMcpTool(dictionary),
  ];
}
