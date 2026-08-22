import { describe, it, expect } from 'vitest';
import { orderBySchema } from './orderBySchema';

describe('orderBySchema', () => {
  it('should accept simple asc ordering', () => {
    const result = orderBySchema.safeParse({ name: 'asc' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ name: 'asc' });
    }
  });

  it('should accept simple desc ordering', () => {
    const result = orderBySchema.safeParse({ name: 'desc' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ name: 'desc' });
    }
  });

  it('should accept nested ordering', () => {
    const result = orderBySchema.safeParse({
      user: { name: 'asc' },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ user: { name: 'asc' } });
    }
  });

  it('should accept deeply nested ordering', () => {
    const result = orderBySchema.safeParse({
      user: { address: { city: 'desc' } },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ user: { address: { city: 'desc' } } });
    }
  });

  it('should accept multiple fields', () => {
    const result = orderBySchema.safeParse({
      name: 'asc',
      createdAt: 'desc',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        name: 'asc',
        createdAt: 'desc',
      });
    }
  });

  it('should accept mixed simple and nested ordering', () => {
    const result = orderBySchema.safeParse({
      name: 'asc',
      user: { email: 'desc' },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        name: 'asc',
        user: { email: 'desc' },
      });
    }
  });

  it('should reject invalid sort direction', () => {
    const result = orderBySchema.safeParse({ name: 'ascending' });
    expect(result.success).toBe(false);
  });

  it('should accept numeric keys as strings', () => {
    const result = orderBySchema.safeParse({ 123: 'asc' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data['123']).toBe('asc');
    }
  });

  it('should accept empty object', () => {
    const result = orderBySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({});
    }
  });
});
