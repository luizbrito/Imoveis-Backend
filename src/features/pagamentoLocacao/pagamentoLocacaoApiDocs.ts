import { buildPaths } from '../../shared/openapi/routeToPath';
import { pagamentoLocacaoAutocompleteApiDoc } from './controllers/pagamentoLocacaoAutocompleteController';
import { pagamentoLocacaoCreateApiDoc } from './controllers/pagamentoLocacaoCreateController';
import { pagamentoLocacaoDeleteManyApiDoc } from './controllers/pagamentoLocacaoDeleteManyController';
import { pagamentoLocacaoFindApiDoc } from './controllers/pagamentoLocacaoFindController';
import { pagamentoLocacaoFindManyApiDoc } from './controllers/pagamentoLocacaoFindManyController';
import { pagamentoLocacaoImportApiDoc } from './controllers/pagamentoLocacaoImporterController';
import { pagamentoLocacaoUpdateApiDoc } from './controllers/pagamentoLocacaoUpdateController';
import { pagamentoLocacaoArchiveManyApiDoc } from './controllers/pagamentoLocacaoArchiveManyController';
import { pagamentoLocacaoRestoreManyApiDoc } from './controllers/pagamentoLocacaoRestoreManyController';

export function getPagamentoLocacaoPaths() {
  return buildPaths('PagamentoLocacao', [
    pagamentoLocacaoAutocompleteApiDoc,
    pagamentoLocacaoCreateApiDoc,
    pagamentoLocacaoArchiveManyApiDoc,
    pagamentoLocacaoRestoreManyApiDoc,
    pagamentoLocacaoDeleteManyApiDoc,
    pagamentoLocacaoFindApiDoc,
    pagamentoLocacaoFindManyApiDoc,
    pagamentoLocacaoUpdateApiDoc,
    pagamentoLocacaoImportApiDoc,
  ]);
}
