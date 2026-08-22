import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { seguroImovelFindManyMcpTool } from './controllers/seguroImovelFindManyController';
import { seguroImovelFindMcpTool } from './controllers/seguroImovelFindController';
import { seguroImovelCreateMcpTool } from './controllers/seguroImovelCreateController';
import { seguroImovelUpdateMcpTool } from './controllers/seguroImovelUpdateController';
import { seguroImovelDeleteManyMcpTool } from './controllers/seguroImovelDeleteManyController';
import { seguroImovelArchiveManyMcpTool } from './controllers/seguroImovelArchiveManyController';
import { seguroImovelRestoreManyMcpTool } from './controllers/seguroImovelRestoreManyController';
import { seguroImovelAutocompleteMcpTool } from './controllers/seguroImovelAutocompleteController';

export function getSeguroImovelMcpTools(dictionary: Dictionary): McpTool[] {
  return [
    seguroImovelFindManyMcpTool(dictionary),
    seguroImovelFindMcpTool(dictionary),
    seguroImovelCreateMcpTool(dictionary),
    seguroImovelUpdateMcpTool(dictionary),
    seguroImovelDeleteManyMcpTool(dictionary),
    seguroImovelArchiveManyMcpTool(dictionary),
    seguroImovelRestoreManyMcpTool(dictionary),
    seguroImovelAutocompleteMcpTool(dictionary),
  ];
}
