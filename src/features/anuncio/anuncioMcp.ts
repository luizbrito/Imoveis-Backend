import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { anuncioFindManyMcpTool } from './controllers/anuncioFindManyController';
import { anuncioFindMcpTool } from './controllers/anuncioFindController';
import { anuncioCreateMcpTool } from './controllers/anuncioCreateController';
import { anuncioUpdateMcpTool } from './controllers/anuncioUpdateController';
import { anuncioDeleteManyMcpTool } from './controllers/anuncioDeleteManyController';
import { anuncioArchiveManyMcpTool } from './controllers/anuncioArchiveManyController';
import { anuncioRestoreManyMcpTool } from './controllers/anuncioRestoreManyController';
import { anuncioAutocompleteMcpTool } from './controllers/anuncioAutocompleteController';

export function getAnuncioMcpTools(dictionary: Dictionary): McpTool[] {
  return [
    anuncioFindManyMcpTool(dictionary),
    anuncioFindMcpTool(dictionary),
    anuncioCreateMcpTool(dictionary),
    anuncioUpdateMcpTool(dictionary),
    anuncioDeleteManyMcpTool(dictionary),
    anuncioArchiveManyMcpTool(dictionary),
    anuncioRestoreManyMcpTool(dictionary),
    anuncioAutocompleteMcpTool(dictionary),
  ];
}
