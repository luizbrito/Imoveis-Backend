import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { avaliacaoImovelFindManyMcpTool } from './controllers/avaliacaoImovelFindManyController';
import { avaliacaoImovelFindMcpTool } from './controllers/avaliacaoImovelFindController';
import { avaliacaoImovelCreateMcpTool } from './controllers/avaliacaoImovelCreateController';
import { avaliacaoImovelUpdateMcpTool } from './controllers/avaliacaoImovelUpdateController';
import { avaliacaoImovelDeleteManyMcpTool } from './controllers/avaliacaoImovelDeleteManyController';
import { avaliacaoImovelArchiveManyMcpTool } from './controllers/avaliacaoImovelArchiveManyController';
import { avaliacaoImovelRestoreManyMcpTool } from './controllers/avaliacaoImovelRestoreManyController';
import { avaliacaoImovelAutocompleteMcpTool } from './controllers/avaliacaoImovelAutocompleteController';

export function getAvaliacaoImovelMcpTools(dictionary: Dictionary): McpTool[] {
  return [
    avaliacaoImovelFindManyMcpTool(dictionary),
    avaliacaoImovelFindMcpTool(dictionary),
    avaliacaoImovelCreateMcpTool(dictionary),
    avaliacaoImovelUpdateMcpTool(dictionary),
    avaliacaoImovelDeleteManyMcpTool(dictionary),
    avaliacaoImovelArchiveManyMcpTool(dictionary),
    avaliacaoImovelRestoreManyMcpTool(dictionary),
    avaliacaoImovelAutocompleteMcpTool(dictionary),
  ];
}
