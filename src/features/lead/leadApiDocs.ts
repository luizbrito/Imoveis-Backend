import { buildPaths } from '../../shared/openapi/routeToPath';
import { leadAutocompleteApiDoc } from './controllers/leadAutocompleteController';
import { leadCreateApiDoc } from './controllers/leadCreateController';
import { leadDeleteManyApiDoc } from './controllers/leadDeleteManyController';
import { leadFindApiDoc } from './controllers/leadFindController';
import { leadFindManyApiDoc } from './controllers/leadFindManyController';
import { leadImportApiDoc } from './controllers/leadImporterController';
import { leadUpdateApiDoc } from './controllers/leadUpdateController';
import { leadArchiveManyApiDoc } from './controllers/leadArchiveManyController';
import { leadRestoreManyApiDoc } from './controllers/leadRestoreManyController';

export function getLeadPaths() {
  return buildPaths('Lead', [
    leadAutocompleteApiDoc,
    leadCreateApiDoc,
    leadArchiveManyApiDoc,
    leadRestoreManyApiDoc,
    leadDeleteManyApiDoc,
    leadFindApiDoc,
    leadFindManyApiDoc,
    leadUpdateApiDoc,
    leadImportApiDoc,
  ]);
}
