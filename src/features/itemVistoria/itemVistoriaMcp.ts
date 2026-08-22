import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { itemVistoriaFindManyMcpTool } from './controllers/itemVistoriaFindManyController';
import { itemVistoriaFindMcpTool } from './controllers/itemVistoriaFindController';
import { itemVistoriaCreateMcpTool } from './controllers/itemVistoriaCreateController';
import { itemVistoriaUpdateMcpTool } from './controllers/itemVistoriaUpdateController';
import { itemVistoriaDeleteManyMcpTool } from './controllers/itemVistoriaDeleteManyController';
import { itemVistoriaArchiveManyMcpTool } from './controllers/itemVistoriaArchiveManyController';
import { itemVistoriaRestoreManyMcpTool } from './controllers/itemVistoriaRestoreManyController';
import { itemVistoriaAutocompleteMcpTool } from './controllers/itemVistoriaAutocompleteController';

export function getItemVistoriaMcpTools(dictionary: Dictionary): McpTool[] {
  return [
    itemVistoriaFindManyMcpTool(dictionary),
    itemVistoriaFindMcpTool(dictionary),
    itemVistoriaCreateMcpTool(dictionary),
    itemVistoriaUpdateMcpTool(dictionary),
    itemVistoriaDeleteManyMcpTool(dictionary),
    itemVistoriaArchiveManyMcpTool(dictionary),
    itemVistoriaRestoreManyMcpTool(dictionary),
    itemVistoriaAutocompleteMcpTool(dictionary),
  ];
}
