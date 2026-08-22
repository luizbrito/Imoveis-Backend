import { buildPaths } from '../../shared/openapi/routeToPath';
import { vendaAutocompleteApiDoc } from './controllers/vendaAutocompleteController';
import { vendaCreateApiDoc } from './controllers/vendaCreateController';
import { vendaDeleteManyApiDoc } from './controllers/vendaDeleteManyController';
import { vendaFindApiDoc } from './controllers/vendaFindController';
import { vendaFindManyApiDoc } from './controllers/vendaFindManyController';
import { vendaImportApiDoc } from './controllers/vendaImporterController';
import { vendaUpdateApiDoc } from './controllers/vendaUpdateController';
import { vendaArchiveManyApiDoc } from './controllers/vendaArchiveManyController';
import { vendaRestoreManyApiDoc } from './controllers/vendaRestoreManyController';

export function getVendaPaths() {
  return buildPaths('Venda', [
    vendaAutocompleteApiDoc,
    vendaCreateApiDoc,
    vendaArchiveManyApiDoc,
    vendaRestoreManyApiDoc,
    vendaDeleteManyApiDoc,
    vendaFindApiDoc,
    vendaFindManyApiDoc,
    vendaUpdateApiDoc,
    vendaImportApiDoc,
  ]);
}
