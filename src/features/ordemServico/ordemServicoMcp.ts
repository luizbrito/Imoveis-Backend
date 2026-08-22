import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { ordemServicoFindManyMcpTool } from './controllers/ordemServicoFindManyController';
import { ordemServicoFindMcpTool } from './controllers/ordemServicoFindController';
import { ordemServicoCreateMcpTool } from './controllers/ordemServicoCreateController';
import { ordemServicoUpdateMcpTool } from './controllers/ordemServicoUpdateController';
import { ordemServicoDeleteManyMcpTool } from './controllers/ordemServicoDeleteManyController';
import { ordemServicoArchiveManyMcpTool } from './controllers/ordemServicoArchiveManyController';
import { ordemServicoRestoreManyMcpTool } from './controllers/ordemServicoRestoreManyController';
import { ordemServicoAutocompleteMcpTool } from './controllers/ordemServicoAutocompleteController';

export function getOrdemServicoMcpTools(dictionary: Dictionary): McpTool[] {
  return [
    ordemServicoFindManyMcpTool(dictionary),
    ordemServicoFindMcpTool(dictionary),
    ordemServicoCreateMcpTool(dictionary),
    ordemServicoUpdateMcpTool(dictionary),
    ordemServicoDeleteManyMcpTool(dictionary),
    ordemServicoArchiveManyMcpTool(dictionary),
    ordemServicoRestoreManyMcpTool(dictionary),
    ordemServicoAutocompleteMcpTool(dictionary),
  ];
}
