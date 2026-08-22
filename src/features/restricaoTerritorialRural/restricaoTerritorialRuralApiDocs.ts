import { buildPaths } from '../../shared/openapi/routeToPath';
import { restricaoTerritorialRuralAutocompleteApiDoc } from './controllers/restricaoTerritorialRuralAutocompleteController';
import { restricaoTerritorialRuralCreateApiDoc } from './controllers/restricaoTerritorialRuralCreateController';
import { restricaoTerritorialRuralDeleteManyApiDoc } from './controllers/restricaoTerritorialRuralDeleteManyController';
import { restricaoTerritorialRuralFindApiDoc } from './controllers/restricaoTerritorialRuralFindController';
import { restricaoTerritorialRuralFindManyApiDoc } from './controllers/restricaoTerritorialRuralFindManyController';
import { restricaoTerritorialRuralImportApiDoc } from './controllers/restricaoTerritorialRuralImporterController';
import { restricaoTerritorialRuralUpdateApiDoc } from './controllers/restricaoTerritorialRuralUpdateController';
import { restricaoTerritorialRuralArchiveManyApiDoc } from './controllers/restricaoTerritorialRuralArchiveManyController';
import { restricaoTerritorialRuralRestoreManyApiDoc } from './controllers/restricaoTerritorialRuralRestoreManyController';

export function getRestricaoTerritorialRuralPaths() {
  return buildPaths('RestricaoTerritorialRural', [
    restricaoTerritorialRuralAutocompleteApiDoc,
    restricaoTerritorialRuralCreateApiDoc,
    restricaoTerritorialRuralArchiveManyApiDoc,
    restricaoTerritorialRuralRestoreManyApiDoc,
    restricaoTerritorialRuralDeleteManyApiDoc,
    restricaoTerritorialRuralFindApiDoc,
    restricaoTerritorialRuralFindManyApiDoc,
    restricaoTerritorialRuralUpdateApiDoc,
    restricaoTerritorialRuralImportApiDoc,
  ]);
}
