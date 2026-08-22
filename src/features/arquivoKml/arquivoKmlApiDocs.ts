import { buildPaths } from '../../shared/openapi/routeToPath';
import { arquivoKmlAutocompleteApiDoc } from './controllers/arquivoKmlAutocompleteController';
import { arquivoKmlCreateApiDoc } from './controllers/arquivoKmlCreateController';
import { arquivoKmlDeleteManyApiDoc } from './controllers/arquivoKmlDeleteManyController';
import { arquivoKmlFindApiDoc } from './controllers/arquivoKmlFindController';
import { arquivoKmlFindManyApiDoc } from './controllers/arquivoKmlFindManyController';
import { arquivoKmlImportApiDoc } from './controllers/arquivoKmlImporterController';
import { arquivoKmlUpdateApiDoc } from './controllers/arquivoKmlUpdateController';
import { arquivoKmlArchiveManyApiDoc } from './controllers/arquivoKmlArchiveManyController';
import { arquivoKmlRestoreManyApiDoc } from './controllers/arquivoKmlRestoreManyController';

export function getArquivoKmlPaths() {
  return buildPaths('ArquivoKml', [
    arquivoKmlAutocompleteApiDoc,
    arquivoKmlCreateApiDoc,
    arquivoKmlArchiveManyApiDoc,
    arquivoKmlRestoreManyApiDoc,
    arquivoKmlDeleteManyApiDoc,
    arquivoKmlFindApiDoc,
    arquivoKmlFindManyApiDoc,
    arquivoKmlUpdateApiDoc,
    arquivoKmlImportApiDoc,
  ]);
}
