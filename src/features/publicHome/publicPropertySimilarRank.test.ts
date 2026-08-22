import { describe, expect, it } from 'vitest';
import { publicPropertySimilarRank } from './publicPropertySimilarRank';

describe('publicPropertySimilarRank', () => {
  it('prioritizes candidates with matching geography, area and price', () => {
    const reference = {
      country: 'PY',
      state: 'Concepción',
      city: 'Horqueta',
      areaHa: 1000,
      pricePerHa: 2000,
    };
    expect(
      publicPropertySimilarRank(reference, { ...reference, areaHa: 900 }),
    ).toBeGreaterThan(
      publicPropertySimilarRank(reference, {
        country: 'BR',
        state: 'GO',
        city: 'Goiânia',
        areaHa: 3000,
        pricePerHa: 6000,
      }),
    );
  });
});
