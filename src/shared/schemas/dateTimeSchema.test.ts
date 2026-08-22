import { describe, it, expect } from 'vitest';
import { dateTimeSchema, dateTimeOptionalSchema } from './dateTimeSchema';

describe('dateTimeSchema', () => {
  describe('dateTimeSchema', () => {
    it('should accept valid ISO datetime string', () => {
      const result = dateTimeSchema.safeParse('2025-10-28T10:30:00');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeInstanceOf(Date);
      }
    });

    it('should accept Date object', () => {
      const date = new Date('2025-10-28');
      const result = dateTimeSchema.safeParse(date);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeInstanceOf(Date);
      }
    });

    it('should transform string to Date object', () => {
      const result = dateTimeSchema.safeParse('2025-10-28T10:30:00Z');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeInstanceOf(Date);
        expect(result.data.getFullYear()).toBe(2025);
        expect(result.data.getMonth()).toBe(9); // October (0-indexed)
        expect(result.data.getDate()).toBe(28);
      }
    });

    it('should reject invalid datetime string', () => {
      const result = dateTimeSchema.safeParse('not-a-datetime');
      expect(result.success).toBe(false);
    });

    it('should reject empty string', () => {
      const result = dateTimeSchema.safeParse('');
      expect(result.success).toBe(false);
    });

    it('should accept datetime with timezone', () => {
      const result = dateTimeSchema.safeParse('2025-10-28T10:30:00+05:00');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeInstanceOf(Date);
      }
    });

    it('should accept datetime with milliseconds', () => {
      const result = dateTimeSchema.safeParse('2025-10-28T10:30:00.123Z');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeInstanceOf(Date);
        expect(result.data.getMilliseconds()).toBe(123);
      }
    });

    it('should accept various datetime formats', () => {
      const formats = [
        '2025-10-28',
        '2025-10-28T10:30:00',
        '2025-10-28T10:30:00Z',
        '2025-10-28T10:30:00.123Z',
        '2025-10-28T10:30:00+00:00',
      ];

      formats.forEach((format) => {
        const result = dateTimeSchema.safeParse(format);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('dateTimeOptionalSchema', () => {
    it('should accept valid datetime string', () => {
      const result = dateTimeOptionalSchema.safeParse('2025-10-28T10:30:00');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeInstanceOf(Date);
      }
    });

    it('should accept Date object', () => {
      const date = new Date('2025-10-28');
      const result = dateTimeOptionalSchema.safeParse(date);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeInstanceOf(Date);
      }
    });

    it('should accept null', () => {
      const result = dateTimeOptionalSchema.safeParse(null);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(null);
      }
    });

    it('should accept undefined', () => {
      const result = dateTimeOptionalSchema.safeParse(undefined);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(undefined);
      }
    });

    it('should reject invalid date string', () => {
      const result = dateTimeOptionalSchema.safeParse('invalid-date');
      expect(result.success).toBe(false);
    });

    it('should transform empty string to null', () => {
      const result = dateTimeOptionalSchema.safeParse('');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(null);
      }
    });

    it('should preserve valid Date objects', () => {
      const date = new Date('2025-10-28T10:30:00');
      const result = dateTimeOptionalSchema.safeParse(date);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeInstanceOf(Date);
        expect(result.data?.getFullYear()).toBe(2025);
      }
    });
  });
});
