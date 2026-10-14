import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { toHttpParams } from '../http/query-params';
import { CategoryTreeNode, PageResponse, Product, ProductFacets, ProductQuery, ProductSummary } from './catalog.models';

/** Public catalog reads for the storefront (the server only returns active products to shoppers). */
@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/catalog`;

  /** Active categories only, nested, already sorted by display order. */
  getCategoryTree(): Observable<CategoryTreeNode[]> {
    return this.http.get<CategoryTreeNode[]>(`${this.baseUrl}/categories/tree`, {
      params: { activeOnly: true },
    });
  }

  searchProducts(query: ProductQuery): Observable<PageResponse<ProductSummary>> {
    return this.http.get<PageResponse<ProductSummary>>(`${this.baseUrl}/products`, { params: toHttpParams(query) });
  }

  getFacets(query: ProductQuery): Observable<ProductFacets> {
    return this.http.get<ProductFacets>(`${this.baseUrl}/products/facets`, { params: toHttpParams(query) });
  }

  getProductBySlug(slug: string): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/products/slug/${encodeURIComponent(slug)}`);
  }
}
