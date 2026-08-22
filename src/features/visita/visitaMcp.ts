import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { visitaFindManyMcpTool } from './controllers/visitaFindManyController';
import { visitaFindMcpTool } from './controllers/visitaFindController';
import { visitaCreateMcpTool } from './controllers/visitaCreateController';
import { visitaUpdateMcpTool } from './controllers/visitaUpdateController';
import { visitaDeleteManyMcpTool } from './controllers/visitaDeleteManyController';
import { visitaArchiveManyMcpTool } from './controllers/visitaArchiveManyController';
import { visitaRestoreManyMcpTool } from './controllers/visitaRestoreManyController';
import { visitaAutocompleteMcpTool } from './controllers/visitaAutocompleteController';

export function getVisitaMcpTools(dictionary: Dictionary): McpTool[] {
  return [
    visitaFindManyMcpTool(dictionary),
    visitaFindMcpTool(dictionary),
    visitaCreateMcpTool(dictionary),
    visitaUpdateMcpTool(dictionary),
    visitaDeleteManyMcpTool(dictionary),
    visitaArchiveManyMcpTool(dictionary),
    visitaRestoreManyMcpTool(dictionary),
    visitaAutocompleteMcpTool(dictionary),
  ];
}
