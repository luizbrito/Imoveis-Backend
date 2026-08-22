import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { cidadeFindManyMcpTool } from './controllers/cidadeFindManyController';
import { cidadeFindMcpTool } from './controllers/cidadeFindController';
import { cidadeCreateMcpTool } from './controllers/cidadeCreateController';
import { cidadeUpdateMcpTool } from './controllers/cidadeUpdateController';
import { cidadeDeleteManyMcpTool } from './controllers/cidadeDeleteManyController';
import { cidadeArchiveManyMcpTool } from './controllers/cidadeArchiveManyController';
import { cidadeRestoreManyMcpTool } from './controllers/cidadeRestoreManyController';
import { cidadeAutocompleteMcpTool } from './controllers/cidadeAutocompleteController';

export function getCidadeMcpTools(dictionary: Dictionary): McpTool[] {
  return [
    cidadeFindManyMcpTool(dictionary),
    cidadeFindMcpTool(dictionary),
    cidadeCreateMcpTool(dictionary),
    cidadeUpdateMcpTool(dictionary),
    cidadeDeleteManyMcpTool(dictionary),
    cidadeArchiveManyMcpTool(dictionary),
    cidadeRestoreManyMcpTool(dictionary),
    cidadeAutocompleteMcpTool(dictionary),
  ];
}
