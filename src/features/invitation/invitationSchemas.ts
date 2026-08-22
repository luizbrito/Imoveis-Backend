import { Invitation, Organization, User } from '../../prisma/generated/client';
import { z } from 'zod';
import { dateTimeOptionalSchema } from '../../shared/schemas/dateTimeSchema';
import { orderBySchema } from '../../shared/schemas/orderBySchema';
import { rolesIds } from '../permissions';

export const InvitationStatus = {
  pending: 'pending',
  accepted: 'accepted',
  rejected: 'rejected',
  expired: 'expired',
  cancelled: 'cancelled',
} as const;

export type InvitationStatusType =
  (typeof InvitationStatus)[keyof typeof InvitationStatus];

export interface InvitationWithRelationships extends Invitation {
  organization?: Partial<Organization>;
  inviter?: Partial<User>;
}

export const invitationFilterInputSchema = z
  .object({
    email: z.string(),
    roles: z.array(z.enum(rolesIds)),
    statuses: z.array(
      z.enum([
        InvitationStatus.pending,
        InvitationStatus.accepted,
        InvitationStatus.rejected,
        InvitationStatus.expired,
        InvitationStatus.cancelled,
      ]),
    ),
    createdAtRange: z.array(dateTimeOptionalSchema).max(2),
  })
  .partial();

export const invitationFindManyInputSchema = z.object({
  filter: invitationFilterInputSchema.optional(),
  orderBy: orderBySchema.optional(),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const invitationOutputSchema = z.object({
  id: z.string(),
  email: z.string(),
  role: z.string(),
  status: z.string(),
  expiresAt: z.date(),
  createdAt: z.date(),
  organizationId: z.string(),
  inviterId: z.string(),
});

export const invitationResendInputSchema = z.object({
  id: z.string().uuid(),
});

export const invitationCancelInputSchema = z.object({
  id: z.string().uuid(),
});

export const invitationFindSchema = z.object({
  id: z.string(),
});

export const invitationCreateInputSchema = z.object({
  email: z.string().email(),
  role: z.enum(rolesIds),
});
