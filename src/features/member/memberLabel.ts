import { memberFullName } from './memberFullName';
import { MemberWithRelationships } from './memberSchemas';

export function memberLabel(member?: Partial<MemberWithRelationships> | null) {
  const fullName = member?.fullName || memberFullName(member);
  const email = member?.user?.email;

  if (fullName && !email) {
    return fullName;
  }

  if (!fullName && email) {
    return email;
  }

  return [fullName, email].filter(Boolean).join(' - ') || '';
}
