import { buildPaths } from '../../shared/openapi/routeToPath';
import { lancamentoFinanceiroAutocompleteApiDoc } from './controllers/lancamentoFinanceiroAutocompleteController';
import { lancamentoFinanceiroCreateApiDoc } from './controllers/lancamentoFinanceiroCreateController';
import { lancamentoFinanceiroDeleteManyApiDoc } from './controllers/lancamentoFinanceiroDeleteManyController';
import { lancamentoFinanceiroFindApiDoc } from './controllers/lancamentoFinanceiroFindController';
import { lancamentoFinanceiroFindManyApiDoc } from './controllers/lancamentoFinanceiroFindManyController';
import { lancamentoFinanceiroImportApiDoc } from './controllers/lancamentoFinanceiroImporterController';
import { lancamentoFinanceiroUpdateApiDoc } from './controllers/lancamentoFinanceiroUpdateController';
import { lancamentoFinanceiroArchiveManyApiDoc } from './controllers/lancamentoFinanceiroArchiveManyController';
import { lancamentoFinanceiroRestoreManyApiDoc } from './controllers/lancamentoFinanceiroRestoreManyController';

export function getLancamentoFinanceiroPaths() {
  return buildPaths('LancamentoFinanceiro', [
    lancamentoFinanceiroAutocompleteApiDoc,
    lancamentoFinanceiroCreateApiDoc,
    lancamentoFinanceiroArchiveManyApiDoc,
    lancamentoFinanceiroRestoreManyApiDoc,
    lancamentoFinanceiroDeleteManyApiDoc,
    lancamentoFinanceiroFindApiDoc,
    lancamentoFinanceiroFindManyApiDoc,
    lancamentoFinanceiroUpdateApiDoc,
    lancamentoFinanceiroImportApiDoc,
  ]);
}
