import { buildPaths } from '../../shared/openapi/routeToPath';
import { midiaImovelAutocompleteApiDoc } from './controllers/midiaImovelAutocompleteController';
import { midiaImovelCreateApiDoc } from './controllers/midiaImovelCreateController';
import { midiaImovelDeleteManyApiDoc } from './controllers/midiaImovelDeleteManyController';
import { midiaImovelFindApiDoc } from './controllers/midiaImovelFindController';
import { midiaImovelFindManyApiDoc } from './controllers/midiaImovelFindManyController';
import { midiaImovelImportApiDoc } from './controllers/midiaImovelImporterController';
import { midiaImovelUpdateApiDoc } from './controllers/midiaImovelUpdateController';
import { midiaImovelArchiveManyApiDoc } from './controllers/midiaImovelArchiveManyController';
import { midiaImovelRestoreManyApiDoc } from './controllers/midiaImovelRestoreManyController';

export function getMidiaImovelPaths() {
  return buildPaths('MidiaImovel', [
    midiaImovelAutocompleteApiDoc,
    midiaImovelCreateApiDoc,
    midiaImovelArchiveManyApiDoc,
    midiaImovelRestoreManyApiDoc,
    midiaImovelDeleteManyApiDoc,
    midiaImovelFindApiDoc,
    midiaImovelFindManyApiDoc,
    midiaImovelUpdateApiDoc,
    midiaImovelImportApiDoc,
  ]);
}
