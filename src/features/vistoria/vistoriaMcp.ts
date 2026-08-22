import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { vistoriaFindManyMcpTool } from './controllers/vistoriaFindManyController';
import { vistoriaFindMcpTool } from './controllers/vistoriaFindController';
import { vistoriaCreateMcpTool } from './controllers/vistoriaCreateController';
import { vistoriaUpdateMcpTool } from './controllers/vistoriaUpdateController';
import { vistoriaDeleteManyMcpTool } from './controllers/vistoriaDeleteManyController';
import { vistoriaArchiveManyMcpTool } from './controllers/vistoriaArchiveManyController';
import { vistoriaRestoreManyMcpTool } from './controllers/vistoriaRestoreManyController';
import { vistoriaAutocompleteMcpTool } from './controllers/vistoriaAutocompleteController';

export function getVistoriaMcpTools(dictionary: Dictionary): McpTool[] {
  return [
    vistoriaFindManyMcpTool(dictionary),
    vistoriaFindMcpTool(dictionary),
    vistoriaCreateMcpTool(dictionary),
    vistoriaUpdateMcpTool(dictionary),
    vistoriaDeleteManyMcpTool(dictionary),
    vistoriaArchiveManyMcpTool(dictionary),
    vistoriaRestoreManyMcpTool(dictionary),
    vistoriaAutocompleteMcpTool(dictionary),
  ];
}
