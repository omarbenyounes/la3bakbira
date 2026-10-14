import { Component, computed, effect, inject, input } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { CategoryTreeStore } from '../../core/catalog/category-tree.store';
import { Breadcrumb, Crumb } from '../../shop/breadcrumb';
import { ProductListing } from '../../shop/product-listing';

@Component({
  selector: 'app-category-page',
  imports: [RouterLink, Breadcrumb, ProductListing],
  template: `
    <div class="container py-4">
      @if (category(); as cat) {
        <app-breadcrumb [items]="crumbs()" />
        <h1 class="h3 fw-bold mb-3">{{ cat.name }}</h1>
        <app-product-listing [categoryId]="cat.id" [subcategories]="cat.children" />
      } @else if (store.tree() === undefined) {
        <p class="text-muted">Chargement…</p>
      } @else {
        <h1 class="h4">Catégorie introuvable</h1>
        <a routerLink="/">Retour à l'accueil</a>
      }
    </div>
  `,
})
export class CategoryPage {
  protected readonly store = inject(CategoryTreeStore);
  /** Bound from the route parameter :slug */
  readonly slug = input.required<string>();

  protected readonly category = computed(() => {
    this.store.tree();
    return this.store.findBySlug(this.slug());
  });

  protected readonly crumbs = computed<Crumb[]>(() => {
    const cat = this.category();
    return cat ? this.store.pathTo(cat.id).map((c) => ({ label: c.name, link: ['/categorie', c.slug] })) : [];
  });

  constructor() {
    const title = inject(Title);
    effect(() => {
      const cat = this.category();
      if (cat) title.setTitle(`${cat.name} – la3bakbira`);
    });
  }
}
