import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { reservaImovelFindManyMcpTool } from './controllers/reservaImovelFindManyController';
import { reservaImovelFindMcpTool } from './controllers/reservaImovelFindController';
import { reservaImovelCreateMcpTool } from './controllers/reservaImovelCreateController';
import { reservaImovelUpdateMcpTool } from './controllers/reservaImovelUpdateController';
import { reservaImovelDeleteManyMcpTool } from './controllers/reservaImovelDeleteManyController';
import { reservaImovelArchiveManyMcpTool } from './controllers/reservaImovelArchiveManyController';
import { reservaImovelRestoreManyMcpTool } from './controllers/reservaImovelRestoreManyController';
import { reservaImovelAutocompleteMcpTool } from './controllers/reservaImovelAutocompleteController';

export function getReservaImovelMcpTools(dictionary: Dictionary): McpTool[] {
  return [
    reservaImovelFindManyMcpTool(dictionary),
    reservaImovelFindMcpTool(dictionary),
    reservaImovelCreateMcpTool(dictionary),
    reservaImovelUpdateMcpTool(dictionary),
    reservaImovelDeleteManyMcpTool(dictionary),
    reservaImovelArchiveManyMcpTool(dictionary),
    reservaImovelRestoreManyMcpTool(dictionary),
    reservaImovelAutocompleteMcpTool(dictionary),
  ];
}
