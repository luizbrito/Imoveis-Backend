import { buildPaths } from '../../shared/openapi/routeToPath';
import { infraestruturaEnergiaConectividadeAutocompleteApiDoc } from './controllers/infraestruturaEnergiaConectividadeAutocompleteController';
import { infraestruturaEnergiaConectividadeCreateApiDoc } from './controllers/infraestruturaEnergiaConectividadeCreateController';
import { infraestruturaEnergiaConectividadeDeleteManyApiDoc } from './controllers/infraestruturaEnergiaConectividadeDeleteManyController';
import { infraestruturaEnergiaConectividadeFindApiDoc } from './controllers/infraestruturaEnergiaConectividadeFindController';
import { infraestruturaEnergiaConectividadeFindManyApiDoc } from './controllers/infraestruturaEnergiaConectividadeFindManyController';
import { infraestruturaEnergiaConectividadeImportApiDoc } from './controllers/infraestruturaEnergiaConectividadeImporterController';
import { infraestruturaEnergiaConectividadeUpdateApiDoc } from './controllers/infraestruturaEnergiaConectividadeUpdateController';
import { infraestruturaEnergiaConectividadeArchiveManyApiDoc } from './controllers/infraestruturaEnergiaConectividadeArchiveManyController';
import { infraestruturaEnergiaConectividadeRestoreManyApiDoc } from './controllers/infraestruturaEnergiaConectividadeRestoreManyController';

export function getInfraestruturaEnergiaConectividadePaths() {
  return buildPaths('InfraestruturaEnergiaConectividade', [
    infraestruturaEnergiaConectividadeAutocompleteApiDoc,
    infraestruturaEnergiaConectividadeCreateApiDoc,
    infraestruturaEnergiaConectividadeArchiveManyApiDoc,
    infraestruturaEnergiaConectividadeRestoreManyApiDoc,
    infraestruturaEnergiaConectividadeDeleteManyApiDoc,
    infraestruturaEnergiaConectividadeFindApiDoc,
    infraestruturaEnergiaConectividadeFindManyApiDoc,
    infraestruturaEnergiaConectividadeUpdateApiDoc,
    infraestruturaEnergiaConectividadeImportApiDoc,
  ]);
}
