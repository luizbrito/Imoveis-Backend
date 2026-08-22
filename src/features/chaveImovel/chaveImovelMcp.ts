import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { chaveImovelFindManyMcpTool } from './controllers/chaveImovelFindManyController';
import { chaveImovelFindMcpTool } from './controllers/chaveImovelFindController';
import { chaveImovelCreateMcpTool } from './controllers/chaveImovelCreateController';
import { chaveImovelUpdateMcpTool } from './controllers/chaveImovelUpdateController';
import { chaveImovelDeleteManyMcpTool } from './controllers/chaveImovelDeleteManyController';
import { chaveImovelArchiveManyMcpTool } from './controllers/chaveImovelArchiveManyController';
import { chaveImovelRestoreManyMcpTool } from './controllers/chaveImovelRestoreManyController';
import { chaveImovelAutocompleteMcpTool } from './controllers/chaveImovelAutocompleteController';

export function getChaveImovelMcpTools(dictionary: Dictionary): McpTool[] {
  return [
    chaveImovelFindManyMcpTool(dictionary),
    chaveImovelFindMcpTool(dictionary),
    chaveImovelCreateMcpTool(dictionary),
    chaveImovelUpdateMcpTool(dictionary),
    chaveImovelDeleteManyMcpTool(dictionary),
    chaveImovelArchiveManyMcpTool(dictionary),
    chaveImovelRestoreManyMcpTool(dictionary),
    chaveImovelAutocompleteMcpTool(dictionary),
  ];
}
