import { buildPaths } from '../../shared/openapi/routeToPath';
import { categoriaFinanceiraAutocompleteApiDoc } from './controllers/categoriaFinanceiraAutocompleteController';
import { categoriaFinanceiraCreateApiDoc } from './controllers/categoriaFinanceiraCreateController';
import { categoriaFinanceiraDeleteManyApiDoc } from './controllers/categoriaFinanceiraDeleteManyController';
import { categoriaFinanceiraFindApiDoc } from './controllers/categoriaFinanceiraFindController';
import { categoriaFinanceiraFindManyApiDoc } from './controllers/categoriaFinanceiraFindManyController';
import { categoriaFinanceiraImportApiDoc } from './controllers/categoriaFinanceiraImporterController';
import { categoriaFinanceiraUpdateApiDoc } from './controllers/categoriaFinanceiraUpdateController';
import { categoriaFinanceiraArchiveManyApiDoc } from './controllers/categoriaFinanceiraArchiveManyController';
import { categoriaFinanceiraRestoreManyApiDoc } from './controllers/categoriaFinanceiraRestoreManyController';

export function getCategoriaFinanceiraPaths() {
  return buildPaths('CategoriaFinanceira', [
    categoriaFinanceiraAutocompleteApiDoc,
    categoriaFinanceiraCreateApiDoc,
    categoriaFinanceiraArchiveManyApiDoc,
    categoriaFinanceiraRestoreManyApiDoc,
    categoriaFinanceiraDeleteManyApiDoc,
    categoriaFinanceiraFindApiDoc,
    categoriaFinanceiraFindManyApiDoc,
    categoriaFinanceiraUpdateApiDoc,
    categoriaFinanceiraImportApiDoc,
  ]);
}
