import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { certificacaoSustentabilidadeRuralFindManyMcpTool } from './controllers/certificacaoSustentabilidadeRuralFindManyController';
import { certificacaoSustentabilidadeRuralFindMcpTool } from './controllers/certificacaoSustentabilidadeRuralFindController';
import { certificacaoSustentabilidadeRuralCreateMcpTool } from './controllers/certificacaoSustentabilidadeRuralCreateController';
import { certificacaoSustentabilidadeRuralUpdateMcpTool } from './controllers/certificacaoSustentabilidadeRuralUpdateController';
import { certificacaoSustentabilidadeRuralDeleteManyMcpTool } from './controllers/certificacaoSustentabilidadeRuralDeleteManyController';
import { certificacaoSustentabilidadeRuralArchiveManyMcpTool } from './controllers/certificacaoSustentabilidadeRuralArchiveManyController';
import { certificacaoSustentabilidadeRuralRestoreManyMcpTool } from './controllers/certificacaoSustentabilidadeRuralRestoreManyController';
import { certificacaoSustentabilidadeRuralAutocompleteMcpTool } from './controllers/certificacaoSustentabilidadeRuralAutocompleteController';

export function getCertificacaoSustentabilidadeRuralMcpTools(
  dictionary: Dictionary,
): McpTool[] {
  return [
    certificacaoSustentabilidadeRuralFindManyMcpTool(dictionary),
    certificacaoSustentabilidadeRuralFindMcpTool(dictionary),
    certificacaoSustentabilidadeRuralCreateMcpTool(dictionary),
    certificacaoSustentabilidadeRuralUpdateMcpTool(dictionary),
    certificacaoSustentabilidadeRuralDeleteManyMcpTool(dictionary),
    certificacaoSustentabilidadeRuralArchiveManyMcpTool(dictionary),
    certificacaoSustentabilidadeRuralRestoreManyMcpTool(dictionary),
    certificacaoSustentabilidadeRuralAutocompleteMcpTool(dictionary),
  ];
}
