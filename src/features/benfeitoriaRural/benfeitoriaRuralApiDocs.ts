import { buildPaths } from '../../shared/openapi/routeToPath';
import { benfeitoriaRuralAutocompleteApiDoc } from './controllers/benfeitoriaRuralAutocompleteController';
import { benfeitoriaRuralCreateApiDoc } from './controllers/benfeitoriaRuralCreateController';
import { benfeitoriaRuralDeleteManyApiDoc } from './controllers/benfeitoriaRuralDeleteManyController';
import { benfeitoriaRuralFindApiDoc } from './controllers/benfeitoriaRuralFindController';
import { benfeitoriaRuralFindManyApiDoc } from './controllers/benfeitoriaRuralFindManyController';
import { benfeitoriaRuralImportApiDoc } from './controllers/benfeitoriaRuralImporterController';
import { benfeitoriaRuralUpdateApiDoc } from './controllers/benfeitoriaRuralUpdateController';
import { benfeitoriaRuralArchiveManyApiDoc } from './controllers/benfeitoriaRuralArchiveManyController';
import { benfeitoriaRuralRestoreManyApiDoc } from './controllers/benfeitoriaRuralRestoreManyController';

export function getBenfeitoriaRuralPaths() {
  return buildPaths('BenfeitoriaRural', [
    benfeitoriaRuralAutocompleteApiDoc,
    benfeitoriaRuralCreateApiDoc,
    benfeitoriaRuralArchiveManyApiDoc,
    benfeitoriaRuralRestoreManyApiDoc,
    benfeitoriaRuralDeleteManyApiDoc,
    benfeitoriaRuralFindApiDoc,
    benfeitoriaRuralFindManyApiDoc,
    benfeitoriaRuralUpdateApiDoc,
    benfeitoriaRuralImportApiDoc,
  ]);
}
