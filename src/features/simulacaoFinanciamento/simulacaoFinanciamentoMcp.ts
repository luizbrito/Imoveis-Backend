import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { simulacaoFinanciamentoFindManyMcpTool } from './controllers/simulacaoFinanciamentoFindManyController';
import { simulacaoFinanciamentoFindMcpTool } from './controllers/simulacaoFinanciamentoFindController';
import { simulacaoFinanciamentoCreateMcpTool } from './controllers/simulacaoFinanciamentoCreateController';
import { simulacaoFinanciamentoUpdateMcpTool } from './controllers/simulacaoFinanciamentoUpdateController';
import { simulacaoFinanciamentoDeleteManyMcpTool } from './controllers/simulacaoFinanciamentoDeleteManyController';
import { simulacaoFinanciamentoArchiveManyMcpTool } from './controllers/simulacaoFinanciamentoArchiveManyController';
import { simulacaoFinanciamentoRestoreManyMcpTool } from './controllers/simulacaoFinanciamentoRestoreManyController';
import { simulacaoFinanciamentoAutocompleteMcpTool } from './controllers/simulacaoFinanciamentoAutocompleteController';

export function getSimulacaoFinanciamentoMcpTools(
  dictionary: Dictionary,
): McpTool[] {
  return [
    simulacaoFinanciamentoFindManyMcpTool(dictionary),
    simulacaoFinanciamentoFindMcpTool(dictionary),
    simulacaoFinanciamentoCreateMcpTool(dictionary),
    simulacaoFinanciamentoUpdateMcpTool(dictionary),
    simulacaoFinanciamentoDeleteManyMcpTool(dictionary),
    simulacaoFinanciamentoArchiveManyMcpTool(dictionary),
    simulacaoFinanciamentoRestoreManyMcpTool(dictionary),
    simulacaoFinanciamentoAutocompleteMcpTool(dictionary),
  ];
}
