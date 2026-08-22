import { Prisma } from '../../prisma/generated/client';
import { InvitationStatus } from './invitationSchemas';

export function invitationComputeStatus(invitation: {
  status: string;
  expiresAt: Date;
}): string {
  if (
    invitation.status === InvitationStatus.pending &&
    invitation.expiresAt <= new Date()
  ) {
    return InvitationStatus.expired;
  }
  return invitation.status;
}

export function invitationStatusToWhere(
  statuses: string[],
): Prisma.InvitationWhereInput | undefined {
  if (!statuses.length) {
    return undefined;
  }

  const whereOr: Array<Prisma.InvitationWhereInput> = [];
  const now = new Date();

  for (const status of statuses) {
    if (status === InvitationStatus.pending) {
      whereOr.push({
        AND: [{ status: InvitationStatus.pending }, { expiresAt: { gt: now } }],
      });
    } else if (status === InvitationStatus.expired) {
      whereOr.push({
        OR: [
          {
            AND: [
              { status: InvitationStatus.pending },
              { expiresAt: { lte: now } },
            ],
          },
          { status: InvitationStatus.expired },
        ],
      });
    } else {
      whereOr.push({ status });
    }
  }

  return whereOr.length > 0 ? { OR: whereOr } : undefined;
}
