import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CategoryTreeNode } from './catalog.models';

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
}
