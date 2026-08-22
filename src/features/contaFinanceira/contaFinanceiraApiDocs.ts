import { buildPaths } from '../../shared/openapi/routeToPath';
import { contaFinanceiraAutocompleteApiDoc } from './controllers/contaFinanceiraAutocompleteController';
import { contaFinanceiraCreateApiDoc } from './controllers/contaFinanceiraCreateController';
import { contaFinanceiraDeleteManyApiDoc } from './controllers/contaFinanceiraDeleteManyController';
import { contaFinanceiraFindApiDoc } from './controllers/contaFinanceiraFindController';
import { contaFinanceiraFindManyApiDoc } from './controllers/contaFinanceiraFindManyController';
import { contaFinanceiraImportApiDoc } from './controllers/contaFinanceiraImporterController';
import { contaFinanceiraUpdateApiDoc } from './controllers/contaFinanceiraUpdateController';
import { contaFinanceiraArchiveManyApiDoc } from './controllers/contaFinanceiraArchiveManyController';
import { contaFinanceiraRestoreManyApiDoc } from './controllers/contaFinanceiraRestoreManyController';

export function getContaFinanceiraPaths() {
  return buildPaths('ContaFinanceira', [
    contaFinanceiraAutocompleteApiDoc,
    contaFinanceiraCreateApiDoc,
    contaFinanceiraArchiveManyApiDoc,
    contaFinanceiraRestoreManyApiDoc,
    contaFinanceiraDeleteManyApiDoc,
    contaFinanceiraFindApiDoc,
    contaFinanceiraFindManyApiDoc,
    contaFinanceiraUpdateApiDoc,
    contaFinanceiraImportApiDoc,
  ]);
}
