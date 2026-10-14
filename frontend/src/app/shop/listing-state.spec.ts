import { convertToParamMap } from '@angular/router';
import { discountPercent, parseListingState, toQueryParams } from './listing-state';

describe('listing URL state', () => {
  it('parses filters from the query string', () => {
    const state = parseListingState(
      convertToParamMap({ marques: '3,7,x', prixMin: '500', prixMax: '2000', stock: '1', tri: 'prix-asc', page: '2' }),
    );
    expect(state).toEqual({ brands: [3, 7], minPrice: 500, maxPrice: 2000, inStock: true, sort: 'prix-asc', page: 2 });
  });

  it('falls back to defaults for missing or invalid values', () => {
    const state = parseListingState(convertToParamMap({ tri: 'hack', page: '-4', prixMin: 'abc' }));
    expect(state).toEqual({ brands: [], minPrice: null, maxPrice: null, inStock: false, sort: 'nouveautes', page: 1 });
  });

  it('writes short URLs: defaults are removed', () => {
    expect(toQueryParams({ brands: [], minPrice: null, maxPrice: null, inStock: false, sort: 'nouveautes', page: 1 })).toEqual({
      marques: null, prixMin: null, prixMax: null, stock: null, tri: null, page: null,
    });
    expect(toQueryParams({ brands: [1, 2], minPrice: 0, maxPrice: 99, inStock: true, sort: 'nom', page: 3 })).toEqual({
      marques: '1,2', prixMin: 0, prixMax: 99, stock: '1', tri: 'nom', page: 3,
    });
  });

  it('computes the discount percentage shown on cards', () => {
    expect(discountPercent(1500, 1200)).toBe(20);
    expect(discountPercent(1999, 1849)).toBe(8);
    expect(discountPercent(100, null)).toBeNull();
    expect(discountPercent(100, 100)).toBeNull();
  });
});
