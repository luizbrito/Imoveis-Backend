import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { solicitacaoContatoFindManyMcpTool } from './controllers/solicitacaoContatoFindManyController';
import { solicitacaoContatoFindMcpTool } from './controllers/solicitacaoContatoFindController';
import { solicitacaoContatoCreateMcpTool } from './controllers/solicitacaoContatoCreateController';
import { solicitacaoContatoUpdateMcpTool } from './controllers/solicitacaoContatoUpdateController';
import { solicitacaoContatoDeleteManyMcpTool } from './controllers/solicitacaoContatoDeleteManyController';
import { solicitacaoContatoArchiveManyMcpTool } from './controllers/solicitacaoContatoArchiveManyController';
import { solicitacaoContatoRestoreManyMcpTool } from './controllers/solicitacaoContatoRestoreManyController';
import { solicitacaoContatoAutocompleteMcpTool } from './controllers/solicitacaoContatoAutocompleteController';

export function getSolicitacaoContatoMcpTools(
  dictionary: Dictionary,
): McpTool[] {
  return [
    solicitacaoContatoFindManyMcpTool(dictionary),
    solicitacaoContatoFindMcpTool(dictionary),
    solicitacaoContatoCreateMcpTool(dictionary),
    solicitacaoContatoUpdateMcpTool(dictionary),
    solicitacaoContatoDeleteManyMcpTool(dictionary),
    solicitacaoContatoArchiveManyMcpTool(dictionary),
    solicitacaoContatoRestoreManyMcpTool(dictionary),
    solicitacaoContatoAutocompleteMcpTool(dictionary),
  ];
}
