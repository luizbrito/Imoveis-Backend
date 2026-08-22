import { buildPaths } from '../../shared/openapi/routeToPath';
import { comissaoAutocompleteApiDoc } from './controllers/comissaoAutocompleteController';
import { comissaoCreateApiDoc } from './controllers/comissaoCreateController';
import { comissaoDeleteManyApiDoc } from './controllers/comissaoDeleteManyController';
import { comissaoFindApiDoc } from './controllers/comissaoFindController';
import { comissaoFindManyApiDoc } from './controllers/comissaoFindManyController';
import { comissaoImportApiDoc } from './controllers/comissaoImporterController';
import { comissaoUpdateApiDoc } from './controllers/comissaoUpdateController';
import { comissaoArchiveManyApiDoc } from './controllers/comissaoArchiveManyController';
import { comissaoRestoreManyApiDoc } from './controllers/comissaoRestoreManyController';

export function getComissaoPaths() {
  return buildPaths('Comissao', [
    comissaoAutocompleteApiDoc,
    comissaoCreateApiDoc,
    comissaoArchiveManyApiDoc,
    comissaoRestoreManyApiDoc,
    comissaoDeleteManyApiDoc,
    comissaoFindApiDoc,
    comissaoFindManyApiDoc,
    comissaoUpdateApiDoc,
    comissaoImportApiDoc,
  ]);
}
