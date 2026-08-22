import { describe, it, expect } from 'vitest';
import { importerInputSchema, importerOutputSchema } from './importerSchemas';

describe('importerSchemas', () => {
  describe('importerInputSchema', () => {
    it('should accept valid input', () => {
      const result = importerInputSchema.safeParse({
        _line: 1,
        importHash: 'abc123',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data._line).toBe(1);
        expect(result.data.importHash).toBe('abc123');
      }
    });

    it('should coerce string line number to number', () => {
      const result = importerInputSchema.safeParse({
        _line: '42',
        importHash: 'test-hash',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data._line).toBe(42);
        expect(typeof result.data._line).toBe('number');
      }
    });

    it('should trim importHash', () => {
      const result = importerInputSchema.safeParse({
        _line: 1,
        importHash: '  whitespace  ',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.importHash).toBe('whitespace');
      }
    });

    it('should reject missing _line', () => {
      const result = importerInputSchema.safeParse({
        importHash: 'abc123',
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing importHash', () => {
      const result = importerInputSchema.safeParse({
        _line: 1,
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty importHash', () => {
      const result = importerInputSchema.safeParse({
        _line: 1,
        importHash: '',
      });
      expect(result.success).toBe(false);
    });

    it('should reject whitespace-only importHash', () => {
      const result = importerInputSchema.safeParse({
        _line: 1,
        importHash: '   ',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('importerOutputSchema', () => {
    it('should accept valid output array', () => {
      const result = importerOutputSchema.safeParse([
        {
          _status: 'success',
          _line: 1,
        },
        {
          _status: 'error',
          _line: 2,
          _errorMessages: ['Invalid email'],
        },
      ]);
      expect(result.success).toBe(true);
    });

    it('should accept all status types', () => {
      const result = importerOutputSchema.safeParse([
        { _status: 'pending', _line: 1 },
        { _status: 'success', _line: 2 },
        { _status: 'error', _line: 3 },
      ]);
      expect(result.success).toBe(true);
    });

    it('should accept empty array', () => {
      const result = importerOutputSchema.safeParse([]);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual([]);
      }
    });

    it('should accept output without error messages', () => {
      const result = importerOutputSchema.safeParse([
        { _status: 'success', _line: 1 },
      ]);
      expect(result.success).toBe(true);
    });

    it('should accept output with error messages', () => {
      const result = importerOutputSchema.safeParse([
        {
          _status: 'error',
          _line: 1,
          _errorMessages: ['Error 1', 'Error 2'],
        },
      ]);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data[0]._errorMessages).toEqual(['Error 1', 'Error 2']);
      }
    });

    it('should coerce string line to number', () => {
      const result = importerOutputSchema.safeParse([
        { _status: 'success', _line: '5' },
      ]);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data[0]._line).toBe(5);
        expect(typeof result.data[0]._line).toBe('number');
      }
    });

    it('should reject invalid status', () => {
      const result = importerOutputSchema.safeParse([
        { _status: 'invalid', _line: 1 },
      ]);
      expect(result.success).toBe(false);
    });

    it('should reject missing _status', () => {
      const result = importerOutputSchema.safeParse([{ _line: 1 }]);
      expect(result.success).toBe(false);
    });

    it('should reject missing _line', () => {
      const result = importerOutputSchema.safeParse([{ _status: 'success' }]);
      expect(result.success).toBe(false);
    });
  });
});
