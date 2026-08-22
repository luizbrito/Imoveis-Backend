import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { empreendimentoFindManyMcpTool } from './controllers/empreendimentoFindManyController';
import { empreendimentoFindMcpTool } from './controllers/empreendimentoFindController';
import { empreendimentoCreateMcpTool } from './controllers/empreendimentoCreateController';
import { empreendimentoUpdateMcpTool } from './controllers/empreendimentoUpdateController';
import { empreendimentoDeleteManyMcpTool } from './controllers/empreendimentoDeleteManyController';
import { empreendimentoArchiveManyMcpTool } from './controllers/empreendimentoArchiveManyController';
import { empreendimentoRestoreManyMcpTool } from './controllers/empreendimentoRestoreManyController';
import { empreendimentoAutocompleteMcpTool } from './controllers/empreendimentoAutocompleteController';

export function getEmpreendimentoMcpTools(dictionary: Dictionary): McpTool[] {
  return [
    empreendimentoFindManyMcpTool(dictionary),
    empreendimentoFindMcpTool(dictionary),
    empreendimentoCreateMcpTool(dictionary),
    empreendimentoUpdateMcpTool(dictionary),
    empreendimentoDeleteManyMcpTool(dictionary),
    empreendimentoArchiveManyMcpTool(dictionary),
    empreendimentoRestoreManyMcpTool(dictionary),
    empreendimentoAutocompleteMcpTool(dictionary),
  ];
}
