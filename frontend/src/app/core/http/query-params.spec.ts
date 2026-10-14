import { toHttpParams } from './query-params';

describe('toHttpParams', () => {
  it('skips empty values and repeats arrays', () => {
    const params = toHttpParams({ q: 'pc', categoryId: 3, brandId: [1, 2], inStock: undefined, active: false, sort: '' });
    expect(params.toString()).toBe('q=pc&categoryId=3&brandId=1&brandId=2&active=false');
  });

  it('omits an empty array entirely', () => {
    expect(toHttpParams({ brandId: [] }).toString()).toBe('');
  });
});
