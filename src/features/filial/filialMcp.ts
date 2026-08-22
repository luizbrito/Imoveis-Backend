import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { filialFindManyMcpTool } from './controllers/filialFindManyController';
import { filialFindMcpTool } from './controllers/filialFindController';
import { filialCreateMcpTool } from './controllers/filialCreateController';
import { filialUpdateMcpTool } from './controllers/filialUpdateController';
import { filialDeleteManyMcpTool } from './controllers/filialDeleteManyController';
import { filialArchiveManyMcpTool } from './controllers/filialArchiveManyController';
import { filialRestoreManyMcpTool } from './controllers/filialRestoreManyController';
import { filialAutocompleteMcpTool } from './controllers/filialAutocompleteController';

export function getFilialMcpTools(dictionary: Dictionary): McpTool[] {
  return [
    filialFindManyMcpTool(dictionary),
    filialFindMcpTool(dictionary),
    filialCreateMcpTool(dictionary),
    filialUpdateMcpTool(dictionary),
    filialDeleteManyMcpTool(dictionary),
    filialArchiveManyMcpTool(dictionary),
    filialRestoreManyMcpTool(dictionary),
    filialAutocompleteMcpTool(dictionary),
  ];
}
