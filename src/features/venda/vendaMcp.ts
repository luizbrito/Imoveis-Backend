import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { vendaFindManyMcpTool } from './controllers/vendaFindManyController';
import { vendaFindMcpTool } from './controllers/vendaFindController';
import { vendaCreateMcpTool } from './controllers/vendaCreateController';
import { vendaUpdateMcpTool } from './controllers/vendaUpdateController';
import { vendaDeleteManyMcpTool } from './controllers/vendaDeleteManyController';
import { vendaArchiveManyMcpTool } from './controllers/vendaArchiveManyController';
import { vendaRestoreManyMcpTool } from './controllers/vendaRestoreManyController';
import { vendaAutocompleteMcpTool } from './controllers/vendaAutocompleteController';

export function getVendaMcpTools(dictionary: Dictionary): McpTool[] {
  return [
    vendaFindManyMcpTool(dictionary),
    vendaFindMcpTool(dictionary),
    vendaCreateMcpTool(dictionary),
    vendaUpdateMcpTool(dictionary),
    vendaDeleteManyMcpTool(dictionary),
    vendaArchiveManyMcpTool(dictionary),
    vendaRestoreManyMcpTool(dictionary),
    vendaAutocompleteMcpTool(dictionary),
  ];
}
