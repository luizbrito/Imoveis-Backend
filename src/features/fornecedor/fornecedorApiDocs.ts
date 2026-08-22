import { buildPaths } from '../../shared/openapi/routeToPath';
import { fornecedorAutocompleteApiDoc } from './controllers/fornecedorAutocompleteController';
import { fornecedorCreateApiDoc } from './controllers/fornecedorCreateController';
import { fornecedorDeleteManyApiDoc } from './controllers/fornecedorDeleteManyController';
import { fornecedorFindApiDoc } from './controllers/fornecedorFindController';
import { fornecedorFindManyApiDoc } from './controllers/fornecedorFindManyController';
import { fornecedorImportApiDoc } from './controllers/fornecedorImporterController';
import { fornecedorUpdateApiDoc } from './controllers/fornecedorUpdateController';
import { fornecedorArchiveManyApiDoc } from './controllers/fornecedorArchiveManyController';
import { fornecedorRestoreManyApiDoc } from './controllers/fornecedorRestoreManyController';

export function getFornecedorPaths() {
  return buildPaths('Fornecedor', [
    fornecedorAutocompleteApiDoc,
    fornecedorCreateApiDoc,
    fornecedorArchiveManyApiDoc,
    fornecedorRestoreManyApiDoc,
    fornecedorDeleteManyApiDoc,
    fornecedorFindApiDoc,
    fornecedorFindManyApiDoc,
    fornecedorUpdateApiDoc,
    fornecedorImportApiDoc,
  ]);
}
