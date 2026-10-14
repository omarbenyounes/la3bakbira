import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ProductCard } from './product-card';
import { ProductSummary } from '../core/catalog/catalog.models';

const product = (overrides: Partial<ProductSummary> = {}): ProductSummary => ({
  id: 1, name: 'PC Portable Lenovo IdeaPad', slug: 'pc-lenovo', sku: 'LEN-1', shortDescription: null,
  price: 1500, discountPrice: 1200, effectivePrice: 1200, stockQuantity: 4, inStock: true, active: true,
  featured: false, mainImageUrl: null, category: { id: 1, name: 'PC', slug: 'pc' }, brand: { id: 2, name: 'Lenovo', slug: 'lenovo' },
  ...overrides,
});

describe('ProductCard', () => {
  function render(p: ProductSummary): HTMLElement {
    TestBed.configureTestingModule({ imports: [ProductCard], providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(ProductCard);
    fixture.componentRef.setInput('product', p);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('shows the discount, both prices, brand, stock and links to the product page', () => {
    const el = render(product());
    expect(el.querySelector('.badge-discount')?.textContent?.trim()).toBe('-20%');
    expect(el.querySelector('.price')?.classList).toContain('promo');
    expect(el.querySelector('.old')?.textContent).toContain('1');
    expect(el.querySelector('.brand')?.textContent).toBe('Lenovo');
    expect(el.querySelector('.stock')?.textContent).toContain('En stock');
    expect(el.querySelector('a')?.getAttribute('href')).toBe('/produit/pc-lenovo');
  });

  it('shows a regular price and out-of-stock state', () => {
    const el = render(product({ discountPrice: null, effectivePrice: 1500, inStock: false, stockQuantity: 0 }));
    expect(el.querySelector('.badge-discount')).toBeNull();
    expect(el.querySelector('.old')).toBeNull();
    expect(el.querySelector('.stock')?.textContent).toContain('Rupture de stock');
  });
});
