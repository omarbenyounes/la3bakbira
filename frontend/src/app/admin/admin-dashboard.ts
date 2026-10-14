import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../core/auth/auth.service';
import { AdminCatalogService } from '../core/catalog/admin-catalog.service';

interface Stat {
  label: string;
  value: number;
  icon: string;
  link: string;
}

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterLink, MatIconModule],
  template: `
    <h1 class="h4 fw-bold">Bonjour {{ auth.displayName() }}</h1>
    <p class="text-muted">Voici un aperçu de votre catalogue.</p>

    <div class="row g-3">
      @for (stat of stats(); track stat.label) {
        <div class="col-12 col-sm-6 col-lg-4">
          <a class="stat card shadow-sm" [routerLink]="stat.link">
            <mat-icon>{{ stat.icon }}</mat-icon>
            <div>
              <div class="value">{{ stat.value }}</div>
              <div class="label">{{ stat.label }}</div>
            </div>
          </a>
        </div>
      }
    </div>
  `,
  styles: `
    .stat { display: flex; align-items: center; gap: 1rem; padding: 1.25rem; color: inherit; text-decoration: none; }
    .stat:hover { border-color: var(--brand-primary); }
    .stat mat-icon { font-size: 36px; width: 36px; height: 36px; color: var(--brand-primary); }
    .value { font-size: 1.6rem; font-weight: 700; line-height: 1.1; }
    .label { color: #6b7280; font-size: 0.9rem; }
  `,
})
export class AdminDashboard {
  protected readonly auth = inject(AuthService);
  protected readonly stats = signal<Stat[]>([]);

  constructor() {
    const api = inject(AdminCatalogService);
    forkJoin({
      categories: api.listCategories(),
      brands: api.listBrands(),
      products: api.searchProducts({ size: 1 }),
    }).subscribe(({ categories, brands, products }) =>
      this.stats.set([
        { label: 'Produits', value: products.totalElements, icon: 'inventory_2', link: '/admin/produits' },
        { label: 'Catégories', value: categories.length, icon: 'category', link: '/admin/categories' },
        { label: 'Marques', value: brands.length, icon: 'sell', link: '/admin/marques' },
      ]),
    );
  }
}
