import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { ocorrenciaImovelFindManyMcpTool } from './controllers/ocorrenciaImovelFindManyController';
import { ocorrenciaImovelFindMcpTool } from './controllers/ocorrenciaImovelFindController';
import { ocorrenciaImovelCreateMcpTool } from './controllers/ocorrenciaImovelCreateController';
import { ocorrenciaImovelUpdateMcpTool } from './controllers/ocorrenciaImovelUpdateController';
import { ocorrenciaImovelDeleteManyMcpTool } from './controllers/ocorrenciaImovelDeleteManyController';
import { ocorrenciaImovelArchiveManyMcpTool } from './controllers/ocorrenciaImovelArchiveManyController';
import { ocorrenciaImovelRestoreManyMcpTool } from './controllers/ocorrenciaImovelRestoreManyController';
import { ocorrenciaImovelAutocompleteMcpTool } from './controllers/ocorrenciaImovelAutocompleteController';

export function getOcorrenciaImovelMcpTools(dictionary: Dictionary): McpTool[] {
  return [
    ocorrenciaImovelFindManyMcpTool(dictionary),
    ocorrenciaImovelFindMcpTool(dictionary),
    ocorrenciaImovelCreateMcpTool(dictionary),
    ocorrenciaImovelUpdateMcpTool(dictionary),
    ocorrenciaImovelDeleteManyMcpTool(dictionary),
    ocorrenciaImovelArchiveManyMcpTool(dictionary),
    ocorrenciaImovelRestoreManyMcpTool(dictionary),
    ocorrenciaImovelAutocompleteMcpTool(dictionary),
  ];
}
