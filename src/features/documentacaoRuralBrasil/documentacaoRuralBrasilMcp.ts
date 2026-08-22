import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { documentacaoRuralBrasilFindManyMcpTool } from './controllers/documentacaoRuralBrasilFindManyController';
import { documentacaoRuralBrasilFindMcpTool } from './controllers/documentacaoRuralBrasilFindController';
import { documentacaoRuralBrasilCreateMcpTool } from './controllers/documentacaoRuralBrasilCreateController';
import { documentacaoRuralBrasilUpdateMcpTool } from './controllers/documentacaoRuralBrasilUpdateController';
import { documentacaoRuralBrasilDeleteManyMcpTool } from './controllers/documentacaoRuralBrasilDeleteManyController';
import { documentacaoRuralBrasilArchiveManyMcpTool } from './controllers/documentacaoRuralBrasilArchiveManyController';
import { documentacaoRuralBrasilRestoreManyMcpTool } from './controllers/documentacaoRuralBrasilRestoreManyController';
import { documentacaoRuralBrasilAutocompleteMcpTool } from './controllers/documentacaoRuralBrasilAutocompleteController';

export function getDocumentacaoRuralBrasilMcpTools(
  dictionary: Dictionary,
): McpTool[] {
  return [
    documentacaoRuralBrasilFindManyMcpTool(dictionary),
    documentacaoRuralBrasilFindMcpTool(dictionary),
    documentacaoRuralBrasilCreateMcpTool(dictionary),
    documentacaoRuralBrasilUpdateMcpTool(dictionary),
    documentacaoRuralBrasilDeleteManyMcpTool(dictionary),
    documentacaoRuralBrasilArchiveManyMcpTool(dictionary),
    documentacaoRuralBrasilRestoreManyMcpTool(dictionary),
    documentacaoRuralBrasilAutocompleteMcpTool(dictionary),
  ];
}
