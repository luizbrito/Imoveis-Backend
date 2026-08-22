import { describe, it, expect } from 'vitest';
import {
  objectToUuidSchema,
  objectToUuidSchemaOptional,
} from './objectToUuidSchema';

describe('objectToUuidSchema', () => {
  const validUuid = '550e8400-e29b-41d4-a716-446655440000';
  const invalidUuid = 'not-a-uuid';

  describe('objectToUuidSchema', () => {
    it('should accept valid UUID string', () => {
      const result = objectToUuidSchema.safeParse(validUuid);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(validUuid);
      }
    });

    it('should extract id from object', () => {
      const result = objectToUuidSchema.safeParse({ id: validUuid });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(validUuid);
      }
    });

    it('should reject invalid UUID string', () => {
      const result = objectToUuidSchema.safeParse(invalidUuid);
      expect(result.success).toBe(false);
    });

    it('should reject object with invalid UUID', () => {
      const result = objectToUuidSchema.safeParse({ id: invalidUuid });
      expect(result.success).toBe(false);
    });

    it('should reject object with null id', () => {
      const result = objectToUuidSchema.safeParse({ id: null });
      expect(result.success).toBe(false);
    });

    it('should reject object with undefined id', () => {
      const result = objectToUuidSchema.safeParse({ id: undefined });
      expect(result.success).toBe(false);
    });

    it('should reject null', () => {
      const result = objectToUuidSchema.safeParse(null);
      expect(result.success).toBe(false);
    });

    it('should reject undefined', () => {
      const result = objectToUuidSchema.safeParse(undefined);
      expect(result.success).toBe(false);
    });

    it('should reject empty string', () => {
      const result = objectToUuidSchema.safeParse('');
      expect(result.success).toBe(false);
    });

    it('should reject object without id property', () => {
      const result = objectToUuidSchema.safeParse({ name: 'test' });
      expect(result.success).toBe(false);
    });
  });

  describe('objectToUuidSchemaOptional', () => {
    it('should accept valid UUID string', () => {
      const result = objectToUuidSchemaOptional.safeParse(validUuid);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(validUuid);
      }
    });

    it('should extract id from object', () => {
      const result = objectToUuidSchemaOptional.safeParse({ id: validUuid });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(validUuid);
      }
    });

    it('should accept null', () => {
      const result = objectToUuidSchemaOptional.safeParse(null);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(null);
      }
    });

    it('should accept undefined', () => {
      const result = objectToUuidSchemaOptional.safeParse(undefined);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(undefined);
      }
    });

    it('should reject object with null id', () => {
      const result = objectToUuidSchemaOptional.safeParse({ id: null });
      expect(result.success).toBe(false);
    });

    it('should reject invalid UUID string', () => {
      const result = objectToUuidSchemaOptional.safeParse(invalidUuid);
      expect(result.success).toBe(false);
    });

    it('should reject object with invalid UUID', () => {
      const result = objectToUuidSchemaOptional.safeParse({ id: invalidUuid });
      expect(result.success).toBe(false);
    });
  });
});
