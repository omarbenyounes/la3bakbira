import { Routes } from '@angular/router';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { FrenchPaginatorIntl } from '../core/ui/paginator-intl-fr';
import { AdminLayout } from './admin-layout';
import { AdminDashboard } from './admin-dashboard';

/** Loaded lazily, only after adminGuard has granted access. */
export default [
  {
    path: '',
    component: AdminLayout,
    // Provided here (lazy) rather than app-wide so the paginator stays out of the initial bundle
    providers: [{ provide: MatPaginatorIntl, useClass: FrenchPaginatorIntl }],
    children: [
      { path: '', component: AdminDashboard, title: 'Administration – la3bakbira' },
      {
        path: 'categories',
        loadComponent: () => import('./categories/categories-admin').then((m) => m.CategoriesAdmin),
        title: 'Catégories – Administration',
      },
      {
        path: 'marques',
        loadComponent: () => import('./brands/brands-admin').then((m) => m.BrandsAdmin),
        title: 'Marques – Administration',
      },
      {
        path: 'produits',
        loadComponent: () => import('./products/products-admin').then((m) => m.ProductsAdmin),
        title: 'Produits – Administration',
      },
      {
        path: 'produits/nouveau',
        loadComponent: () => import('./products/product-form').then((m) => m.ProductForm),
        title: 'Nouveau produit – Administration',
      },
      {
        path: 'produits/:id',
        loadComponent: () => import('./products/product-form').then((m) => m.ProductForm),
        title: 'Modifier le produit – Administration',
      },
    ],
  },
] satisfies Routes;
