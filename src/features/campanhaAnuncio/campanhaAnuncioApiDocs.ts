import { buildPaths } from '../../shared/openapi/routeToPath';
import { campanhaAnuncioAutocompleteApiDoc } from './controllers/campanhaAnuncioAutocompleteController';
import { campanhaAnuncioCreateApiDoc } from './controllers/campanhaAnuncioCreateController';
import { campanhaAnuncioDeleteManyApiDoc } from './controllers/campanhaAnuncioDeleteManyController';
import { campanhaAnuncioFindApiDoc } from './controllers/campanhaAnuncioFindController';
import { campanhaAnuncioFindManyApiDoc } from './controllers/campanhaAnuncioFindManyController';
import { campanhaAnuncioImportApiDoc } from './controllers/campanhaAnuncioImporterController';
import { campanhaAnuncioUpdateApiDoc } from './controllers/campanhaAnuncioUpdateController';
import { campanhaAnuncioArchiveManyApiDoc } from './controllers/campanhaAnuncioArchiveManyController';
import { campanhaAnuncioRestoreManyApiDoc } from './controllers/campanhaAnuncioRestoreManyController';

export function getCampanhaAnuncioPaths() {
  return buildPaths('CampanhaAnuncio', [
    campanhaAnuncioAutocompleteApiDoc,
    campanhaAnuncioCreateApiDoc,
    campanhaAnuncioArchiveManyApiDoc,
    campanhaAnuncioRestoreManyApiDoc,
    campanhaAnuncioDeleteManyApiDoc,
    campanhaAnuncioFindApiDoc,
    campanhaAnuncioFindManyApiDoc,
    campanhaAnuncioUpdateApiDoc,
    campanhaAnuncioImportApiDoc,
  ]);
}
