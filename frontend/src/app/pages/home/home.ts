import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CategoryTreeStore } from '../../core/catalog/category-tree.store';

@Component({
  selector: 'app-home',
  imports: [RouterLink, MatIconModule],
  template: `
    <section class="hero">
      <div class="container py-5">
        <h1>Le meilleur du high-tech, au meilleur prix</h1>
        <p class="lead mb-0">Informatique, téléphonie, électroménager… livrés partout en Tunisie.</p>
      </div>
    </section>

    <section class="container py-5">
      <h2 class="section-title">Nos catégories</h2>
      @switch (categories()) {
        @case (undefined) {
          <p class="text-muted">Chargement…</p>
        }
        @case (null) {
          <p class="text-danger">Impossible de charger les catégories. Réessayez plus tard.</p>
        }
        @default {
          <div class="row g-3">
            @for (category of categories(); track category.id) {
              <div class="col-6 col-md-4 col-lg-3">
                <a class="category-card" [routerLink]="['/categorie', category.slug]">
                  @if (category.imageUrl) {
                    <img [src]="category.imageUrl" [alt]="category.name" />
                  } @else {
                    <mat-icon>category</mat-icon>
                  }
                  <span>{{ category.name }}</span>
                </a>
              </div>
            } @empty {
              <p class="text-muted">Aucune catégorie pour le moment.</p>
            }
          </div>
        }
      }
    </section>
  `,
  styles: `
    .hero { background: linear-gradient(120deg, var(--brand-dark), var(--brand-primary)); color: #fff; }
    .hero h1 { font-weight: 800; font-size: clamp(1.6rem, 3vw, 2.5rem); }
    .section-title { font-size: 1.4rem; font-weight: 700; margin-bottom: 1.25rem; }
    .category-card {
      display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.5rem;
      height: 140px; padding: 1rem; border: 1px solid #e5e7eb; border-radius: 10px; background: #fff;
      color: #1f2937; font-weight: 600; text-align: center; text-decoration: none;
      transition: box-shadow 0.15s, border-color 0.15s;
    }
    .category-card:hover { border-color: var(--brand-primary); box-shadow: 0 6px 18px rgb(0 0 0 / 8%); }
    .category-card img { max-height: 64px; max-width: 100%; object-fit: contain; }
    .category-card mat-icon { font-size: 40px; width: 40px; height: 40px; color: var(--brand-primary); }
  `,
})
export class Home {
  protected readonly categories = inject(CategoryTreeStore).tree;
}
