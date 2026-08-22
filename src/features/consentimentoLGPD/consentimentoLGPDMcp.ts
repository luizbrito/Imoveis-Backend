import { Dictionary } from '../../translation/locales';
import { McpTool } from '../mcp/mcpTypes';
import { consentimentoLGPDFindManyMcpTool } from './controllers/consentimentoLGPDFindManyController';
import { consentimentoLGPDFindMcpTool } from './controllers/consentimentoLGPDFindController';
import { consentimentoLGPDCreateMcpTool } from './controllers/consentimentoLGPDCreateController';
import { consentimentoLGPDUpdateMcpTool } from './controllers/consentimentoLGPDUpdateController';
import { consentimentoLGPDDeleteManyMcpTool } from './controllers/consentimentoLGPDDeleteManyController';
import { consentimentoLGPDArchiveManyMcpTool } from './controllers/consentimentoLGPDArchiveManyController';
import { consentimentoLGPDRestoreManyMcpTool } from './controllers/consentimentoLGPDRestoreManyController';
import { consentimentoLGPDAutocompleteMcpTool } from './controllers/consentimentoLGPDAutocompleteController';

export function getConsentimentoLGPDMcpTools(
  dictionary: Dictionary,
): McpTool[] {
  return [
    consentimentoLGPDFindManyMcpTool(dictionary),
    consentimentoLGPDFindMcpTool(dictionary),
    consentimentoLGPDCreateMcpTool(dictionary),
    consentimentoLGPDUpdateMcpTool(dictionary),
    consentimentoLGPDDeleteManyMcpTool(dictionary),
    consentimentoLGPDArchiveManyMcpTool(dictionary),
    consentimentoLGPDRestoreManyMcpTool(dictionary),
    consentimentoLGPDAutocompleteMcpTool(dictionary),
  ];
}
