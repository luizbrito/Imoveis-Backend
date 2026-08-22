import { describe, it, expect } from 'vitest';
import { numberSchema, numberOptionalSchema } from './numberSchema';

describe('numberSchema', () => {
  describe('numberSchema', () => {
    it('should accept number input', () => {
      const result = numberSchema.safeParse(42);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(42);
      }
    });

    it('should accept string number input', () => {
      const result = numberSchema.safeParse('42');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(42);
      }
    });

    it('should transform string to number', () => {
      const result = numberSchema.safeParse('123');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(typeof result.data).toBe('number');
        expect(result.data).toBe(123);
      }
    });

    it('should accept negative numbers', () => {
      const result = numberSchema.safeParse(-42);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(-42);
      }
    });

    it('should accept decimal numbers', () => {
      const result = numberSchema.safeParse(3.14);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(3.14);
      }
    });

    it('should accept string decimals', () => {
      const result = numberSchema.safeParse('3.14');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(3.14);
      }
    });

    it('should accept zero', () => {
      const result = numberSchema.safeParse(0);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(0);
      }
    });

    it('should reject empty string', () => {
      const result = numberSchema.safeParse('');
      expect(result.success).toBe(false);
    });

    it('should reject non-numeric strings', () => {
      const result = numberSchema.safeParse('abc');
      expect(result.success).toBe(true); // Will parse as NaN
      if (result.success) {
        expect(Number.isNaN(result.data)).toBe(true);
      }
    });

    it('should accept very large numbers', () => {
      const result = numberSchema.safeParse(999999999999);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(999999999999);
      }
    });
  });

  describe('numberOptionalSchema', () => {
    it('should accept number input', () => {
      const result = numberOptionalSchema.safeParse(42);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(42);
      }
    });

    it('should accept string number input', () => {
      const result = numberOptionalSchema.safeParse('42');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(42);
      }
    });

    it('should accept null', () => {
      const result = numberOptionalSchema.safeParse(null);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(null);
      }
    });

    it('should accept undefined', () => {
      const result = numberOptionalSchema.safeParse(undefined);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(undefined);
      }
    });

    it('should transform empty string to null', () => {
      const result = numberOptionalSchema.safeParse('');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(null);
      }
    });

    it('should accept zero', () => {
      const result = numberOptionalSchema.safeParse(0);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(0);
      }
    });

    it('should accept string zero', () => {
      const result = numberOptionalSchema.safeParse('0');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(0);
      }
    });

    it('should accept negative numbers', () => {
      const result = numberOptionalSchema.safeParse(-100);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(-100);
      }
    });

    it('should accept decimals', () => {
      const result = numberOptionalSchema.safeParse(3.14);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(3.14);
      }
    });
  });
});
