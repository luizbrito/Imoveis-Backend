import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { imovelCaracteristicaFindManyMcpTool } from './controllers/imovelCaracteristicaFindManyController';
import { imovelCaracteristicaFindMcpTool } from './controllers/imovelCaracteristicaFindController';
import { imovelCaracteristicaCreateMcpTool } from './controllers/imovelCaracteristicaCreateController';
import { imovelCaracteristicaUpdateMcpTool } from './controllers/imovelCaracteristicaUpdateController';
import { imovelCaracteristicaDeleteManyMcpTool } from './controllers/imovelCaracteristicaDeleteManyController';
import { imovelCaracteristicaArchiveManyMcpTool } from './controllers/imovelCaracteristicaArchiveManyController';
import { imovelCaracteristicaRestoreManyMcpTool } from './controllers/imovelCaracteristicaRestoreManyController';
import { imovelCaracteristicaAutocompleteMcpTool } from './controllers/imovelCaracteristicaAutocompleteController';

export function getImovelCaracteristicaMcpTools(
  dictionary: Dictionary,
): McpTool[] {
  return [
    imovelCaracteristicaFindManyMcpTool(dictionary),
    imovelCaracteristicaFindMcpTool(dictionary),
    imovelCaracteristicaCreateMcpTool(dictionary),
    imovelCaracteristicaUpdateMcpTool(dictionary),
    imovelCaracteristicaDeleteManyMcpTool(dictionary),
    imovelCaracteristicaArchiveManyMcpTool(dictionary),
    imovelCaracteristicaRestoreManyMcpTool(dictionary),
    imovelCaracteristicaAutocompleteMcpTool(dictionary),
  ];
}
