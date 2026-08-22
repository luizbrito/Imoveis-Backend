import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { parcelaVendaFindManyMcpTool } from './controllers/parcelaVendaFindManyController';
import { parcelaVendaFindMcpTool } from './controllers/parcelaVendaFindController';
import { parcelaVendaCreateMcpTool } from './controllers/parcelaVendaCreateController';
import { parcelaVendaUpdateMcpTool } from './controllers/parcelaVendaUpdateController';
import { parcelaVendaDeleteManyMcpTool } from './controllers/parcelaVendaDeleteManyController';
import { parcelaVendaArchiveManyMcpTool } from './controllers/parcelaVendaArchiveManyController';
import { parcelaVendaRestoreManyMcpTool } from './controllers/parcelaVendaRestoreManyController';
import { parcelaVendaAutocompleteMcpTool } from './controllers/parcelaVendaAutocompleteController';

export function getParcelaVendaMcpTools(dictionary: Dictionary): McpTool[] {
  return [
    parcelaVendaFindManyMcpTool(dictionary),
    parcelaVendaFindMcpTool(dictionary),
    parcelaVendaCreateMcpTool(dictionary),
    parcelaVendaUpdateMcpTool(dictionary),
    parcelaVendaDeleteManyMcpTool(dictionary),
    parcelaVendaArchiveManyMcpTool(dictionary),
    parcelaVendaRestoreManyMcpTool(dictionary),
    parcelaVendaAutocompleteMcpTool(dictionary),
  ];
}
