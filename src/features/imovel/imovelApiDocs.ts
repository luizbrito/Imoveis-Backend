import { buildPaths } from '../../shared/openapi/routeToPath';
import { imovelAutocompleteApiDoc } from './controllers/imovelAutocompleteController';
import { imovelCreateApiDoc } from './controllers/imovelCreateController';
import { imovelDeleteManyApiDoc } from './controllers/imovelDeleteManyController';
import { imovelFindApiDoc } from './controllers/imovelFindController';
import { imovelFindManyApiDoc } from './controllers/imovelFindManyController';
import { imovelImportApiDoc } from './controllers/imovelImporterController';
import { imovelUpdateApiDoc } from './controllers/imovelUpdateController';
import { imovelArchiveManyApiDoc } from './controllers/imovelArchiveManyController';
import { imovelRestoreManyApiDoc } from './controllers/imovelRestoreManyController';

export function getImovelPaths() {
  return buildPaths('Imovel', [
    imovelAutocompleteApiDoc,
    imovelCreateApiDoc,
    imovelArchiveManyApiDoc,
    imovelRestoreManyApiDoc,
    imovelDeleteManyApiDoc,
    imovelFindApiDoc,
    imovelFindManyApiDoc,
    imovelUpdateApiDoc,
    imovelImportApiDoc,
  ]);
}
