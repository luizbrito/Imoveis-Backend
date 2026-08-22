import { buildPaths } from '../../shared/openapi/routeToPath';
import { visitaAutocompleteApiDoc } from './controllers/visitaAutocompleteController';
import { visitaCreateApiDoc } from './controllers/visitaCreateController';
import { visitaDeleteManyApiDoc } from './controllers/visitaDeleteManyController';
import { visitaFindApiDoc } from './controllers/visitaFindController';
import { visitaFindManyApiDoc } from './controllers/visitaFindManyController';
import { visitaImportApiDoc } from './controllers/visitaImporterController';
import { visitaUpdateApiDoc } from './controllers/visitaUpdateController';
import { visitaArchiveManyApiDoc } from './controllers/visitaArchiveManyController';
import { visitaRestoreManyApiDoc } from './controllers/visitaRestoreManyController';

export function getVisitaPaths() {
  return buildPaths('Visita', [
    visitaAutocompleteApiDoc,
    visitaCreateApiDoc,
    visitaArchiveManyApiDoc,
    visitaRestoreManyApiDoc,
    visitaDeleteManyApiDoc,
    visitaFindApiDoc,
    visitaFindManyApiDoc,
    visitaUpdateApiDoc,
    visitaImportApiDoc,
  ]);
}
