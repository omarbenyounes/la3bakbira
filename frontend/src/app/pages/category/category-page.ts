import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CategoryTreeStore } from '../../core/catalog/category-tree.store';

@Component({
  selector: 'app-category-page',
  imports: [RouterLink],
  template: `
    <div class="container py-4">
      @if (category(); as cat) {
        <h1 class="h3 fw-bold">{{ cat.name }}</h1>
        @if (cat.children.length) {
          <div class="d-flex flex-wrap gap-2 my-3">
            @for (sub of cat.children; track sub.id) {
              <a class="btn btn-outline-primary btn-sm" [routerLink]="['/categorie', sub.slug]">{{ sub.name }}</a>
            }
          </div>
        }
        <p class="text-muted">Les produits de cette catégorie s'afficheront ici.</p>
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
}
