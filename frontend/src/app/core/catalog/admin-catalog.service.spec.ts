import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AdminCatalogService } from './admin-catalog.service';

describe('AdminCatalogService', () => {
  let service: AdminCatalogService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(AdminCatalogService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('sends only the filters that are set', () => {
    service.searchProducts({ q: 'galaxy', categoryId: 3, brandId: undefined, active: false, page: 0, size: 20, sort: 'price,asc' }).subscribe();
    const req = http.expectOne((r) => r.url === '/api/catalog/products');
    expect(req.request.params.keys().sort()).toEqual(['active', 'categoryId', 'page', 'q', 'size', 'sort']);
    expect(req.request.params.get('active')).toBe('false');
    expect(req.request.params.get('sort')).toBe('price,asc');
    req.flush({ content: [], page: 0, size: 20, totalElements: 0, totalPages: 0 });
  });

  it('uses REST verbs on the catalog endpoints', () => {
    service.updateCategory(5, { name: 'X' }).subscribe();
    expect(http.expectOne('/api/catalog/categories/5').request.method).toBe('PUT');
    service.deleteBrand(2).subscribe();
    expect(http.expectOne('/api/catalog/brands/2').request.method).toBe('DELETE');
    service.createProduct({ name: 'P', sku: 'S', price: 1, stockQuantity: 0, categoryId: 1 }).subscribe();
    expect(http.expectOne('/api/catalog/products').request.method).toBe('POST');
  });
});
