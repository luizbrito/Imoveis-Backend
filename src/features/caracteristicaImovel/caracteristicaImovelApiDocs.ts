import { buildPaths } from '../../shared/openapi/routeToPath';
import { caracteristicaImovelAutocompleteApiDoc } from './controllers/caracteristicaImovelAutocompleteController';
import { caracteristicaImovelCreateApiDoc } from './controllers/caracteristicaImovelCreateController';
import { caracteristicaImovelDeleteManyApiDoc } from './controllers/caracteristicaImovelDeleteManyController';
import { caracteristicaImovelFindApiDoc } from './controllers/caracteristicaImovelFindController';
import { caracteristicaImovelFindManyApiDoc } from './controllers/caracteristicaImovelFindManyController';
import { caracteristicaImovelImportApiDoc } from './controllers/caracteristicaImovelImporterController';
import { caracteristicaImovelUpdateApiDoc } from './controllers/caracteristicaImovelUpdateController';
import { caracteristicaImovelArchiveManyApiDoc } from './controllers/caracteristicaImovelArchiveManyController';
import { caracteristicaImovelRestoreManyApiDoc } from './controllers/caracteristicaImovelRestoreManyController';

export function getCaracteristicaImovelPaths() {
  return buildPaths('CaracteristicaImovel', [
    caracteristicaImovelAutocompleteApiDoc,
    caracteristicaImovelCreateApiDoc,
    caracteristicaImovelArchiveManyApiDoc,
    caracteristicaImovelRestoreManyApiDoc,
    caracteristicaImovelDeleteManyApiDoc,
    caracteristicaImovelFindApiDoc,
    caracteristicaImovelFindManyApiDoc,
    caracteristicaImovelUpdateApiDoc,
    caracteristicaImovelImportApiDoc,
  ]);
}
