import { buildPaths } from '../../shared/openapi/routeToPath';
import { chaveImovelAutocompleteApiDoc } from './controllers/chaveImovelAutocompleteController';
import { chaveImovelCreateApiDoc } from './controllers/chaveImovelCreateController';
import { chaveImovelDeleteManyApiDoc } from './controllers/chaveImovelDeleteManyController';
import { chaveImovelFindApiDoc } from './controllers/chaveImovelFindController';
import { chaveImovelFindManyApiDoc } from './controllers/chaveImovelFindManyController';
import { chaveImovelImportApiDoc } from './controllers/chaveImovelImporterController';
import { chaveImovelUpdateApiDoc } from './controllers/chaveImovelUpdateController';
import { chaveImovelArchiveManyApiDoc } from './controllers/chaveImovelArchiveManyController';
import { chaveImovelRestoreManyApiDoc } from './controllers/chaveImovelRestoreManyController';

export function getChaveImovelPaths() {
  return buildPaths('ChaveImovel', [
    chaveImovelAutocompleteApiDoc,
    chaveImovelCreateApiDoc,
    chaveImovelArchiveManyApiDoc,
    chaveImovelRestoreManyApiDoc,
    chaveImovelDeleteManyApiDoc,
    chaveImovelFindApiDoc,
    chaveImovelFindManyApiDoc,
    chaveImovelUpdateApiDoc,
    chaveImovelImportApiDoc,
  ]);
}
