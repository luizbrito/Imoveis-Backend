import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { infraestruturaEnergiaConectividadeFindManyMcpTool } from './controllers/infraestruturaEnergiaConectividadeFindManyController';
import { infraestruturaEnergiaConectividadeFindMcpTool } from './controllers/infraestruturaEnergiaConectividadeFindController';
import { infraestruturaEnergiaConectividadeCreateMcpTool } from './controllers/infraestruturaEnergiaConectividadeCreateController';
import { infraestruturaEnergiaConectividadeUpdateMcpTool } from './controllers/infraestruturaEnergiaConectividadeUpdateController';
import { infraestruturaEnergiaConectividadeDeleteManyMcpTool } from './controllers/infraestruturaEnergiaConectividadeDeleteManyController';
import { infraestruturaEnergiaConectividadeArchiveManyMcpTool } from './controllers/infraestruturaEnergiaConectividadeArchiveManyController';
import { infraestruturaEnergiaConectividadeRestoreManyMcpTool } from './controllers/infraestruturaEnergiaConectividadeRestoreManyController';
import { infraestruturaEnergiaConectividadeAutocompleteMcpTool } from './controllers/infraestruturaEnergiaConectividadeAutocompleteController';

export function getInfraestruturaEnergiaConectividadeMcpTools(
  dictionary: Dictionary,
): McpTool[] {
  return [
    infraestruturaEnergiaConectividadeFindManyMcpTool(dictionary),
    infraestruturaEnergiaConectividadeFindMcpTool(dictionary),
    infraestruturaEnergiaConectividadeCreateMcpTool(dictionary),
    infraestruturaEnergiaConectividadeUpdateMcpTool(dictionary),
    infraestruturaEnergiaConectividadeDeleteManyMcpTool(dictionary),
    infraestruturaEnergiaConectividadeArchiveManyMcpTool(dictionary),
    infraestruturaEnergiaConectividadeRestoreManyMcpTool(dictionary),
    infraestruturaEnergiaConectividadeAutocompleteMcpTool(dictionary),
  ];
}
