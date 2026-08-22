import { describe, expect, it } from 'vitest';
import {
  propertyAreaSquareMetersToHectares,
  propertyDocumentCanRequest,
  propertyLandUseReconcile,
  propertyPriceFormat,
  propertyQuickFactsVisible,
} from '../../../../frontend/src/features/publicImoveis/publicPropertyDetailUtils';

describe('public property detail utilities', () => {
  it('formats price with its currency', () =>
    expect(propertyPriceFormat(1500000, 'USD', 'en-US')).toBe('$1,500,000'));
  it('converts square meters to hectares', () =>
    expect(propertyAreaSquareMetersToHectares(35_000_000)).toBe(3500));
  it('reconciles unclassified land without exceeding the total', () =>
    expect(
      propertyLandUseReconcile(100, [{ name: 'Pasture', areaHa: 72 }], 'Other'),
    ).toEqual([
      { name: 'Pasture', areaHa: 72 },
      { name: 'Other', areaHa: 28 },
    ]));
  it('only shows facts backed by values', () =>
    expect(
      propertyQuickFactsVisible([
        { value: 10 },
        { value: null },
        { value: '' },
      ]),
    ).toEqual([{ value: 10 }]));
  it('only permits document requests for NDA metadata', () => {
    expect(propertyDocumentCanRequest('nda')).toBe(true);
    expect(propertyDocumentCanRequest('authenticated')).toBe(false);
  });
});
