import { buildPaths } from '../../shared/openapi/routeToPath';
import { topografiaRuralAutocompleteApiDoc } from './controllers/topografiaRuralAutocompleteController';
import { topografiaRuralCreateApiDoc } from './controllers/topografiaRuralCreateController';
import { topografiaRuralDeleteManyApiDoc } from './controllers/topografiaRuralDeleteManyController';
import { topografiaRuralFindApiDoc } from './controllers/topografiaRuralFindController';
import { topografiaRuralFindManyApiDoc } from './controllers/topografiaRuralFindManyController';
import { topografiaRuralImportApiDoc } from './controllers/topografiaRuralImporterController';
import { topografiaRuralUpdateApiDoc } from './controllers/topografiaRuralUpdateController';
import { topografiaRuralArchiveManyApiDoc } from './controllers/topografiaRuralArchiveManyController';
import { topografiaRuralRestoreManyApiDoc } from './controllers/topografiaRuralRestoreManyController';

export function getTopografiaRuralPaths() {
  return buildPaths('TopografiaRural', [
    topografiaRuralAutocompleteApiDoc,
    topografiaRuralCreateApiDoc,
    topografiaRuralArchiveManyApiDoc,
    topografiaRuralRestoreManyApiDoc,
    topografiaRuralDeleteManyApiDoc,
    topografiaRuralFindApiDoc,
    topografiaRuralFindManyApiDoc,
    topografiaRuralUpdateApiDoc,
    topografiaRuralImportApiDoc,
  ]);
}
