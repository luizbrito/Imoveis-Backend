import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { midiaImovelFindManyMcpTool } from './controllers/midiaImovelFindManyController';
import { midiaImovelFindMcpTool } from './controllers/midiaImovelFindController';
import { midiaImovelCreateMcpTool } from './controllers/midiaImovelCreateController';
import { midiaImovelUpdateMcpTool } from './controllers/midiaImovelUpdateController';
import { midiaImovelDeleteManyMcpTool } from './controllers/midiaImovelDeleteManyController';
import { midiaImovelArchiveManyMcpTool } from './controllers/midiaImovelArchiveManyController';
import { midiaImovelRestoreManyMcpTool } from './controllers/midiaImovelRestoreManyController';
import { midiaImovelAutocompleteMcpTool } from './controllers/midiaImovelAutocompleteController';

export function getMidiaImovelMcpTools(dictionary: Dictionary): McpTool[] {
  return [
    midiaImovelFindManyMcpTool(dictionary),
    midiaImovelFindMcpTool(dictionary),
    midiaImovelCreateMcpTool(dictionary),
    midiaImovelUpdateMcpTool(dictionary),
    midiaImovelDeleteManyMcpTool(dictionary),
    midiaImovelArchiveManyMcpTool(dictionary),
    midiaImovelRestoreManyMcpTool(dictionary),
    midiaImovelAutocompleteMcpTool(dictionary),
  ];
}
