import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { documentoPessoaFindManyMcpTool } from './controllers/documentoPessoaFindManyController';
import { documentoPessoaFindMcpTool } from './controllers/documentoPessoaFindController';
import { documentoPessoaCreateMcpTool } from './controllers/documentoPessoaCreateController';
import { documentoPessoaUpdateMcpTool } from './controllers/documentoPessoaUpdateController';
import { documentoPessoaDeleteManyMcpTool } from './controllers/documentoPessoaDeleteManyController';
import { documentoPessoaArchiveManyMcpTool } from './controllers/documentoPessoaArchiveManyController';
import { documentoPessoaRestoreManyMcpTool } from './controllers/documentoPessoaRestoreManyController';
import { documentoPessoaAutocompleteMcpTool } from './controllers/documentoPessoaAutocompleteController';

export function getDocumentoPessoaMcpTools(dictionary: Dictionary): McpTool[] {
  return [
    documentoPessoaFindManyMcpTool(dictionary),
    documentoPessoaFindMcpTool(dictionary),
    documentoPessoaCreateMcpTool(dictionary),
    documentoPessoaUpdateMcpTool(dictionary),
    documentoPessoaDeleteManyMcpTool(dictionary),
    documentoPessoaArchiveManyMcpTool(dictionary),
    documentoPessoaRestoreManyMcpTool(dictionary),
    documentoPessoaAutocompleteMcpTool(dictionary),
  ];
}
