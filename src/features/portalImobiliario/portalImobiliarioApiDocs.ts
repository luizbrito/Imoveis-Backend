import { buildPaths } from '../../shared/openapi/routeToPath';
import { portalImobiliarioAutocompleteApiDoc } from './controllers/portalImobiliarioAutocompleteController';
import { portalImobiliarioCreateApiDoc } from './controllers/portalImobiliarioCreateController';
import { portalImobiliarioDeleteManyApiDoc } from './controllers/portalImobiliarioDeleteManyController';
import { portalImobiliarioFindApiDoc } from './controllers/portalImobiliarioFindController';
import { portalImobiliarioFindManyApiDoc } from './controllers/portalImobiliarioFindManyController';
import { portalImobiliarioImportApiDoc } from './controllers/portalImobiliarioImporterController';
import { portalImobiliarioUpdateApiDoc } from './controllers/portalImobiliarioUpdateController';
import { portalImobiliarioArchiveManyApiDoc } from './controllers/portalImobiliarioArchiveManyController';
import { portalImobiliarioRestoreManyApiDoc } from './controllers/portalImobiliarioRestoreManyController';

export function getPortalImobiliarioPaths() {
  return buildPaths('PortalImobiliario', [
    portalImobiliarioAutocompleteApiDoc,
    portalImobiliarioCreateApiDoc,
    portalImobiliarioArchiveManyApiDoc,
    portalImobiliarioRestoreManyApiDoc,
    portalImobiliarioDeleteManyApiDoc,
    portalImobiliarioFindApiDoc,
    portalImobiliarioFindManyApiDoc,
    portalImobiliarioUpdateApiDoc,
    portalImobiliarioImportApiDoc,
  ]);
}
