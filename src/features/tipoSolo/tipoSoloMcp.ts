import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { tipoSoloFindManyMcpTool } from './controllers/tipoSoloFindManyController';
import { tipoSoloFindMcpTool } from './controllers/tipoSoloFindController';
import { tipoSoloCreateMcpTool } from './controllers/tipoSoloCreateController';
import { tipoSoloUpdateMcpTool } from './controllers/tipoSoloUpdateController';
import { tipoSoloDeleteManyMcpTool } from './controllers/tipoSoloDeleteManyController';
import { tipoSoloArchiveManyMcpTool } from './controllers/tipoSoloArchiveManyController';
import { tipoSoloRestoreManyMcpTool } from './controllers/tipoSoloRestoreManyController';
import { tipoSoloAutocompleteMcpTool } from './controllers/tipoSoloAutocompleteController';

export function getTipoSoloMcpTools(dictionary: Dictionary): McpTool[] {
  return [
    tipoSoloFindManyMcpTool(dictionary),
    tipoSoloFindMcpTool(dictionary),
    tipoSoloCreateMcpTool(dictionary),
    tipoSoloUpdateMcpTool(dictionary),
    tipoSoloDeleteManyMcpTool(dictionary),
    tipoSoloArchiveManyMcpTool(dictionary),
    tipoSoloRestoreManyMcpTool(dictionary),
    tipoSoloAutocompleteMcpTool(dictionary),
  ];
}
