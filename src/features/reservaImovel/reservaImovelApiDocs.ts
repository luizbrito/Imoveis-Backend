import { buildPaths } from '../../shared/openapi/routeToPath';
import { reservaImovelAutocompleteApiDoc } from './controllers/reservaImovelAutocompleteController';
import { reservaImovelCreateApiDoc } from './controllers/reservaImovelCreateController';
import { reservaImovelDeleteManyApiDoc } from './controllers/reservaImovelDeleteManyController';
import { reservaImovelFindApiDoc } from './controllers/reservaImovelFindController';
import { reservaImovelFindManyApiDoc } from './controllers/reservaImovelFindManyController';
import { reservaImovelImportApiDoc } from './controllers/reservaImovelImporterController';
import { reservaImovelUpdateApiDoc } from './controllers/reservaImovelUpdateController';
import { reservaImovelArchiveManyApiDoc } from './controllers/reservaImovelArchiveManyController';
import { reservaImovelRestoreManyApiDoc } from './controllers/reservaImovelRestoreManyController';

export function getReservaImovelPaths() {
  return buildPaths('ReservaImovel', [
    reservaImovelAutocompleteApiDoc,
    reservaImovelCreateApiDoc,
    reservaImovelArchiveManyApiDoc,
    reservaImovelRestoreManyApiDoc,
    reservaImovelDeleteManyApiDoc,
    reservaImovelFindApiDoc,
    reservaImovelFindManyApiDoc,
    reservaImovelUpdateApiDoc,
    reservaImovelImportApiDoc,
  ]);
}
