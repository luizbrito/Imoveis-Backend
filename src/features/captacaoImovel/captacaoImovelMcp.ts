import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { captacaoImovelFindManyMcpTool } from './controllers/captacaoImovelFindManyController';
import { captacaoImovelFindMcpTool } from './controllers/captacaoImovelFindController';
import { captacaoImovelCreateMcpTool } from './controllers/captacaoImovelCreateController';
import { captacaoImovelUpdateMcpTool } from './controllers/captacaoImovelUpdateController';
import { captacaoImovelDeleteManyMcpTool } from './controllers/captacaoImovelDeleteManyController';
import { captacaoImovelArchiveManyMcpTool } from './controllers/captacaoImovelArchiveManyController';
import { captacaoImovelRestoreManyMcpTool } from './controllers/captacaoImovelRestoreManyController';
import { captacaoImovelAutocompleteMcpTool } from './controllers/captacaoImovelAutocompleteController';

export function getCaptacaoImovelMcpTools(dictionary: Dictionary): McpTool[] {
  return [
    captacaoImovelFindManyMcpTool(dictionary),
    captacaoImovelFindMcpTool(dictionary),
    captacaoImovelCreateMcpTool(dictionary),
    captacaoImovelUpdateMcpTool(dictionary),
    captacaoImovelDeleteManyMcpTool(dictionary),
    captacaoImovelArchiveManyMcpTool(dictionary),
    captacaoImovelRestoreManyMcpTool(dictionary),
    captacaoImovelAutocompleteMcpTool(dictionary),
  ];
}
