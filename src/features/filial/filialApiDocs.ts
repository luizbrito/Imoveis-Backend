import { buildPaths } from '../../shared/openapi/routeToPath';
import { filialAutocompleteApiDoc } from './controllers/filialAutocompleteController';
import { filialCreateApiDoc } from './controllers/filialCreateController';
import { filialDeleteManyApiDoc } from './controllers/filialDeleteManyController';
import { filialFindApiDoc } from './controllers/filialFindController';
import { filialFindManyApiDoc } from './controllers/filialFindManyController';
import { filialImportApiDoc } from './controllers/filialImporterController';
import { filialUpdateApiDoc } from './controllers/filialUpdateController';
import { filialArchiveManyApiDoc } from './controllers/filialArchiveManyController';
import { filialRestoreManyApiDoc } from './controllers/filialRestoreManyController';

export function getFilialPaths() {
  return buildPaths('Filial', [
    filialAutocompleteApiDoc,
    filialCreateApiDoc,
    filialArchiveManyApiDoc,
    filialRestoreManyApiDoc,
    filialDeleteManyApiDoc,
    filialFindApiDoc,
    filialFindManyApiDoc,
    filialUpdateApiDoc,
    filialImportApiDoc,
  ]);
}
