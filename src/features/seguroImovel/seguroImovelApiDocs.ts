import { buildPaths } from '../../shared/openapi/routeToPath';
import { seguroImovelAutocompleteApiDoc } from './controllers/seguroImovelAutocompleteController';
import { seguroImovelCreateApiDoc } from './controllers/seguroImovelCreateController';
import { seguroImovelDeleteManyApiDoc } from './controllers/seguroImovelDeleteManyController';
import { seguroImovelFindApiDoc } from './controllers/seguroImovelFindController';
import { seguroImovelFindManyApiDoc } from './controllers/seguroImovelFindManyController';
import { seguroImovelImportApiDoc } from './controllers/seguroImovelImporterController';
import { seguroImovelUpdateApiDoc } from './controllers/seguroImovelUpdateController';
import { seguroImovelArchiveManyApiDoc } from './controllers/seguroImovelArchiveManyController';
import { seguroImovelRestoreManyApiDoc } from './controllers/seguroImovelRestoreManyController';

export function getSeguroImovelPaths() {
  return buildPaths('SeguroImovel', [
    seguroImovelAutocompleteApiDoc,
    seguroImovelCreateApiDoc,
    seguroImovelArchiveManyApiDoc,
    seguroImovelRestoreManyApiDoc,
    seguroImovelDeleteManyApiDoc,
    seguroImovelFindApiDoc,
    seguroImovelFindManyApiDoc,
    seguroImovelUpdateApiDoc,
    seguroImovelImportApiDoc,
  ]);
}
