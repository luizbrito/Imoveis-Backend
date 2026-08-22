import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { publicacaoPortalFindManyMcpTool } from './controllers/publicacaoPortalFindManyController';
import { publicacaoPortalFindMcpTool } from './controllers/publicacaoPortalFindController';
import { publicacaoPortalCreateMcpTool } from './controllers/publicacaoPortalCreateController';
import { publicacaoPortalUpdateMcpTool } from './controllers/publicacaoPortalUpdateController';
import { publicacaoPortalDeleteManyMcpTool } from './controllers/publicacaoPortalDeleteManyController';
import { publicacaoPortalArchiveManyMcpTool } from './controllers/publicacaoPortalArchiveManyController';
import { publicacaoPortalRestoreManyMcpTool } from './controllers/publicacaoPortalRestoreManyController';
import { publicacaoPortalAutocompleteMcpTool } from './controllers/publicacaoPortalAutocompleteController';

export function getPublicacaoPortalMcpTools(dictionary: Dictionary): McpTool[] {
  return [
    publicacaoPortalFindManyMcpTool(dictionary),
    publicacaoPortalFindMcpTool(dictionary),
    publicacaoPortalCreateMcpTool(dictionary),
    publicacaoPortalUpdateMcpTool(dictionary),
    publicacaoPortalDeleteManyMcpTool(dictionary),
    publicacaoPortalArchiveManyMcpTool(dictionary),
    publicacaoPortalRestoreManyMcpTool(dictionary),
    publicacaoPortalAutocompleteMcpTool(dictionary),
  ];
}
