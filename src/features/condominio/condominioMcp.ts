import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { condominioFindManyMcpTool } from './controllers/condominioFindManyController';
import { condominioFindMcpTool } from './controllers/condominioFindController';
import { condominioCreateMcpTool } from './controllers/condominioCreateController';
import { condominioUpdateMcpTool } from './controllers/condominioUpdateController';
import { condominioDeleteManyMcpTool } from './controllers/condominioDeleteManyController';
import { condominioArchiveManyMcpTool } from './controllers/condominioArchiveManyController';
import { condominioRestoreManyMcpTool } from './controllers/condominioRestoreManyController';
import { condominioAutocompleteMcpTool } from './controllers/condominioAutocompleteController';

export function getCondominioMcpTools(dictionary: Dictionary): McpTool[] {
  return [
    condominioFindManyMcpTool(dictionary),
    condominioFindMcpTool(dictionary),
    condominioCreateMcpTool(dictionary),
    condominioUpdateMcpTool(dictionary),
    condominioDeleteManyMcpTool(dictionary),
    condominioArchiveManyMcpTool(dictionary),
    condominioRestoreManyMcpTool(dictionary),
    condominioAutocompleteMcpTool(dictionary),
  ];
}
