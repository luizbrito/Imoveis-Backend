import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { caracteristicaImovelFindManyMcpTool } from './controllers/caracteristicaImovelFindManyController';
import { caracteristicaImovelFindMcpTool } from './controllers/caracteristicaImovelFindController';
import { caracteristicaImovelCreateMcpTool } from './controllers/caracteristicaImovelCreateController';
import { caracteristicaImovelUpdateMcpTool } from './controllers/caracteristicaImovelUpdateController';
import { caracteristicaImovelDeleteManyMcpTool } from './controllers/caracteristicaImovelDeleteManyController';
import { caracteristicaImovelArchiveManyMcpTool } from './controllers/caracteristicaImovelArchiveManyController';
import { caracteristicaImovelRestoreManyMcpTool } from './controllers/caracteristicaImovelRestoreManyController';
import { caracteristicaImovelAutocompleteMcpTool } from './controllers/caracteristicaImovelAutocompleteController';

export function getCaracteristicaImovelMcpTools(
  dictionary: Dictionary,
): McpTool[] {
  return [
    caracteristicaImovelFindManyMcpTool(dictionary),
    caracteristicaImovelFindMcpTool(dictionary),
    caracteristicaImovelCreateMcpTool(dictionary),
    caracteristicaImovelUpdateMcpTool(dictionary),
    caracteristicaImovelDeleteManyMcpTool(dictionary),
    caracteristicaImovelArchiveManyMcpTool(dictionary),
    caracteristicaImovelRestoreManyMcpTool(dictionary),
    caracteristicaImovelAutocompleteMcpTool(dictionary),
  ];
}
