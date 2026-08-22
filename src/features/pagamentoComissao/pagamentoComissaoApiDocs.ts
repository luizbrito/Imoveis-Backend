import { buildPaths } from '../../shared/openapi/routeToPath';
import { pagamentoComissaoAutocompleteApiDoc } from './controllers/pagamentoComissaoAutocompleteController';
import { pagamentoComissaoCreateApiDoc } from './controllers/pagamentoComissaoCreateController';
import { pagamentoComissaoDeleteManyApiDoc } from './controllers/pagamentoComissaoDeleteManyController';
import { pagamentoComissaoFindApiDoc } from './controllers/pagamentoComissaoFindController';
import { pagamentoComissaoFindManyApiDoc } from './controllers/pagamentoComissaoFindManyController';
import { pagamentoComissaoImportApiDoc } from './controllers/pagamentoComissaoImporterController';
import { pagamentoComissaoUpdateApiDoc } from './controllers/pagamentoComissaoUpdateController';
import { pagamentoComissaoArchiveManyApiDoc } from './controllers/pagamentoComissaoArchiveManyController';
import { pagamentoComissaoRestoreManyApiDoc } from './controllers/pagamentoComissaoRestoreManyController';

export function getPagamentoComissaoPaths() {
  return buildPaths('PagamentoComissao', [
    pagamentoComissaoAutocompleteApiDoc,
    pagamentoComissaoCreateApiDoc,
    pagamentoComissaoArchiveManyApiDoc,
    pagamentoComissaoRestoreManyApiDoc,
    pagamentoComissaoDeleteManyApiDoc,
    pagamentoComissaoFindApiDoc,
    pagamentoComissaoFindManyApiDoc,
    pagamentoComissaoUpdateApiDoc,
    pagamentoComissaoImportApiDoc,
  ]);
}
