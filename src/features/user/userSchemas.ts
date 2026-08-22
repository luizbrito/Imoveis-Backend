import { User } from '../../prisma/generated/client';
import { MemberWithRelationships } from '../member/memberSchemas';

export interface UserWithMembers extends User {
  members?: Array<MemberWithRelationships>;
}
