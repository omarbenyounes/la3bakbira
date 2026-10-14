import { Routes } from '@angular/router';
import { adminGuard } from './core/auth/admin.guard';
import { Home } from './pages/home/home';
import { Forbidden } from './pages/errors/forbidden';
import { NotFound } from './pages/errors/not-found';

export const routes: Routes = [
  { path: '', component: Home, title: 'la3bakbira – High-tech et plus' },
  {
    path: 'categorie/:slug',
    loadComponent: () => import('./pages/category/category-page').then((m) => m.CategoryPage),
    title: 'Catégorie – la3bakbira',
  },
  {
    path: 'produit/:slug',
    loadComponent: () => import('./pages/product/product-page').then((m) => m.ProductPage),
    title: 'Produit – la3bakbira',
  },
  {
    path: 'recherche',
    loadComponent: () => import('./pages/search/search-page').then((m) => m.SearchPage),
    title: 'Recherche – la3bakbira',
  },
  { path: 'acces-refuse', component: Forbidden, title: 'Accès refusé – la3bakbira' },
  { path: 'admin', canActivate: [adminGuard], loadChildren: () => import('./admin/admin.routes') },
  { path: '**', component: NotFound, title: 'Page introuvable – la3bakbira' },
];
