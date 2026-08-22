import { buildPaths } from '../../shared/openapi/routeToPath';
import { imovelCaracteristicaAutocompleteApiDoc } from './controllers/imovelCaracteristicaAutocompleteController';
import { imovelCaracteristicaCreateApiDoc } from './controllers/imovelCaracteristicaCreateController';
import { imovelCaracteristicaDeleteManyApiDoc } from './controllers/imovelCaracteristicaDeleteManyController';
import { imovelCaracteristicaFindApiDoc } from './controllers/imovelCaracteristicaFindController';
import { imovelCaracteristicaFindManyApiDoc } from './controllers/imovelCaracteristicaFindManyController';
import { imovelCaracteristicaImportApiDoc } from './controllers/imovelCaracteristicaImporterController';
import { imovelCaracteristicaUpdateApiDoc } from './controllers/imovelCaracteristicaUpdateController';
import { imovelCaracteristicaArchiveManyApiDoc } from './controllers/imovelCaracteristicaArchiveManyController';
import { imovelCaracteristicaRestoreManyApiDoc } from './controllers/imovelCaracteristicaRestoreManyController';

export function getImovelCaracteristicaPaths() {
  return buildPaths('ImovelCaracteristica', [
    imovelCaracteristicaAutocompleteApiDoc,
    imovelCaracteristicaCreateApiDoc,
    imovelCaracteristicaArchiveManyApiDoc,
    imovelCaracteristicaRestoreManyApiDoc,
    imovelCaracteristicaDeleteManyApiDoc,
    imovelCaracteristicaFindApiDoc,
    imovelCaracteristicaFindManyApiDoc,
    imovelCaracteristicaUpdateApiDoc,
    imovelCaracteristicaImportApiDoc,
  ]);
}
