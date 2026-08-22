import { buildPaths } from '../../shared/openapi/routeToPath';
import { contratoVendaAutocompleteApiDoc } from './controllers/contratoVendaAutocompleteController';
import { contratoVendaCreateApiDoc } from './controllers/contratoVendaCreateController';
import { contratoVendaDeleteManyApiDoc } from './controllers/contratoVendaDeleteManyController';
import { contratoVendaFindApiDoc } from './controllers/contratoVendaFindController';
import { contratoVendaFindManyApiDoc } from './controllers/contratoVendaFindManyController';
import { contratoVendaImportApiDoc } from './controllers/contratoVendaImporterController';
import { contratoVendaUpdateApiDoc } from './controllers/contratoVendaUpdateController';
import { contratoVendaArchiveManyApiDoc } from './controllers/contratoVendaArchiveManyController';
import { contratoVendaRestoreManyApiDoc } from './controllers/contratoVendaRestoreManyController';

export function getContratoVendaPaths() {
  return buildPaths('ContratoVenda', [
    contratoVendaAutocompleteApiDoc,
    contratoVendaCreateApiDoc,
    contratoVendaArchiveManyApiDoc,
    contratoVendaRestoreManyApiDoc,
    contratoVendaDeleteManyApiDoc,
    contratoVendaFindApiDoc,
    contratoVendaFindManyApiDoc,
    contratoVendaUpdateApiDoc,
    contratoVendaImportApiDoc,
  ]);
}
