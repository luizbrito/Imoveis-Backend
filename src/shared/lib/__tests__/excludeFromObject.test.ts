import { describe, it, expect } from 'vitest';
import { excludeFromObject } from '../excludeFromObject';

describe('excludeFromObject', () => {
  it('should exclude single key from object', () => {
    const input = { a: 1, b: 2, c: 3 };
    const result = excludeFromObject(input, ['b']);
    expect(result).toEqual({ a: 1, c: 3 });
    expect(result).not.toHaveProperty('b');
  });

  it('should exclude multiple keys from object', () => {
    const input = { a: 1, b: 2, c: 3, d: 4 };
    const result = excludeFromObject(input, ['b', 'd']);
    expect(result).toEqual({ a: 1, c: 3 });
    expect(result).not.toHaveProperty('b');
    expect(result).not.toHaveProperty('d');
  });

  it('should handle empty exclusion array', () => {
    const input = { a: 1, b: 2, c: 3 };
    const result = excludeFromObject(input, []);
    expect(result).toEqual({ a: 1, b: 2, c: 3 });
  });

  it('should handle non-existent keys', () => {
    const input = { a: 1, b: 2 };
    // @ts-expect-error - testing runtime behavior with invalid key
    const result = excludeFromObject(input, ['c']);
    expect(result).toEqual({ a: 1, b: 2 });
  });

  it('should work with objects containing different value types', () => {
    const input = {
      string: 'value',
      number: 42,
      boolean: true,
      array: [1, 2, 3],
      object: { nested: 'value' },
      null: null,
      undefined: undefined,
    };
    const result = excludeFromObject(input, ['number', 'array', 'null']);
    expect(result).toEqual({
      string: 'value',
      boolean: true,
      object: { nested: 'value' },
      undefined: undefined,
    });
  });

  it('should mutate the original object', () => {
    const input = { a: 1, b: 2, c: 3 };
    const result = excludeFromObject(input, ['b']);
    // Note: This function mutates the original object
    expect(input).toBe(result);
    expect(input).not.toHaveProperty('b');
  });

  it('should handle objects with symbol keys', () => {
    const sym = Symbol('test');
    const input = { a: 1, [sym]: 'symbol value' };
    const result = excludeFromObject(input, ['a']);
    expect(result).not.toHaveProperty('a');
    expect(result[sym]).toBe('symbol value');
  });

  it('should exclude all keys when all are specified', () => {
    const input = { a: 1, b: 2, c: 3 };
    const result = excludeFromObject(input, ['a', 'b', 'c']);
    expect(result).toEqual({});
  });
});
