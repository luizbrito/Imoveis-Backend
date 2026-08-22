import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { corretorFindManyMcpTool } from './controllers/corretorFindManyController';
import { corretorFindMcpTool } from './controllers/corretorFindController';
import { corretorCreateMcpTool } from './controllers/corretorCreateController';
import { corretorUpdateMcpTool } from './controllers/corretorUpdateController';
import { corretorDeleteManyMcpTool } from './controllers/corretorDeleteManyController';
import { corretorArchiveManyMcpTool } from './controllers/corretorArchiveManyController';
import { corretorRestoreManyMcpTool } from './controllers/corretorRestoreManyController';
import { corretorAutocompleteMcpTool } from './controllers/corretorAutocompleteController';

export function getCorretorMcpTools(dictionary: Dictionary): McpTool[] {
  return [
    corretorFindManyMcpTool(dictionary),
    corretorFindMcpTool(dictionary),
    corretorCreateMcpTool(dictionary),
    corretorUpdateMcpTool(dictionary),
    corretorDeleteManyMcpTool(dictionary),
    corretorArchiveManyMcpTool(dictionary),
    corretorRestoreManyMcpTool(dictionary),
    corretorAutocompleteMcpTool(dictionary),
  ];
}
