import { buildPaths } from '../../shared/openapi/routeToPath';
import { itemVistoriaAutocompleteApiDoc } from './controllers/itemVistoriaAutocompleteController';
import { itemVistoriaCreateApiDoc } from './controllers/itemVistoriaCreateController';
import { itemVistoriaDeleteManyApiDoc } from './controllers/itemVistoriaDeleteManyController';
import { itemVistoriaFindApiDoc } from './controllers/itemVistoriaFindController';
import { itemVistoriaFindManyApiDoc } from './controllers/itemVistoriaFindManyController';
import { itemVistoriaImportApiDoc } from './controllers/itemVistoriaImporterController';
import { itemVistoriaUpdateApiDoc } from './controllers/itemVistoriaUpdateController';
import { itemVistoriaArchiveManyApiDoc } from './controllers/itemVistoriaArchiveManyController';
import { itemVistoriaRestoreManyApiDoc } from './controllers/itemVistoriaRestoreManyController';

export function getItemVistoriaPaths() {
  return buildPaths('ItemVistoria', [
    itemVistoriaAutocompleteApiDoc,
    itemVistoriaCreateApiDoc,
    itemVistoriaArchiveManyApiDoc,
    itemVistoriaRestoreManyApiDoc,
    itemVistoriaDeleteManyApiDoc,
    itemVistoriaFindApiDoc,
    itemVistoriaFindManyApiDoc,
    itemVistoriaUpdateApiDoc,
    itemVistoriaImportApiDoc,
  ]);
}
