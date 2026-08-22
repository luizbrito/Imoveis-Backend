import { buildPaths } from '../../shared/openapi/routeToPath';
import { riscoRuralAutocompleteApiDoc } from './controllers/riscoRuralAutocompleteController';
import { riscoRuralCreateApiDoc } from './controllers/riscoRuralCreateController';
import { riscoRuralDeleteManyApiDoc } from './controllers/riscoRuralDeleteManyController';
import { riscoRuralFindApiDoc } from './controllers/riscoRuralFindController';
import { riscoRuralFindManyApiDoc } from './controllers/riscoRuralFindManyController';
import { riscoRuralImportApiDoc } from './controllers/riscoRuralImporterController';
import { riscoRuralUpdateApiDoc } from './controllers/riscoRuralUpdateController';
import { riscoRuralArchiveManyApiDoc } from './controllers/riscoRuralArchiveManyController';
import { riscoRuralRestoreManyApiDoc } from './controllers/riscoRuralRestoreManyController';

export function getRiscoRuralPaths() {
  return buildPaths('RiscoRural', [
    riscoRuralAutocompleteApiDoc,
    riscoRuralCreateApiDoc,
    riscoRuralArchiveManyApiDoc,
    riscoRuralRestoreManyApiDoc,
    riscoRuralDeleteManyApiDoc,
    riscoRuralFindApiDoc,
    riscoRuralFindManyApiDoc,
    riscoRuralUpdateApiDoc,
    riscoRuralImportApiDoc,
  ]);
}
