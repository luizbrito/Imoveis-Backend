import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import type { Env } from '../../../env';

// Create mutable mock env object (hoisted for vi.mock)
const mockEnv = vi.hoisted(() => ({}) as Partial<Env>);

// Mock env module with mutable object
vi.mock('../../../env', () => ({
  env: mockEnv,
}));

describe('authTrustedOrigins', () => {
  beforeEach(() => {
    // Module mock handles dynamic env access
  });

  afterEach(() => {
    // Module mock handles dynamic env access
  });

  describe('multi-domain subdomain mode', () => {
    it('should return wildcard pattern for subdomains', async () => {
      mockEnv.ORGANIZATION_MODE = 'multi-domain';
      mockEnv.ORGANIZATION_MULTI_DOMAIN_MODE = 'subdomain';
      mockEnv.FRONTEND_URL = 'https://app.example.com';

      const { authTrustedOrigins } = await import('../authTrustedOrigins');
      const origins = authTrustedOrigins();

      expect(origins).toHaveLength(2);
      expect(origins[0]).toBe('https://app.example.com');
      expect(origins[1]).toBe('https://*.app.example.com');
    });

    it('should handle FRONTEND_URL with wildcard prefix', async () => {
      mockEnv.ORGANIZATION_MODE = 'multi-domain';
      mockEnv.ORGANIZATION_MULTI_DOMAIN_MODE = 'subdomain';
      mockEnv.FRONTEND_URL = 'https://*.example.com';

      const { authTrustedOrigins } = await import('../authTrustedOrigins');
      const origins = authTrustedOrigins();

      // When FRONTEND_URL has wildcard, it's stripped to base then wildcard added
      expect(origins).toHaveLength(2);
      expect(origins[0]).toBe('https://example.com');
      expect(origins[1]).toBe('https://*.example.com');
    });

    it('should include port in wildcard pattern if present', async () => {
      mockEnv.ORGANIZATION_MODE = 'multi-domain';
      mockEnv.ORGANIZATION_MULTI_DOMAIN_MODE = 'subdomain';
      mockEnv.FRONTEND_URL = 'http://app.localhost:5173';

      const { authTrustedOrigins } = await import('../authTrustedOrigins');
      const origins = authTrustedOrigins();

      expect(origins).toHaveLength(2);
      expect(origins[0]).toBe('http://app.localhost:5173');
      expect(origins[1]).toBe('http://*.app.localhost:5173');
    });

    it('should use default URL when FRONTEND_URL is not set', async () => {
      mockEnv.ORGANIZATION_MODE = 'multi-domain';
      mockEnv.ORGANIZATION_MULTI_DOMAIN_MODE = 'subdomain';
      mockEnv.FRONTEND_URL = undefined;

      const { authTrustedOrigins } = await import('../authTrustedOrigins');
      const origins = authTrustedOrigins();

      expect(origins).toHaveLength(2);
      expect(origins[0]).toBe('http://localhost:5173');
      expect(origins[1]).toBe('http://*.localhost:5173');
    });
  });

  describe('multi-domain full domain mode', () => {
    it('should return frontend URL plus trusted origins', async () => {
      mockEnv.ORGANIZATION_MODE = 'multi-domain';
      mockEnv.ORGANIZATION_MULTI_DOMAIN_MODE = 'domain';
      mockEnv.FRONTEND_URL = 'https://app.example.com';
      mockEnv.ORGANIZATION_DOMAIN_TRUSTED_ORIGINS = [
        'https://org1.com',
        'https://org2.com',
      ];

      const { authTrustedOrigins } = await import('../authTrustedOrigins');
      const origins = authTrustedOrigins();

      expect(origins).toHaveLength(3);
      expect(origins[0]).toBe('https://app.example.com');
      expect(origins[1]).toBe('https://org1.com');
      expect(origins[2]).toBe('https://org2.com');
    });

    it('should return only frontend URL when no trusted origins', async () => {
      mockEnv.ORGANIZATION_MODE = 'multi-domain';
      mockEnv.ORGANIZATION_MULTI_DOMAIN_MODE = 'domain';
      mockEnv.FRONTEND_URL = 'https://app.example.com';
      mockEnv.ORGANIZATION_DOMAIN_TRUSTED_ORIGINS = [];

      const { authTrustedOrigins } = await import('../authTrustedOrigins');
      const origins = authTrustedOrigins();

      expect(origins).toHaveLength(1);
      expect(origins[0]).toBe('https://app.example.com');
    });
  });

  describe('multi organization mode', () => {
    it('should return single frontend URL', async () => {
      mockEnv.ORGANIZATION_MODE = 'multi';
      mockEnv.ORGANIZATION_MULTI_DOMAIN_MODE = 'subdomain';
      mockEnv.FRONTEND_URL = 'https://app.example.com';

      const { authTrustedOrigins } = await import('../authTrustedOrigins');
      const origins = authTrustedOrigins();

      expect(origins).toHaveLength(1);
      expect(origins[0]).toBe('https://app.example.com');
    });
  });

  describe('single organization mode', () => {
    it('should return single frontend URL', async () => {
      mockEnv.ORGANIZATION_MODE = 'single';
      mockEnv.ORGANIZATION_MULTI_DOMAIN_MODE = undefined;
      mockEnv.FRONTEND_URL = 'https://app.example.com';

      const { authTrustedOrigins } = await import('../authTrustedOrigins');
      const origins = authTrustedOrigins();

      expect(origins).toHaveLength(1);
      expect(origins[0]).toBe('https://app.example.com');
    });
  });
});
