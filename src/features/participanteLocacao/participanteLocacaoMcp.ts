import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { participanteLocacaoFindManyMcpTool } from './controllers/participanteLocacaoFindManyController';
import { participanteLocacaoFindMcpTool } from './controllers/participanteLocacaoFindController';
import { participanteLocacaoCreateMcpTool } from './controllers/participanteLocacaoCreateController';
import { participanteLocacaoUpdateMcpTool } from './controllers/participanteLocacaoUpdateController';
import { participanteLocacaoDeleteManyMcpTool } from './controllers/participanteLocacaoDeleteManyController';
import { participanteLocacaoArchiveManyMcpTool } from './controllers/participanteLocacaoArchiveManyController';
import { participanteLocacaoRestoreManyMcpTool } from './controllers/participanteLocacaoRestoreManyController';
import { participanteLocacaoAutocompleteMcpTool } from './controllers/participanteLocacaoAutocompleteController';

export function getParticipanteLocacaoMcpTools(
  dictionary: Dictionary,
): McpTool[] {
  return [
    participanteLocacaoFindManyMcpTool(dictionary),
    participanteLocacaoFindMcpTool(dictionary),
    participanteLocacaoCreateMcpTool(dictionary),
    participanteLocacaoUpdateMcpTool(dictionary),
    participanteLocacaoDeleteManyMcpTool(dictionary),
    participanteLocacaoArchiveManyMcpTool(dictionary),
    participanteLocacaoRestoreManyMcpTool(dictionary),
    participanteLocacaoAutocompleteMcpTool(dictionary),
  ];
}
