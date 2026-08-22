import { User } from '../../prisma/generated/client';

export function userLabel(user?: User | null) {
  return user?.email;
}
