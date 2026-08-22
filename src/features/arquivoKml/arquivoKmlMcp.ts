import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { arquivoKmlFindManyMcpTool } from './controllers/arquivoKmlFindManyController';
import { arquivoKmlFindMcpTool } from './controllers/arquivoKmlFindController';
import { arquivoKmlCreateMcpTool } from './controllers/arquivoKmlCreateController';
import { arquivoKmlUpdateMcpTool } from './controllers/arquivoKmlUpdateController';
import { arquivoKmlDeleteManyMcpTool } from './controllers/arquivoKmlDeleteManyController';
import { arquivoKmlArchiveManyMcpTool } from './controllers/arquivoKmlArchiveManyController';
import { arquivoKmlRestoreManyMcpTool } from './controllers/arquivoKmlRestoreManyController';
import { arquivoKmlAutocompleteMcpTool } from './controllers/arquivoKmlAutocompleteController';

export function getArquivoKmlMcpTools(dictionary: Dictionary): McpTool[] {
  return [
    arquivoKmlFindManyMcpTool(dictionary),
    arquivoKmlFindMcpTool(dictionary),
    arquivoKmlCreateMcpTool(dictionary),
    arquivoKmlUpdateMcpTool(dictionary),
    arquivoKmlDeleteManyMcpTool(dictionary),
    arquivoKmlArchiveManyMcpTool(dictionary),
    arquivoKmlRestoreManyMcpTool(dictionary),
    arquivoKmlAutocompleteMcpTool(dictionary),
  ];
}
