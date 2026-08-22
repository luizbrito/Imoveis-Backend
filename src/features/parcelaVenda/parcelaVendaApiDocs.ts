import { buildPaths } from '../../shared/openapi/routeToPath';
import { parcelaVendaAutocompleteApiDoc } from './controllers/parcelaVendaAutocompleteController';
import { parcelaVendaCreateApiDoc } from './controllers/parcelaVendaCreateController';
import { parcelaVendaDeleteManyApiDoc } from './controllers/parcelaVendaDeleteManyController';
import { parcelaVendaFindApiDoc } from './controllers/parcelaVendaFindController';
import { parcelaVendaFindManyApiDoc } from './controllers/parcelaVendaFindManyController';
import { parcelaVendaImportApiDoc } from './controllers/parcelaVendaImporterController';
import { parcelaVendaUpdateApiDoc } from './controllers/parcelaVendaUpdateController';
import { parcelaVendaArchiveManyApiDoc } from './controllers/parcelaVendaArchiveManyController';
import { parcelaVendaRestoreManyApiDoc } from './controllers/parcelaVendaRestoreManyController';

export function getParcelaVendaPaths() {
  return buildPaths('ParcelaVenda', [
    parcelaVendaAutocompleteApiDoc,
    parcelaVendaCreateApiDoc,
    parcelaVendaArchiveManyApiDoc,
    parcelaVendaRestoreManyApiDoc,
    parcelaVendaDeleteManyApiDoc,
    parcelaVendaFindApiDoc,
    parcelaVendaFindManyApiDoc,
    parcelaVendaUpdateApiDoc,
    parcelaVendaImportApiDoc,
  ]);
}
