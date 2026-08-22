import { buildPaths } from '../../shared/openapi/routeToPath';
import { soloImovelRuralAutocompleteApiDoc } from './controllers/soloImovelRuralAutocompleteController';
import { soloImovelRuralCreateApiDoc } from './controllers/soloImovelRuralCreateController';
import { soloImovelRuralDeleteManyApiDoc } from './controllers/soloImovelRuralDeleteManyController';
import { soloImovelRuralFindApiDoc } from './controllers/soloImovelRuralFindController';
import { soloImovelRuralFindManyApiDoc } from './controllers/soloImovelRuralFindManyController';
import { soloImovelRuralImportApiDoc } from './controllers/soloImovelRuralImporterController';
import { soloImovelRuralUpdateApiDoc } from './controllers/soloImovelRuralUpdateController';
import { soloImovelRuralArchiveManyApiDoc } from './controllers/soloImovelRuralArchiveManyController';
import { soloImovelRuralRestoreManyApiDoc } from './controllers/soloImovelRuralRestoreManyController';

export function getSoloImovelRuralPaths() {
  return buildPaths('SoloImovelRural', [
    soloImovelRuralAutocompleteApiDoc,
    soloImovelRuralCreateApiDoc,
    soloImovelRuralArchiveManyApiDoc,
    soloImovelRuralRestoreManyApiDoc,
    soloImovelRuralDeleteManyApiDoc,
    soloImovelRuralFindApiDoc,
    soloImovelRuralFindManyApiDoc,
    soloImovelRuralUpdateApiDoc,
    soloImovelRuralImportApiDoc,
  ]);
}
