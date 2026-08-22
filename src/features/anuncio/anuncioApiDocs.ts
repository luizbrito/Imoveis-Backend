import { buildPaths } from '../../shared/openapi/routeToPath';
import { anuncioAutocompleteApiDoc } from './controllers/anuncioAutocompleteController';
import { anuncioCreateApiDoc } from './controllers/anuncioCreateController';
import { anuncioDeleteManyApiDoc } from './controllers/anuncioDeleteManyController';
import { anuncioFindApiDoc } from './controllers/anuncioFindController';
import { anuncioFindManyApiDoc } from './controllers/anuncioFindManyController';
import { anuncioImportApiDoc } from './controllers/anuncioImporterController';
import { anuncioUpdateApiDoc } from './controllers/anuncioUpdateController';
import { anuncioArchiveManyApiDoc } from './controllers/anuncioArchiveManyController';
import { anuncioRestoreManyApiDoc } from './controllers/anuncioRestoreManyController';

export function getAnuncioPaths() {
  return buildPaths('Anuncio', [
    anuncioAutocompleteApiDoc,
    anuncioCreateApiDoc,
    anuncioArchiveManyApiDoc,
    anuncioRestoreManyApiDoc,
    anuncioDeleteManyApiDoc,
    anuncioFindApiDoc,
    anuncioFindManyApiDoc,
    anuncioUpdateApiDoc,
    anuncioImportApiDoc,
  ]);
}
