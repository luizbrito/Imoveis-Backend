import { buildPaths } from '../../shared/openapi/routeToPath';
import { despesaImovelAutocompleteApiDoc } from './controllers/despesaImovelAutocompleteController';
import { despesaImovelCreateApiDoc } from './controllers/despesaImovelCreateController';
import { despesaImovelDeleteManyApiDoc } from './controllers/despesaImovelDeleteManyController';
import { despesaImovelFindApiDoc } from './controllers/despesaImovelFindController';
import { despesaImovelFindManyApiDoc } from './controllers/despesaImovelFindManyController';
import { despesaImovelImportApiDoc } from './controllers/despesaImovelImporterController';
import { despesaImovelUpdateApiDoc } from './controllers/despesaImovelUpdateController';
import { despesaImovelArchiveManyApiDoc } from './controllers/despesaImovelArchiveManyController';
import { despesaImovelRestoreManyApiDoc } from './controllers/despesaImovelRestoreManyController';

export function getDespesaImovelPaths() {
  return buildPaths('DespesaImovel', [
    despesaImovelAutocompleteApiDoc,
    despesaImovelCreateApiDoc,
    despesaImovelArchiveManyApiDoc,
    despesaImovelRestoreManyApiDoc,
    despesaImovelDeleteManyApiDoc,
    despesaImovelFindApiDoc,
    despesaImovelFindManyApiDoc,
    despesaImovelUpdateApiDoc,
    despesaImovelImportApiDoc,
  ]);
}
