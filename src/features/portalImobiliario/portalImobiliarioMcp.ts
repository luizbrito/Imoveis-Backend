import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { portalImobiliarioFindManyMcpTool } from './controllers/portalImobiliarioFindManyController';
import { portalImobiliarioFindMcpTool } from './controllers/portalImobiliarioFindController';
import { portalImobiliarioCreateMcpTool } from './controllers/portalImobiliarioCreateController';
import { portalImobiliarioUpdateMcpTool } from './controllers/portalImobiliarioUpdateController';
import { portalImobiliarioDeleteManyMcpTool } from './controllers/portalImobiliarioDeleteManyController';
import { portalImobiliarioArchiveManyMcpTool } from './controllers/portalImobiliarioArchiveManyController';
import { portalImobiliarioRestoreManyMcpTool } from './controllers/portalImobiliarioRestoreManyController';
import { portalImobiliarioAutocompleteMcpTool } from './controllers/portalImobiliarioAutocompleteController';

export function getPortalImobiliarioMcpTools(
  dictionary: Dictionary,
): McpTool[] {
  return [
    portalImobiliarioFindManyMcpTool(dictionary),
    portalImobiliarioFindMcpTool(dictionary),
    portalImobiliarioCreateMcpTool(dictionary),
    portalImobiliarioUpdateMcpTool(dictionary),
    portalImobiliarioDeleteManyMcpTool(dictionary),
    portalImobiliarioArchiveManyMcpTool(dictionary),
    portalImobiliarioRestoreManyMcpTool(dictionary),
    portalImobiliarioAutocompleteMcpTool(dictionary),
  ];
}
