import { buildPaths } from '../../shared/openapi/routeToPath';
import { condicaoComercialRuralAutocompleteApiDoc } from './controllers/condicaoComercialRuralAutocompleteController';
import { condicaoComercialRuralCreateApiDoc } from './controllers/condicaoComercialRuralCreateController';
import { condicaoComercialRuralDeleteManyApiDoc } from './controllers/condicaoComercialRuralDeleteManyController';
import { condicaoComercialRuralFindApiDoc } from './controllers/condicaoComercialRuralFindController';
import { condicaoComercialRuralFindManyApiDoc } from './controllers/condicaoComercialRuralFindManyController';
import { condicaoComercialRuralImportApiDoc } from './controllers/condicaoComercialRuralImporterController';
import { condicaoComercialRuralUpdateApiDoc } from './controllers/condicaoComercialRuralUpdateController';
import { condicaoComercialRuralArchiveManyApiDoc } from './controllers/condicaoComercialRuralArchiveManyController';
import { condicaoComercialRuralRestoreManyApiDoc } from './controllers/condicaoComercialRuralRestoreManyController';

export function getCondicaoComercialRuralPaths() {
  return buildPaths('CondicaoComercialRural', [
    condicaoComercialRuralAutocompleteApiDoc,
    condicaoComercialRuralCreateApiDoc,
    condicaoComercialRuralArchiveManyApiDoc,
    condicaoComercialRuralRestoreManyApiDoc,
    condicaoComercialRuralDeleteManyApiDoc,
    condicaoComercialRuralFindApiDoc,
    condicaoComercialRuralFindManyApiDoc,
    condicaoComercialRuralUpdateApiDoc,
    condicaoComercialRuralImportApiDoc,
  ]);
}
