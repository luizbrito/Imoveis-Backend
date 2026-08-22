import { buildPaths } from '../../shared/openapi/routeToPath';
import { tipoSoloAutocompleteApiDoc } from './controllers/tipoSoloAutocompleteController';
import { tipoSoloCreateApiDoc } from './controllers/tipoSoloCreateController';
import { tipoSoloDeleteManyApiDoc } from './controllers/tipoSoloDeleteManyController';
import { tipoSoloFindApiDoc } from './controllers/tipoSoloFindController';
import { tipoSoloFindManyApiDoc } from './controllers/tipoSoloFindManyController';
import { tipoSoloImportApiDoc } from './controllers/tipoSoloImporterController';
import { tipoSoloUpdateApiDoc } from './controllers/tipoSoloUpdateController';
import { tipoSoloArchiveManyApiDoc } from './controllers/tipoSoloArchiveManyController';
import { tipoSoloRestoreManyApiDoc } from './controllers/tipoSoloRestoreManyController';

export function getTipoSoloPaths() {
  return buildPaths('TipoSolo', [
    tipoSoloAutocompleteApiDoc,
    tipoSoloCreateApiDoc,
    tipoSoloArchiveManyApiDoc,
    tipoSoloRestoreManyApiDoc,
    tipoSoloDeleteManyApiDoc,
    tipoSoloFindApiDoc,
    tipoSoloFindManyApiDoc,
    tipoSoloUpdateApiDoc,
    tipoSoloImportApiDoc,
  ]);
}
