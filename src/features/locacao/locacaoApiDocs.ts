import { buildPaths } from '../../shared/openapi/routeToPath';
import { locacaoAutocompleteApiDoc } from './controllers/locacaoAutocompleteController';
import { locacaoCreateApiDoc } from './controllers/locacaoCreateController';
import { locacaoDeleteManyApiDoc } from './controllers/locacaoDeleteManyController';
import { locacaoFindApiDoc } from './controllers/locacaoFindController';
import { locacaoFindManyApiDoc } from './controllers/locacaoFindManyController';
import { locacaoImportApiDoc } from './controllers/locacaoImporterController';
import { locacaoUpdateApiDoc } from './controllers/locacaoUpdateController';
import { locacaoArchiveManyApiDoc } from './controllers/locacaoArchiveManyController';
import { locacaoRestoreManyApiDoc } from './controllers/locacaoRestoreManyController';

export function getLocacaoPaths() {
  return buildPaths('Locacao', [
    locacaoAutocompleteApiDoc,
    locacaoCreateApiDoc,
    locacaoArchiveManyApiDoc,
    locacaoRestoreManyApiDoc,
    locacaoDeleteManyApiDoc,
    locacaoFindApiDoc,
    locacaoFindManyApiDoc,
    locacaoUpdateApiDoc,
    locacaoImportApiDoc,
  ]);
}
