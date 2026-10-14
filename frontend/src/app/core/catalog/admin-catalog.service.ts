import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { toHttpParams } from '../http/query-params';
import {
  Brand,
  BrandRequest,
  Category,
  CategoryRequest,
  PageResponse,
  Product,
  ProductQuery,
  ProductRequest,
  ProductSummary,
} from './catalog.models';

/** Catalog management calls. Writes need the ADMIN role (token added by the interceptor). */
@Injectable({ providedIn: 'root' })
export class AdminCatalogService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/catalog`;

  // Categories
  listCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseUrl}/categories`);
  }

  createCategory(body: CategoryRequest): Observable<Category> {
    return this.http.post<Category>(`${this.baseUrl}/categories`, body);
  }

  updateCategory(id: number, body: CategoryRequest): Observable<Category> {
    return this.http.put<Category>(`${this.baseUrl}/categories/${id}`, body);
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/categories/${id}`);
  }

  // Brands
  listBrands(): Observable<Brand[]> {
    return this.http.get<Brand[]>(`${this.baseUrl}/brands`);
  }

  createBrand(body: BrandRequest): Observable<Brand> {
    return this.http.post<Brand>(`${this.baseUrl}/brands`, body);
  }

  updateBrand(id: number, body: BrandRequest): Observable<Brand> {
    return this.http.put<Brand>(`${this.baseUrl}/brands/${id}`, body);
  }

  deleteBrand(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/brands/${id}`);
  }

  // Products
  searchProducts(query: ProductQuery): Observable<PageResponse<ProductSummary>> {
    return this.http.get<PageResponse<ProductSummary>>(`${this.baseUrl}/products`, { params: toHttpParams(query) });
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/products/${id}`);
  }

  createProduct(body: ProductRequest): Observable<Product> {
    return this.http.post<Product>(`${this.baseUrl}/products`, body);
  }

  updateProduct(id: number, body: ProductRequest): Observable<Product> {
    return this.http.put<Product>(`${this.baseUrl}/products/${id}`, body);
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/products/${id}`);
  }
}
