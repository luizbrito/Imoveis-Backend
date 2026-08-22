import { buildPaths } from '../../shared/openapi/routeToPath';
import { ordemServicoAutocompleteApiDoc } from './controllers/ordemServicoAutocompleteController';
import { ordemServicoCreateApiDoc } from './controllers/ordemServicoCreateController';
import { ordemServicoDeleteManyApiDoc } from './controllers/ordemServicoDeleteManyController';
import { ordemServicoFindApiDoc } from './controllers/ordemServicoFindController';
import { ordemServicoFindManyApiDoc } from './controllers/ordemServicoFindManyController';
import { ordemServicoImportApiDoc } from './controllers/ordemServicoImporterController';
import { ordemServicoUpdateApiDoc } from './controllers/ordemServicoUpdateController';
import { ordemServicoArchiveManyApiDoc } from './controllers/ordemServicoArchiveManyController';
import { ordemServicoRestoreManyApiDoc } from './controllers/ordemServicoRestoreManyController';

export function getOrdemServicoPaths() {
  return buildPaths('OrdemServico', [
    ordemServicoAutocompleteApiDoc,
    ordemServicoCreateApiDoc,
    ordemServicoArchiveManyApiDoc,
    ordemServicoRestoreManyApiDoc,
    ordemServicoDeleteManyApiDoc,
    ordemServicoFindApiDoc,
    ordemServicoFindManyApiDoc,
    ordemServicoUpdateApiDoc,
    ordemServicoImportApiDoc,
  ]);
}
