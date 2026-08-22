import { describe, it, expect } from 'vitest';
import { dateSchema, dateOptionalSchema } from './dateSchema';

describe('dateSchema', () => {
  describe('dateSchema', () => {
    it('should accept valid ISO date string', () => {
      const result = dateSchema.safeParse('2025-10-28');
      expect(result.success).toBe(true);
    });

    it('should accept valid date with time', () => {
      const result = dateSchema.safeParse('2025-10-28T10:30:00');
      expect(result.success).toBe(true);
    });

    it('should accept date with timezone', () => {
      const result = dateSchema.safeParse('2025-10-28T10:30:00Z');
      expect(result.success).toBe(true);
    });

    it('should transform empty string to null', () => {
      const result = dateSchema.safeParse('');
      expect(result.success).toBe(false);
    });

    it('should reject invalid date string', () => {
      const result = dateSchema.safeParse('not-a-date');
      expect(result.success).toBe(false);
    });

    it('should reject invalid date format', () => {
      const result = dateSchema.safeParse('32/13/2025');
      expect(result.success).toBe(false);
    });

    it('should accept various date formats', () => {
      const result1 = dateSchema.safeParse('2025-01-01');
      const result2 = dateSchema.safeParse('2025/01/01');
      const result3 = dateSchema.safeParse('01-01-2025');

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result3.success).toBe(true);
    });

    it('should accept dates in the past', () => {
      const result = dateSchema.safeParse('2000-01-01');
      expect(result.success).toBe(true);
    });

    it('should accept dates in the future', () => {
      const result = dateSchema.safeParse('2099-12-31');
      expect(result.success).toBe(true);
    });
  });

  describe('dateOptionalSchema', () => {
    it('should accept valid date string', () => {
      const result = dateOptionalSchema.safeParse('2025-10-28');
      expect(result.success).toBe(true);
    });

    it('should accept null', () => {
      const result = dateOptionalSchema.safeParse(null);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(null);
      }
    });

    it('should accept undefined', () => {
      const result = dateOptionalSchema.safeParse(undefined);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(undefined);
      }
    });

    it('should transform empty string to null', () => {
      const result = dateOptionalSchema.safeParse('');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(null);
      }
    });

    it('should reject invalid date string', () => {
      const result = dateOptionalSchema.safeParse('invalid-date');
      expect(result.success).toBe(false);
    });

    it('should accept various valid date formats', () => {
      const result1 = dateOptionalSchema.safeParse('2025-10-28');
      const result2 = dateOptionalSchema.safeParse('2025/10/28');

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
    });
  });
});
