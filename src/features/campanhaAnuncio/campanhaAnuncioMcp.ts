import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { campanhaAnuncioFindManyMcpTool } from './controllers/campanhaAnuncioFindManyController';
import { campanhaAnuncioFindMcpTool } from './controllers/campanhaAnuncioFindController';
import { campanhaAnuncioCreateMcpTool } from './controllers/campanhaAnuncioCreateController';
import { campanhaAnuncioUpdateMcpTool } from './controllers/campanhaAnuncioUpdateController';
import { campanhaAnuncioDeleteManyMcpTool } from './controllers/campanhaAnuncioDeleteManyController';
import { campanhaAnuncioArchiveManyMcpTool } from './controllers/campanhaAnuncioArchiveManyController';
import { campanhaAnuncioRestoreManyMcpTool } from './controllers/campanhaAnuncioRestoreManyController';
import { campanhaAnuncioAutocompleteMcpTool } from './controllers/campanhaAnuncioAutocompleteController';

export function getCampanhaAnuncioMcpTools(dictionary: Dictionary): McpTool[] {
  return [
    campanhaAnuncioFindManyMcpTool(dictionary),
    campanhaAnuncioFindMcpTool(dictionary),
    campanhaAnuncioCreateMcpTool(dictionary),
    campanhaAnuncioUpdateMcpTool(dictionary),
    campanhaAnuncioDeleteManyMcpTool(dictionary),
    campanhaAnuncioArchiveManyMcpTool(dictionary),
    campanhaAnuncioRestoreManyMcpTool(dictionary),
    campanhaAnuncioAutocompleteMcpTool(dictionary),
  ];
}
