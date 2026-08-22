import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { estadoFindManyMcpTool } from './controllers/estadoFindManyController';
import { estadoFindMcpTool } from './controllers/estadoFindController';
import { estadoCreateMcpTool } from './controllers/estadoCreateController';
import { estadoUpdateMcpTool } from './controllers/estadoUpdateController';
import { estadoDeleteManyMcpTool } from './controllers/estadoDeleteManyController';
import { estadoArchiveManyMcpTool } from './controllers/estadoArchiveManyController';
import { estadoRestoreManyMcpTool } from './controllers/estadoRestoreManyController';
import { estadoAutocompleteMcpTool } from './controllers/estadoAutocompleteController';

export function getEstadoMcpTools(dictionary: Dictionary): McpTool[] {
  return [
    estadoFindManyMcpTool(dictionary),
    estadoFindMcpTool(dictionary),
    estadoCreateMcpTool(dictionary),
    estadoUpdateMcpTool(dictionary),
    estadoDeleteManyMcpTool(dictionary),
    estadoArchiveManyMcpTool(dictionary),
    estadoRestoreManyMcpTool(dictionary),
    estadoAutocompleteMcpTool(dictionary),
  ];
}
