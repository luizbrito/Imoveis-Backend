import { describe, it, expect } from 'vitest';
import { formatDecimal } from '../formatDecimal';

describe('formatDecimal', () => {
  it('should format decimal with en locale', () => {
    const result = formatDecimal('1234.5678', 'en');
    expect(result).toBe('1,234.568');
  });

  it('should respect maximumFractionDigits', () => {
    const result = formatDecimal('1234.5678', 'en', 2);
    expect(result).toBe('1,234.57');
  });

  it('should handle zero maximumFractionDigits', () => {
    const result = formatDecimal('1234.5678', 'en', 0);
    expect(result).toBe('1,235');
  });

  it('should handle null value', () => {
    const result = formatDecimal(null, 'en');
    expect(result).toBe('');
  });

  it('should handle undefined value', () => {
    const result = formatDecimal(undefined, 'en');
    expect(result).toBe('');
  });

  it('should handle string numbers', () => {
    const result = formatDecimal('42', 'en');
    expect(result).toBe('42');
  });

  it('should handle negative numbers', () => {
    const result = formatDecimal('-1234.56', 'en', 2);
    expect(result).toBe('-1,234.56');
  });

  it('should handle very small numbers', () => {
    const result = formatDecimal('0.001', 'en', 3);
    expect(result).toBe('0.001');
  });

  it('should handle very large numbers', () => {
    const result = formatDecimal('999999999.99', 'en', 2);
    expect(result).toBe('999,999,999.99');
  });
});
