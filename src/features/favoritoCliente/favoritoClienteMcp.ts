import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { favoritoClienteFindManyMcpTool } from './controllers/favoritoClienteFindManyController';
import { favoritoClienteFindMcpTool } from './controllers/favoritoClienteFindController';
import { favoritoClienteCreateMcpTool } from './controllers/favoritoClienteCreateController';
import { favoritoClienteUpdateMcpTool } from './controllers/favoritoClienteUpdateController';
import { favoritoClienteDeleteManyMcpTool } from './controllers/favoritoClienteDeleteManyController';
import { favoritoClienteArchiveManyMcpTool } from './controllers/favoritoClienteArchiveManyController';
import { favoritoClienteRestoreManyMcpTool } from './controllers/favoritoClienteRestoreManyController';
import { favoritoClienteAutocompleteMcpTool } from './controllers/favoritoClienteAutocompleteController';

export function getFavoritoClienteMcpTools(dictionary: Dictionary): McpTool[] {
  return [
    favoritoClienteFindManyMcpTool(dictionary),
    favoritoClienteFindMcpTool(dictionary),
    favoritoClienteCreateMcpTool(dictionary),
    favoritoClienteUpdateMcpTool(dictionary),
    favoritoClienteDeleteManyMcpTool(dictionary),
    favoritoClienteArchiveManyMcpTool(dictionary),
    favoritoClienteRestoreManyMcpTool(dictionary),
    favoritoClienteAutocompleteMcpTool(dictionary),
  ];
}
