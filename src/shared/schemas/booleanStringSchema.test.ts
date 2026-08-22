import { describe, it, expect } from 'vitest';
import {
  booleanStringSchema,
  booleanStringOptionalSchema,
} from './booleanStringSchema';

describe('booleanStringSchema', () => {
  describe('booleanStringSchema', () => {
    it('should accept "true" string', () => {
      const result = booleanStringSchema.safeParse('true');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('true');
      }
    });

    it('should accept "false" string', () => {
      const result = booleanStringSchema.safeParse('false');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('false');
      }
    });

    it('should accept undefined', () => {
      const result = booleanStringSchema.safeParse(undefined);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(undefined);
      }
    });

    it('should reject empty string', () => {
      const result = booleanStringSchema.safeParse('');
      expect(result.success).toBe(false);
    });

    it('should reject boolean true', () => {
      const result = booleanStringSchema.safeParse(true);
      expect(result.success).toBe(false);
    });

    it('should reject boolean false', () => {
      const result = booleanStringSchema.safeParse(false);
      expect(result.success).toBe(false);
    });

    it('should reject other strings', () => {
      const result = booleanStringSchema.safeParse('yes');
      expect(result.success).toBe(false);
    });

    it('should reject numbers', () => {
      const result = booleanStringSchema.safeParse(1);
      expect(result.success).toBe(false);
    });

    it('should reject null', () => {
      const result = booleanStringSchema.safeParse(null);
      expect(result.success).toBe(false);
    });
  });

  describe('booleanStringOptionalSchema', () => {
    it('should accept "true" string', () => {
      const result = booleanStringOptionalSchema.safeParse('true');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('true');
      }
    });

    it('should accept "false" string', () => {
      const result = booleanStringOptionalSchema.safeParse('false');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('false');
      }
    });

    it('should accept empty string', () => {
      const result = booleanStringOptionalSchema.safeParse('');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('');
      }
    });

    it('should accept undefined', () => {
      const result = booleanStringOptionalSchema.safeParse(undefined);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(undefined);
      }
    });

    it('should reject other strings', () => {
      const result = booleanStringOptionalSchema.safeParse('maybe');
      expect(result.success).toBe(false);
    });

    it('should reject boolean values', () => {
      const result = booleanStringOptionalSchema.safeParse(true);
      expect(result.success).toBe(false);
    });

    it('should reject null', () => {
      const result = booleanStringOptionalSchema.safeParse(null);
      expect(result.success).toBe(false);
    });
  });
});
