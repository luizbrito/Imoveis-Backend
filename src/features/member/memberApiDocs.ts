import { buildPaths } from '../../shared/openapi/routeToPath';
import { memberAutocompleteApiDoc } from './controllers/memberAutocompleteController';
import { memberFindApiDoc } from './controllers/memberFindController';
import { memberFindManyApiDoc } from './controllers/memberFindManyController';
import { memberUpdateApiDoc } from './controllers/memberUpdateController';
import { memberUpdateMeApiDoc } from './controllers/memberUpdateMeController';
import { memberRemoveApiDoc } from './controllers/memberRemoveController';
import { invitationCreateApiDoc } from '../invitation/controllers/invitationCreateController';
import { invitationFindApiDoc } from '../invitation/controllers/invitationFindController';
import { invitationFindManyApiDoc } from '../invitation/controllers/invitationFindManyController';
import { invitationFindMyApiDoc } from '../invitation/controllers/invitationFindMyController';
import { invitationAcceptApiDoc } from '../invitation/controllers/invitationAcceptController';
import { invitationRejectApiDoc } from '../invitation/controllers/invitationRejectController';
import { invitationCancelApiDoc } from '../invitation/controllers/invitationCancelController';
import { invitationResendApiDoc } from '../invitation/controllers/invitationResendController';

export function getMemberPaths() {
  return buildPaths('Member', [
    memberAutocompleteApiDoc,
    memberFindApiDoc,
    memberFindManyApiDoc,
    memberUpdateApiDoc,
    memberUpdateMeApiDoc,
    memberRemoveApiDoc,
    invitationCreateApiDoc,
    invitationFindApiDoc,
    invitationFindManyApiDoc,
    invitationFindMyApiDoc,
    invitationAcceptApiDoc,
    invitationRejectApiDoc,
    invitationCancelApiDoc,
    invitationResendApiDoc,
  ]);
}
