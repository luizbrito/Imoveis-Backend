import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { solicitacaoManutencaoFindManyMcpTool } from './controllers/solicitacaoManutencaoFindManyController';
import { solicitacaoManutencaoFindMcpTool } from './controllers/solicitacaoManutencaoFindController';
import { solicitacaoManutencaoCreateMcpTool } from './controllers/solicitacaoManutencaoCreateController';
import { solicitacaoManutencaoUpdateMcpTool } from './controllers/solicitacaoManutencaoUpdateController';
import { solicitacaoManutencaoDeleteManyMcpTool } from './controllers/solicitacaoManutencaoDeleteManyController';
import { solicitacaoManutencaoArchiveManyMcpTool } from './controllers/solicitacaoManutencaoArchiveManyController';
import { solicitacaoManutencaoRestoreManyMcpTool } from './controllers/solicitacaoManutencaoRestoreManyController';
import { solicitacaoManutencaoAutocompleteMcpTool } from './controllers/solicitacaoManutencaoAutocompleteController';

export function getSolicitacaoManutencaoMcpTools(
  dictionary: Dictionary,
): McpTool[] {
  return [
    solicitacaoManutencaoFindManyMcpTool(dictionary),
    solicitacaoManutencaoFindMcpTool(dictionary),
    solicitacaoManutencaoCreateMcpTool(dictionary),
    solicitacaoManutencaoUpdateMcpTool(dictionary),
    solicitacaoManutencaoDeleteManyMcpTool(dictionary),
    solicitacaoManutencaoArchiveManyMcpTool(dictionary),
    solicitacaoManutencaoRestoreManyMcpTool(dictionary),
    solicitacaoManutencaoAutocompleteMcpTool(dictionary),
  ];
}
