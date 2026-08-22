import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { interacaoLeadFindManyMcpTool } from './controllers/interacaoLeadFindManyController';
import { interacaoLeadFindMcpTool } from './controllers/interacaoLeadFindController';
import { interacaoLeadCreateMcpTool } from './controllers/interacaoLeadCreateController';
import { interacaoLeadUpdateMcpTool } from './controllers/interacaoLeadUpdateController';
import { interacaoLeadDeleteManyMcpTool } from './controllers/interacaoLeadDeleteManyController';
import { interacaoLeadArchiveManyMcpTool } from './controllers/interacaoLeadArchiveManyController';
import { interacaoLeadRestoreManyMcpTool } from './controllers/interacaoLeadRestoreManyController';
import { interacaoLeadAutocompleteMcpTool } from './controllers/interacaoLeadAutocompleteController';

export function getInteracaoLeadMcpTools(dictionary: Dictionary): McpTool[] {
  return [
    interacaoLeadFindManyMcpTool(dictionary),
    interacaoLeadFindMcpTool(dictionary),
    interacaoLeadCreateMcpTool(dictionary),
    interacaoLeadUpdateMcpTool(dictionary),
    interacaoLeadDeleteManyMcpTool(dictionary),
    interacaoLeadArchiveManyMcpTool(dictionary),
    interacaoLeadRestoreManyMcpTool(dictionary),
    interacaoLeadAutocompleteMcpTool(dictionary),
  ];
}
