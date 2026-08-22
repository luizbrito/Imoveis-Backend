import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { documentoImovelFindManyMcpTool } from './controllers/documentoImovelFindManyController';
import { documentoImovelFindMcpTool } from './controllers/documentoImovelFindController';
import { documentoImovelCreateMcpTool } from './controllers/documentoImovelCreateController';
import { documentoImovelUpdateMcpTool } from './controllers/documentoImovelUpdateController';
import { documentoImovelDeleteManyMcpTool } from './controllers/documentoImovelDeleteManyController';
import { documentoImovelArchiveManyMcpTool } from './controllers/documentoImovelArchiveManyController';
import { documentoImovelRestoreManyMcpTool } from './controllers/documentoImovelRestoreManyController';
import { documentoImovelAutocompleteMcpTool } from './controllers/documentoImovelAutocompleteController';

export function getDocumentoImovelMcpTools(dictionary: Dictionary): McpTool[] {
  return [
    documentoImovelFindManyMcpTool(dictionary),
    documentoImovelFindMcpTool(dictionary),
    documentoImovelCreateMcpTool(dictionary),
    documentoImovelUpdateMcpTool(dictionary),
    documentoImovelDeleteManyMcpTool(dictionary),
    documentoImovelArchiveManyMcpTool(dictionary),
    documentoImovelRestoreManyMcpTool(dictionary),
    documentoImovelAutocompleteMcpTool(dictionary),
  ];
}
