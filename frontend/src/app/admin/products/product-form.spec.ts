import { FormControl, FormGroup } from '@angular/forms';
import { discountLowerThanPrice } from './product-form';

describe('discountLowerThanPrice', () => {
  const group = (price: number | null, discountPrice: number | null) =>
    new FormGroup({ price: new FormControl(price), discountPrice: new FormControl(discountPrice) });

  it('accepts a missing discount or a lower discount', () => {
    expect(discountLowerThanPrice(group(100, null))).toBeNull();
    expect(discountLowerThanPrice(group(100, 89.9))).toBeNull();
  });

  it('rejects a discount equal to or above the price', () => {
    expect(discountLowerThanPrice(group(100, 100))).toEqual({ discountTooHigh: true });
    expect(discountLowerThanPrice(group(100, 150))).toEqual({ discountTooHigh: true });
  });
});
