import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { paisFindManyMcpTool } from './controllers/paisFindManyController';
import { paisFindMcpTool } from './controllers/paisFindController';
import { paisCreateMcpTool } from './controllers/paisCreateController';
import { paisUpdateMcpTool } from './controllers/paisUpdateController';
import { paisDeleteManyMcpTool } from './controllers/paisDeleteManyController';
import { paisArchiveManyMcpTool } from './controllers/paisArchiveManyController';
import { paisRestoreManyMcpTool } from './controllers/paisRestoreManyController';
import { paisAutocompleteMcpTool } from './controllers/paisAutocompleteController';

export function getPaisMcpTools(dictionary: Dictionary): McpTool[] {
  return [
    paisFindManyMcpTool(dictionary),
    paisFindMcpTool(dictionary),
    paisCreateMcpTool(dictionary),
    paisUpdateMcpTool(dictionary),
    paisDeleteManyMcpTool(dictionary),
    paisArchiveManyMcpTool(dictionary),
    paisRestoreManyMcpTool(dictionary),
    paisAutocompleteMcpTool(dictionary),
  ];
}
