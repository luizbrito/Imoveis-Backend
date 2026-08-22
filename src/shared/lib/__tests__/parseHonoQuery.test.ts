import { describe, it, expect } from 'vitest';
import { parseHonoQuery } from '../parseHonoQuery';

describe('parseHonoQuery', () => {
  it('should parse simple flat query', () => {
    const query = { name: 'John', age: '30' };
    const result = parseHonoQuery(query);
    expect(result).toEqual({ name: 'John', age: '30' });
  });

  it('should parse nested object', () => {
    const query = { 'user[name]': 'John' };
    const result = parseHonoQuery(query);
    expect(result).toEqual({ user: { name: 'John' } });
  });

  it('should parse multiple nested properties', () => {
    const query = {
      'user[name]': 'John',
      'user[age]': '30',
    };
    const result = parseHonoQuery(query);
    expect(result).toEqual({
      user: { name: 'John', age: '30' },
    });
  });

  it('should parse array index notation', () => {
    const query = { 'items[0]': 'apple' };
    const result = parseHonoQuery(query);
    expect(result).toEqual({ items: ['apple'] });
  });

  it('should parse multiple array items', () => {
    const query = {
      'items[0]': 'apple',
      'items[1]': 'banana',
      'items[2]': 'cherry',
    };
    const result = parseHonoQuery(query);
    expect(result).toEqual({
      items: ['apple', 'banana', 'cherry'],
    });
  });

  it('should parse deeply nested objects', () => {
    const query = { 'user[address][city]': 'NYC' };
    const result = parseHonoQuery(query);
    expect(result).toEqual({
      user: { address: { city: 'NYC' } },
    });
  });

  it('should parse three levels deep', () => {
    const query = { 'a[b][c]': 'value' };
    const result = parseHonoQuery(query);
    expect(result).toEqual({
      a: { b: { c: 'value' } },
    });
  });

  it('should parse mixed flat and nested', () => {
    const query = {
      simple: 'value',
      'nested[key]': 'nested value',
    };
    const result = parseHonoQuery(query);
    expect(result).toEqual({
      simple: 'value',
      nested: { key: 'nested value' },
    });
  });

  it('should handle complex nested structures', () => {
    const query = {
      'user[name]': 'John',
      'user[address][city]': 'NYC',
      'user[address][zip]': '10001',
      age: '30',
    };
    const result = parseHonoQuery(query);
    expect(result).toEqual({
      user: {
        name: 'John',
        address: {
          city: 'NYC',
          zip: '10001',
        },
      },
      age: '30',
    });
  });

  it('should handle arrays within nested objects', () => {
    const query = {
      'user[tags][0]': 'developer',
      'user[tags][1]': 'typescript',
    };
    const result = parseHonoQuery(query);
    expect(result).toEqual({
      user: {
        tags: ['developer', 'typescript'],
      },
    });
  });

  it('should handle empty query', () => {
    const query = {};
    const result = parseHonoQuery(query);
    expect(result).toEqual({});
  });

  it('should handle single key without nesting', () => {
    const query = { name: 'value' };
    const result = parseHonoQuery(query);
    expect(result).toEqual({ name: 'value' });
  });

  it('should parse array of objects notation', () => {
    const query = {
      'items[0][name]': 'Item 1',
      'items[0][price]': '10',
      'items[1][name]': 'Item 2',
      'items[1][price]': '20',
    };
    const result = parseHonoQuery(query);
    expect(result).toEqual({
      items: [
        { name: 'Item 1', price: '10' },
        { name: 'Item 2', price: '20' },
      ],
    });
  });

  it('should handle special characters in values', () => {
    const query = { 'user[email]': 'test@example.com' };
    const result = parseHonoQuery(query);
    expect(result).toEqual({
      user: { email: 'test@example.com' },
    });
  });

  it('should handle empty string values', () => {
    const query = { 'user[name]': '' };
    const result = parseHonoQuery(query);
    expect(result).toEqual({
      user: { name: '' },
    });
  });

  it('should handle numeric string values', () => {
    const query = {
      'filter[year]': '2025',
      'filter[limit]': '10',
    };
    const result = parseHonoQuery(query);
    expect(result).toEqual({
      filter: { year: '2025', limit: '10' },
    });
  });

  it('should handle mixed array indices', () => {
    const query = {
      'arr[0]': 'first',
      'arr[5]': 'sixth',
    };
    const result = parseHonoQuery(query);
    expect(result.arr).toBeDefined();
    expect(result.arr[0]).toBe('first');
    expect(result.arr[5]).toBe('sixth');
  });
});
