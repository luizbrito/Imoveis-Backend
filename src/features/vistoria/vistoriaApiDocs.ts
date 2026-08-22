import { buildPaths } from '../../shared/openapi/routeToPath';
import { vistoriaAutocompleteApiDoc } from './controllers/vistoriaAutocompleteController';
import { vistoriaCreateApiDoc } from './controllers/vistoriaCreateController';
import { vistoriaDeleteManyApiDoc } from './controllers/vistoriaDeleteManyController';
import { vistoriaFindApiDoc } from './controllers/vistoriaFindController';
import { vistoriaFindManyApiDoc } from './controllers/vistoriaFindManyController';
import { vistoriaImportApiDoc } from './controllers/vistoriaImporterController';
import { vistoriaUpdateApiDoc } from './controllers/vistoriaUpdateController';
import { vistoriaArchiveManyApiDoc } from './controllers/vistoriaArchiveManyController';
import { vistoriaRestoreManyApiDoc } from './controllers/vistoriaRestoreManyController';

export function getVistoriaPaths() {
  return buildPaths('Vistoria', [
    vistoriaAutocompleteApiDoc,
    vistoriaCreateApiDoc,
    vistoriaArchiveManyApiDoc,
    vistoriaRestoreManyApiDoc,
    vistoriaDeleteManyApiDoc,
    vistoriaFindApiDoc,
    vistoriaFindManyApiDoc,
    vistoriaUpdateApiDoc,
    vistoriaImportApiDoc,
  ]);
}
