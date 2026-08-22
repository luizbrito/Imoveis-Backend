import { buildPaths } from '../../shared/openapi/routeToPath';
import { logisticaRuralAutocompleteApiDoc } from './controllers/logisticaRuralAutocompleteController';
import { logisticaRuralCreateApiDoc } from './controllers/logisticaRuralCreateController';
import { logisticaRuralDeleteManyApiDoc } from './controllers/logisticaRuralDeleteManyController';
import { logisticaRuralFindApiDoc } from './controllers/logisticaRuralFindController';
import { logisticaRuralFindManyApiDoc } from './controllers/logisticaRuralFindManyController';
import { logisticaRuralImportApiDoc } from './controllers/logisticaRuralImporterController';
import { logisticaRuralUpdateApiDoc } from './controllers/logisticaRuralUpdateController';
import { logisticaRuralArchiveManyApiDoc } from './controllers/logisticaRuralArchiveManyController';
import { logisticaRuralRestoreManyApiDoc } from './controllers/logisticaRuralRestoreManyController';

export function getLogisticaRuralPaths() {
  return buildPaths('LogisticaRural', [
    logisticaRuralAutocompleteApiDoc,
    logisticaRuralCreateApiDoc,
    logisticaRuralArchiveManyApiDoc,
    logisticaRuralRestoreManyApiDoc,
    logisticaRuralDeleteManyApiDoc,
    logisticaRuralFindApiDoc,
    logisticaRuralFindManyApiDoc,
    logisticaRuralUpdateApiDoc,
    logisticaRuralImportApiDoc,
  ]);
}
