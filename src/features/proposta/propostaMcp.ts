import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { propostaFindManyMcpTool } from './controllers/propostaFindManyController';
import { propostaFindMcpTool } from './controllers/propostaFindController';
import { propostaCreateMcpTool } from './controllers/propostaCreateController';
import { propostaUpdateMcpTool } from './controllers/propostaUpdateController';
import { propostaDeleteManyMcpTool } from './controllers/propostaDeleteManyController';
import { propostaArchiveManyMcpTool } from './controllers/propostaArchiveManyController';
import { propostaRestoreManyMcpTool } from './controllers/propostaRestoreManyController';
import { propostaAutocompleteMcpTool } from './controllers/propostaAutocompleteController';

export function getPropostaMcpTools(dictionary: Dictionary): McpTool[] {
  return [
    propostaFindManyMcpTool(dictionary),
    propostaFindMcpTool(dictionary),
    propostaCreateMcpTool(dictionary),
    propostaUpdateMcpTool(dictionary),
    propostaDeleteManyMcpTool(dictionary),
    propostaArchiveManyMcpTool(dictionary),
    propostaRestoreManyMcpTool(dictionary),
    propostaAutocompleteMcpTool(dictionary),
  ];
}
