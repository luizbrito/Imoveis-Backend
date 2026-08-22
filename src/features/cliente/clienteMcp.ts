import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { clienteFindManyMcpTool } from './controllers/clienteFindManyController';
import { clienteFindMcpTool } from './controllers/clienteFindController';
import { clienteCreateMcpTool } from './controllers/clienteCreateController';
import { clienteUpdateMcpTool } from './controllers/clienteUpdateController';
import { clienteDeleteManyMcpTool } from './controllers/clienteDeleteManyController';
import { clienteArchiveManyMcpTool } from './controllers/clienteArchiveManyController';
import { clienteRestoreManyMcpTool } from './controllers/clienteRestoreManyController';
import { clienteAutocompleteMcpTool } from './controllers/clienteAutocompleteController';

export function getClienteMcpTools(dictionary: Dictionary): McpTool[] {
  return [
    clienteFindManyMcpTool(dictionary),
    clienteFindMcpTool(dictionary),
    clienteCreateMcpTool(dictionary),
    clienteUpdateMcpTool(dictionary),
    clienteDeleteManyMcpTool(dictionary),
    clienteArchiveManyMcpTool(dictionary),
    clienteRestoreManyMcpTool(dictionary),
    clienteAutocompleteMcpTool(dictionary),
  ];
}
