import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { memberAutocompleteMcpTool } from './controllers/memberAutocompleteController';
import { memberFindMcpTool } from './controllers/memberFindController';
import { memberFindManyMcpTool } from './controllers/memberFindManyController';
import { memberUpdateMcpTool } from './controllers/memberUpdateController';
import { memberDisableMcpTool } from './controllers/memberDisableController';
import { memberRestoreMcpTool } from './controllers/memberRestoreController';
import { memberRemoveMcpTool } from './controllers/memberRemoveController';

export function getMemberMcpTools(dictionary: Dictionary): McpTool[] {
  return [
    memberFindManyMcpTool(dictionary),
    memberFindMcpTool(dictionary),
    memberAutocompleteMcpTool(dictionary),
    memberUpdateMcpTool(dictionary),
    memberDisableMcpTool(dictionary),
    memberRestoreMcpTool(dictionary),
    memberRemoveMcpTool(dictionary),
  ];
}
