import { buildPaths } from '../../shared/openapi/routeToPath';
import { recursoHidricoRuralAutocompleteApiDoc } from './controllers/recursoHidricoRuralAutocompleteController';
import { recursoHidricoRuralCreateApiDoc } from './controllers/recursoHidricoRuralCreateController';
import { recursoHidricoRuralDeleteManyApiDoc } from './controllers/recursoHidricoRuralDeleteManyController';
import { recursoHidricoRuralFindApiDoc } from './controllers/recursoHidricoRuralFindController';
import { recursoHidricoRuralFindManyApiDoc } from './controllers/recursoHidricoRuralFindManyController';
import { recursoHidricoRuralImportApiDoc } from './controllers/recursoHidricoRuralImporterController';
import { recursoHidricoRuralUpdateApiDoc } from './controllers/recursoHidricoRuralUpdateController';
import { recursoHidricoRuralArchiveManyApiDoc } from './controllers/recursoHidricoRuralArchiveManyController';
import { recursoHidricoRuralRestoreManyApiDoc } from './controllers/recursoHidricoRuralRestoreManyController';

export function getRecursoHidricoRuralPaths() {
  return buildPaths('RecursoHidricoRural', [
    recursoHidricoRuralAutocompleteApiDoc,
    recursoHidricoRuralCreateApiDoc,
    recursoHidricoRuralArchiveManyApiDoc,
    recursoHidricoRuralRestoreManyApiDoc,
    recursoHidricoRuralDeleteManyApiDoc,
    recursoHidricoRuralFindApiDoc,
    recursoHidricoRuralFindManyApiDoc,
    recursoHidricoRuralUpdateApiDoc,
    recursoHidricoRuralImportApiDoc,
  ]);
}
