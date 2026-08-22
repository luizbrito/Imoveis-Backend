import { buildPaths } from '../../shared/openapi/routeToPath';
import { consentimentoLGPDAutocompleteApiDoc } from './controllers/consentimentoLGPDAutocompleteController';
import { consentimentoLGPDCreateApiDoc } from './controllers/consentimentoLGPDCreateController';
import { consentimentoLGPDDeleteManyApiDoc } from './controllers/consentimentoLGPDDeleteManyController';
import { consentimentoLGPDFindApiDoc } from './controllers/consentimentoLGPDFindController';
import { consentimentoLGPDFindManyApiDoc } from './controllers/consentimentoLGPDFindManyController';
import { consentimentoLGPDImportApiDoc } from './controllers/consentimentoLGPDImporterController';
import { consentimentoLGPDUpdateApiDoc } from './controllers/consentimentoLGPDUpdateController';
import { consentimentoLGPDArchiveManyApiDoc } from './controllers/consentimentoLGPDArchiveManyController';
import { consentimentoLGPDRestoreManyApiDoc } from './controllers/consentimentoLGPDRestoreManyController';

export function getConsentimentoLGPDPaths() {
  return buildPaths('ConsentimentoLGPD', [
    consentimentoLGPDAutocompleteApiDoc,
    consentimentoLGPDCreateApiDoc,
    consentimentoLGPDArchiveManyApiDoc,
    consentimentoLGPDRestoreManyApiDoc,
    consentimentoLGPDDeleteManyApiDoc,
    consentimentoLGPDFindApiDoc,
    consentimentoLGPDFindManyApiDoc,
    consentimentoLGPDUpdateApiDoc,
    consentimentoLGPDImportApiDoc,
  ]);
}
