import { buildPaths } from '../../shared/openapi/routeToPath';
import { campanhaMarketingAutocompleteApiDoc } from './controllers/campanhaMarketingAutocompleteController';
import { campanhaMarketingCreateApiDoc } from './controllers/campanhaMarketingCreateController';
import { campanhaMarketingDeleteManyApiDoc } from './controllers/campanhaMarketingDeleteManyController';
import { campanhaMarketingFindApiDoc } from './controllers/campanhaMarketingFindController';
import { campanhaMarketingFindManyApiDoc } from './controllers/campanhaMarketingFindManyController';
import { campanhaMarketingImportApiDoc } from './controllers/campanhaMarketingImporterController';
import { campanhaMarketingUpdateApiDoc } from './controllers/campanhaMarketingUpdateController';
import { campanhaMarketingArchiveManyApiDoc } from './controllers/campanhaMarketingArchiveManyController';
import { campanhaMarketingRestoreManyApiDoc } from './controllers/campanhaMarketingRestoreManyController';

export function getCampanhaMarketingPaths() {
  return buildPaths('CampanhaMarketing', [
    campanhaMarketingAutocompleteApiDoc,
    campanhaMarketingCreateApiDoc,
    campanhaMarketingArchiveManyApiDoc,
    campanhaMarketingRestoreManyApiDoc,
    campanhaMarketingDeleteManyApiDoc,
    campanhaMarketingFindApiDoc,
    campanhaMarketingFindManyApiDoc,
    campanhaMarketingUpdateApiDoc,
    campanhaMarketingImportApiDoc,
  ]);
}
