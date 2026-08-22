import { Member, Organization, User } from '../../prisma/generated/client';
import { toLower } from 'lodash-es';
import { z } from 'zod';
import { dateTimeOptionalSchema } from '../../shared/schemas/dateTimeSchema';
import { importerInputSchema } from '../../shared/schemas/importerSchemas';
import { orderBySchema } from '../../shared/schemas/orderBySchema';
import { fileUploadedSchema } from '../file/fileSchemas';
import { rolesIds } from '../permissions';
import { memberEnumerators } from './memberEnumerators';

const memberStatusIds = Object.keys(
  memberEnumerators.status,
) as unknown as readonly [string, ...string[]];

export interface MemberWithRelationships extends Member {
  organization?: Partial<Organization>;
  user?: Partial<User>;
  createdByMember?: Partial<MemberWithRelationships> | null;
  updatedByMember?: Partial<MemberWithRelationships> | null;
  role: keyof typeof rolesIds;
}

export const memberFilterInputSchema = z
  .object({
    email: z.string(),
    fullName: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    roles: z.array(z.enum(rolesIds)),
    createdAtRange: z.array(dateTimeOptionalSchema).max(2),
    status: z.enum(memberStatusIds),
  })
  .partial();

export const memberCreateInputSchema = z.object({
  email: z.email().trim().min(1).max(255).transform(toLower),
  role: z.enum(rolesIds),
  importHash: z.string().optional(),
});

export const memberUpdateInputSchema = z.object({
  firstName: z.string().trim().max(255).optional(),
  lastName: z.string().trim().max(255).optional(),
  avatars: z.array(fileUploadedSchema).optional(),
  role: z.enum(rolesIds),
});

export const memberUpdateMeInputSchema = z.object({
  firstName: z.string().trim().min(1).max(255).optional(),
  lastName: z.string().min(1).trim().max(255).optional(),
  avatars: z.array(fileUploadedSchema).optional(),
  isNotificationsEnabled: z.boolean().optional(),
});

export const profileOnboardFormSchema = z.object({
  firstName: z.string().min(1).max(255),
  lastName: z.string().min(1).max(255),
  avatars: z.array(fileUploadedSchema),
  isNotificationsEnabled: z.boolean().optional(),
});

export const memberImportFileSchema = z
  .object({
    email: z.string(),
    role: z.string(),
  })
  .partial();

export const memberImportInputSchema = memberCreateInputSchema.extend(
  importerInputSchema.shape,
);

export const memberAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.string().uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ fullName: 'asc' }),
});

export const memberAutocompleteOutputSchema = z.object({
  id: z.string(),
  fullName: z.string().nullable(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  email: z.string(),
  avatars: z.any().nullable(),
});

export const memberFindSchema = z.object({
  id: z.string(),
});

export const memberFindManyInputSchema = z.object({
  filter: memberFilterInputSchema.optional(),
  orderBy: orderBySchema.optional(),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});
