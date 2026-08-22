import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { contratoVendaFindManyMcpTool } from './controllers/contratoVendaFindManyController';
import { contratoVendaFindMcpTool } from './controllers/contratoVendaFindController';
import { contratoVendaCreateMcpTool } from './controllers/contratoVendaCreateController';
import { contratoVendaUpdateMcpTool } from './controllers/contratoVendaUpdateController';
import { contratoVendaDeleteManyMcpTool } from './controllers/contratoVendaDeleteManyController';
import { contratoVendaArchiveManyMcpTool } from './controllers/contratoVendaArchiveManyController';
import { contratoVendaRestoreManyMcpTool } from './controllers/contratoVendaRestoreManyController';
import { contratoVendaAutocompleteMcpTool } from './controllers/contratoVendaAutocompleteController';

export function getContratoVendaMcpTools(dictionary: Dictionary): McpTool[] {
  return [
    contratoVendaFindManyMcpTool(dictionary),
    contratoVendaFindMcpTool(dictionary),
    contratoVendaCreateMcpTool(dictionary),
    contratoVendaUpdateMcpTool(dictionary),
    contratoVendaDeleteManyMcpTool(dictionary),
    contratoVendaArchiveManyMcpTool(dictionary),
    contratoVendaRestoreManyMcpTool(dictionary),
    contratoVendaAutocompleteMcpTool(dictionary),
  ];
}
