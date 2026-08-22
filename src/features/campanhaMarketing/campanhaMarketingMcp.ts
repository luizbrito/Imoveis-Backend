import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { campanhaMarketingFindManyMcpTool } from './controllers/campanhaMarketingFindManyController';
import { campanhaMarketingFindMcpTool } from './controllers/campanhaMarketingFindController';
import { campanhaMarketingCreateMcpTool } from './controllers/campanhaMarketingCreateController';
import { campanhaMarketingUpdateMcpTool } from './controllers/campanhaMarketingUpdateController';
import { campanhaMarketingDeleteManyMcpTool } from './controllers/campanhaMarketingDeleteManyController';
import { campanhaMarketingArchiveManyMcpTool } from './controllers/campanhaMarketingArchiveManyController';
import { campanhaMarketingRestoreManyMcpTool } from './controllers/campanhaMarketingRestoreManyController';
import { campanhaMarketingAutocompleteMcpTool } from './controllers/campanhaMarketingAutocompleteController';

export function getCampanhaMarketingMcpTools(
  dictionary: Dictionary,
): McpTool[] {
  return [
    campanhaMarketingFindManyMcpTool(dictionary),
    campanhaMarketingFindMcpTool(dictionary),
    campanhaMarketingCreateMcpTool(dictionary),
    campanhaMarketingUpdateMcpTool(dictionary),
    campanhaMarketingDeleteManyMcpTool(dictionary),
    campanhaMarketingArchiveManyMcpTool(dictionary),
    campanhaMarketingRestoreManyMcpTool(dictionary),
    campanhaMarketingAutocompleteMcpTool(dictionary),
  ];
}
