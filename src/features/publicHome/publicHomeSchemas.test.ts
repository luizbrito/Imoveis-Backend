import { describe, expect, it } from 'vitest';
import {
  publicGeographySchema,
  publicHomeStatsSchema,
  publicSiteMetadataSchema,
} from './publicHomeSchemas';

describe('publicHomeSchemas', () => {
  it('accepts nonnegative public statistics', () => {
    expect(
      publicHomeStatsSchema.parse({
        properties: 12,
        farms: 4,
        cities: 3,
        hectares: 1550.5,
        featured: 2,
      }),
    ).toMatchObject({ properties: 12, farms: 4 });
  });

  it('rejects invalid statistics', () => {
    expect(() =>
      publicHomeStatsSchema.parse({
        properties: -1,
        farms: 0,
        cities: 0,
        hectares: 0,
        featured: 0,
      }),
    ).toThrow();
  });

  it('validates tenant-configured public content', () => {
    const result = publicSiteMetadataSchema.parse({
      email: 'contato@example.com',
      social: { instagram: 'https://instagram.com/example' },
      testimonials: [
        {
          id: 'customer-1',
          quote: 'Atendimento excelente.',
          name: 'Cliente',
          profile: null,
          city: 'São Paulo',
          photoUrl: null,
          rating: 5,
        },
      ],
    });

    expect(result.testimonials).toHaveLength(1);
  });

  it('keeps geography identifiers and kinds consistent', () => {
    const result = publicGeographySchema.parse({
      regions: [],
      locations: [
        {
          id: 'city:550e8400-e29b-41d4-a716-446655440000',
          label: 'Goiânia, GO',
          kind: 'city',
          countryId: null,
          stateId: null,
          cityId: '550e8400-e29b-41d4-a716-446655440000',
        },
      ],
    });

    expect(result.locations[0].kind).toBe('city');
  });
});
