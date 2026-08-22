import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { tarefaComercialFindManyMcpTool } from './controllers/tarefaComercialFindManyController';
import { tarefaComercialFindMcpTool } from './controllers/tarefaComercialFindController';
import { tarefaComercialCreateMcpTool } from './controllers/tarefaComercialCreateController';
import { tarefaComercialUpdateMcpTool } from './controllers/tarefaComercialUpdateController';
import { tarefaComercialDeleteManyMcpTool } from './controllers/tarefaComercialDeleteManyController';
import { tarefaComercialArchiveManyMcpTool } from './controllers/tarefaComercialArchiveManyController';
import { tarefaComercialRestoreManyMcpTool } from './controllers/tarefaComercialRestoreManyController';
import { tarefaComercialAutocompleteMcpTool } from './controllers/tarefaComercialAutocompleteController';

export function getTarefaComercialMcpTools(dictionary: Dictionary): McpTool[] {
  return [
    tarefaComercialFindManyMcpTool(dictionary),
    tarefaComercialFindMcpTool(dictionary),
    tarefaComercialCreateMcpTool(dictionary),
    tarefaComercialUpdateMcpTool(dictionary),
    tarefaComercialDeleteManyMcpTool(dictionary),
    tarefaComercialArchiveManyMcpTool(dictionary),
    tarefaComercialRestoreManyMcpTool(dictionary),
    tarefaComercialAutocompleteMcpTool(dictionary),
  ];
}
