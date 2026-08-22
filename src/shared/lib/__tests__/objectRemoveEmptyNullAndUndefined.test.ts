import { describe, it, expect } from 'vitest';
import { objectRemoveEmptyNullAndUndefined } from '../objectRemoveEmptyNullAndUndefined';

describe('objectRemoveEmptyNullAndUndefined', () => {
  it('should remove null values', () => {
    const input = { a: 'value', b: null, c: 'another' };
    const result = objectRemoveEmptyNullAndUndefined(input);
    expect(result).toEqual({ a: 'value', c: 'another' });
  });

  it('should remove undefined values', () => {
    const input = { a: 'value', b: undefined, c: 'another' };
    const result = objectRemoveEmptyNullAndUndefined(input);
    expect(result).toEqual({ a: 'value', c: 'another' });
  });

  it('should remove empty string values', () => {
    const input = { a: 'value', b: '', c: 'another' };
    const result = objectRemoveEmptyNullAndUndefined(input);
    expect(result).toEqual({ a: 'value', c: 'another' });
  });

  it('should keep zero values', () => {
    const input = { a: 0, b: null, c: 42 };
    const result = objectRemoveEmptyNullAndUndefined(input);
    expect(result).toEqual({ a: 0, c: 42 });
  });

  it('should keep false values', () => {
    const input = { a: false, b: null, c: true };
    const result = objectRemoveEmptyNullAndUndefined(input);
    expect(result).toEqual({ a: false, c: true });
  });

  it('should keep empty arrays', () => {
    const input = { a: [], b: null, c: [1, 2] };
    const result = objectRemoveEmptyNullAndUndefined(input);
    expect(result).toEqual({ a: [], c: [1, 2] });
  });

  it('should keep empty objects', () => {
    const input = { a: {}, b: null, c: { key: 'value' } };
    const result = objectRemoveEmptyNullAndUndefined(input);
    expect(result).toEqual({ a: {}, c: { key: 'value' } });
  });

  it('should handle empty input object', () => {
    const input = {};
    const result = objectRemoveEmptyNullAndUndefined(input);
    expect(result).toEqual({});
  });

  it('should handle object with all invalid values', () => {
    const input = { a: null, b: undefined, c: '' };
    const result = objectRemoveEmptyNullAndUndefined(input);
    expect(result).toEqual({});
  });

  it('should not mutate the original object', () => {
    const input = { a: 'value', b: null };
    const result = objectRemoveEmptyNullAndUndefined(input);
    expect(input).toEqual({ a: 'value', b: null });
    expect(result).toEqual({ a: 'value' });
  });

  it('should handle complex nested objects', () => {
    const input = {
      a: 'value',
      b: null,
      nested: { x: 1, y: null },
      c: undefined,
    };
    const result = objectRemoveEmptyNullAndUndefined(input);
    expect(result).toEqual({
      a: 'value',
      nested: { x: 1, y: null },
    });
  });
});
