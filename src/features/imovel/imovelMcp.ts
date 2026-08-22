import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { imovelFindManyMcpTool } from './controllers/imovelFindManyController';
import { imovelFindMcpTool } from './controllers/imovelFindController';
import { imovelCreateMcpTool } from './controllers/imovelCreateController';
import { imovelUpdateMcpTool } from './controllers/imovelUpdateController';
import { imovelDeleteManyMcpTool } from './controllers/imovelDeleteManyController';
import { imovelArchiveManyMcpTool } from './controllers/imovelArchiveManyController';
import { imovelRestoreManyMcpTool } from './controllers/imovelRestoreManyController';
import { imovelAutocompleteMcpTool } from './controllers/imovelAutocompleteController';

export function getImovelMcpTools(dictionary: Dictionary): McpTool[] {
  return [
    imovelFindManyMcpTool(dictionary),
    imovelFindMcpTool(dictionary),
    imovelCreateMcpTool(dictionary),
    imovelUpdateMcpTool(dictionary),
    imovelDeleteManyMcpTool(dictionary),
    imovelArchiveManyMcpTool(dictionary),
    imovelRestoreManyMcpTool(dictionary),
    imovelAutocompleteMcpTool(dictionary),
  ];
}
