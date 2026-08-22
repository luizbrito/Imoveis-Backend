import { z } from 'zod';
import { dateTimeOptionalSchema } from '../../shared/schemas/dateTimeSchema';
import { Dictionary } from '../../translation/locales';
import {
  OrganizationMode,
  OrganizationMultiDomainMode,
} from '../config/configSchemas';
import { fileUploadedSchema } from '../file/fileSchemas';

// Static schema for API documentation (no dictionary needed)
export const organizationFormSchemaStatic = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(255).optional(),
  logosLight: z.array(fileUploadedSchema).max(1).optional(),
  logosDark: z.array(fileUploadedSchema).max(1).optional(),
  backgroundImageLight: z.array(fileUploadedSchema).max(1).optional(),
  backgroundImageDark: z.array(fileUploadedSchema).max(1).optional(),
});

export const organizationUpdateInputSchemaStatic = z
  .object({
    name: z.string().min(1).max(255).optional(),
    slug: z.string().min(1).max(255).optional(),
    logosLight: z.array(fileUploadedSchema).max(1).optional(),
    logosDark: z.array(fileUploadedSchema).max(1).optional(),
    backgroundImageLight: z.array(fileUploadedSchema).max(1).optional(),
    backgroundImageDark: z.array(fileUploadedSchema).max(1).optional(),
    require2fa: z.boolean().optional(),
    updatedAt: dateTimeOptionalSchema.optional(),
  })
  .partial();

// Dynamic schemas with dictionary for validation (runtime)
export function organizationFormSchema(
  organizationMode: OrganizationMode,
  organizationMultiDomainMode: OrganizationMultiDomainMode,
  dictionary: Dictionary,
) {
  const isMultiDomain = organizationMode === 'multi-domain';

  // Base schema without slug
  const baseSchema = {
    name: z.string().min(1).max(255),
    logosLight: z.array(fileUploadedSchema).max(1).optional(),
    logosDark: z.array(fileUploadedSchema).max(1).optional(),
    backgroundImageLight: z.array(fileUploadedSchema).max(1).optional(),
    backgroundImageDark: z.array(fileUploadedSchema).max(1).optional(),
    require2fa: z.boolean().optional(),
  };

  // Only add slug field in multi-domain mode
  if (isMultiDomain) {
    return z.object({
      ...baseSchema,
      slug: getSlugSchema(
        organizationMode,
        organizationMultiDomainMode,
        true,
        dictionary,
      ),
    });
  }

  // In non-multi-domain mode, slug is completely optional
  return z.object({
    ...baseSchema,
    slug: z.string().optional(),
  });
}

export function organizationUpdateInputSchema(
  organizationMode: OrganizationMode,
  organizationMultiDomainMode: OrganizationMultiDomainMode,
  dictionary: Dictionary,
) {
  const isMultiDomain = organizationMode === 'multi-domain';

  // Base schema without slug
  const baseSchema = {
    name: z.string().min(1).max(255).optional(),
    logosLight: z.array(fileUploadedSchema).max(1).optional(),
    logosDark: z.array(fileUploadedSchema).max(1).optional(),
    backgroundImageLight: z.array(fileUploadedSchema).max(1).optional(),
    backgroundImageDark: z.array(fileUploadedSchema).max(1).optional(),
    require2fa: z.boolean().optional(),
    updatedAt: dateTimeOptionalSchema.optional(),
  };

  // Only add slug field in multi-domain mode
  if (isMultiDomain) {
    return z
      .object({
        ...baseSchema,
        slug: getSlugSchema(
          organizationMode,
          organizationMultiDomainMode,
          false,
          dictionary,
        ),
      })
      .partial();
  }

  // In non-multi-domain mode, slug is completely optional
  return z
    .object({
      ...baseSchema,
      slug: z.string().optional(),
    })
    .partial();
}

export const organizationSelectSchema = z.object({
  organizationId: z.string(),
});

// Helper to get the appropriate slug schema based on mode
function getSlugSchema(
  organizationMode: OrganizationMode,
  organizationMultiDomainMode: OrganizationMultiDomainMode,
  required: boolean,
  dictionary: Dictionary,
) {
  const isMultiDomain = organizationMode === 'multi-domain';

  if (!isMultiDomain) {
    // In non-multi-domain mode, slug is optional and not validated
    return z.string().optional();
  }

  const isSubdomainMode = organizationMultiDomainMode === 'subdomain';

  if (isSubdomainMode) {
    // Subdomain validation: lowercase alphanumeric and hyphens only
    const schema = z
      .string()
      .min(1)
      .max(63) // DNS subdomain length limit
      .regex(
        /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/,
        dictionary.organization.form.slugInvalidSubdomain,
      );
    return required ? schema : schema.optional();
  } else {
    // Full domain validation: valid domain format
    const schema = z
      .string()
      .min(1)
      .max(253) // DNS domain name length limit
      .regex(
        /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/,
        dictionary.organization.form.slugInvalidDomain,
      );
    return required ? schema : schema.optional();
  }
}
