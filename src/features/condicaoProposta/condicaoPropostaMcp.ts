import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { condicaoPropostaFindManyMcpTool } from './controllers/condicaoPropostaFindManyController';
import { condicaoPropostaFindMcpTool } from './controllers/condicaoPropostaFindController';
import { condicaoPropostaCreateMcpTool } from './controllers/condicaoPropostaCreateController';
import { condicaoPropostaUpdateMcpTool } from './controllers/condicaoPropostaUpdateController';
import { condicaoPropostaDeleteManyMcpTool } from './controllers/condicaoPropostaDeleteManyController';
import { condicaoPropostaArchiveManyMcpTool } from './controllers/condicaoPropostaArchiveManyController';
import { condicaoPropostaRestoreManyMcpTool } from './controllers/condicaoPropostaRestoreManyController';
import { condicaoPropostaAutocompleteMcpTool } from './controllers/condicaoPropostaAutocompleteController';

export function getCondicaoPropostaMcpTools(dictionary: Dictionary): McpTool[] {
  return [
    condicaoPropostaFindManyMcpTool(dictionary),
    condicaoPropostaFindMcpTool(dictionary),
    condicaoPropostaCreateMcpTool(dictionary),
    condicaoPropostaUpdateMcpTool(dictionary),
    condicaoPropostaDeleteManyMcpTool(dictionary),
    condicaoPropostaArchiveManyMcpTool(dictionary),
    condicaoPropostaRestoreManyMcpTool(dictionary),
    condicaoPropostaAutocompleteMcpTool(dictionary),
  ];
}
