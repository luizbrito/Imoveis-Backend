import { buildPaths } from '../../shared/openapi/routeToPath';
import { reajusteLocacaoAutocompleteApiDoc } from './controllers/reajusteLocacaoAutocompleteController';
import { reajusteLocacaoCreateApiDoc } from './controllers/reajusteLocacaoCreateController';
import { reajusteLocacaoDeleteManyApiDoc } from './controllers/reajusteLocacaoDeleteManyController';
import { reajusteLocacaoFindApiDoc } from './controllers/reajusteLocacaoFindController';
import { reajusteLocacaoFindManyApiDoc } from './controllers/reajusteLocacaoFindManyController';
import { reajusteLocacaoImportApiDoc } from './controllers/reajusteLocacaoImporterController';
import { reajusteLocacaoUpdateApiDoc } from './controllers/reajusteLocacaoUpdateController';
import { reajusteLocacaoArchiveManyApiDoc } from './controllers/reajusteLocacaoArchiveManyController';
import { reajusteLocacaoRestoreManyApiDoc } from './controllers/reajusteLocacaoRestoreManyController';

export function getReajusteLocacaoPaths() {
  return buildPaths('ReajusteLocacao', [
    reajusteLocacaoAutocompleteApiDoc,
    reajusteLocacaoCreateApiDoc,
    reajusteLocacaoArchiveManyApiDoc,
    reajusteLocacaoRestoreManyApiDoc,
    reajusteLocacaoDeleteManyApiDoc,
    reajusteLocacaoFindApiDoc,
    reajusteLocacaoFindManyApiDoc,
    reajusteLocacaoUpdateApiDoc,
    reajusteLocacaoImportApiDoc,
  ]);
}
