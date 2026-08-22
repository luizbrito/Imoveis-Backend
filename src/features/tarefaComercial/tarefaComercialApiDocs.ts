import { buildPaths } from '../../shared/openapi/routeToPath';
import { tarefaComercialAutocompleteApiDoc } from './controllers/tarefaComercialAutocompleteController';
import { tarefaComercialCreateApiDoc } from './controllers/tarefaComercialCreateController';
import { tarefaComercialDeleteManyApiDoc } from './controllers/tarefaComercialDeleteManyController';
import { tarefaComercialFindApiDoc } from './controllers/tarefaComercialFindController';
import { tarefaComercialFindManyApiDoc } from './controllers/tarefaComercialFindManyController';
import { tarefaComercialImportApiDoc } from './controllers/tarefaComercialImporterController';
import { tarefaComercialUpdateApiDoc } from './controllers/tarefaComercialUpdateController';
import { tarefaComercialArchiveManyApiDoc } from './controllers/tarefaComercialArchiveManyController';
import { tarefaComercialRestoreManyApiDoc } from './controllers/tarefaComercialRestoreManyController';

export function getTarefaComercialPaths() {
  return buildPaths('TarefaComercial', [
    tarefaComercialAutocompleteApiDoc,
    tarefaComercialCreateApiDoc,
    tarefaComercialArchiveManyApiDoc,
    tarefaComercialRestoreManyApiDoc,
    tarefaComercialDeleteManyApiDoc,
    tarefaComercialFindApiDoc,
    tarefaComercialFindManyApiDoc,
    tarefaComercialUpdateApiDoc,
    tarefaComercialImportApiDoc,
  ]);
}
