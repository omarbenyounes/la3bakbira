import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CategoryTreeStore } from '../../core/catalog/category-tree.store';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  template: `
    <footer class="site-footer">
      <div class="container py-5">
        <div class="row g-4">
          <div class="col-12 col-md-4">
            <div class="footer-logo">la3bak<span>bira</span></div>
            <p class="mt-2 mb-0">Informatique, téléphonie, électroménager et bien plus, livrés partout en Tunisie.</p>
          </div>
          <div class="col-6 col-md-3">
            <h6>Catégories</h6>
            <ul>
              @for (category of topCategories(); track category.id) {
                <li><a [routerLink]="['/categorie', category.slug]">{{ category.name }}</a></li>
              }
            </ul>
          </div>
          <div class="col-6 col-md-2">
            <h6>Service client</h6>
            <ul>
              <li>Livraison</li>
              <li>Retours</li>
              <li>Garantie</li>
            </ul>
          </div>
          <div class="col-12 col-md-3">
            <h6>Contact</h6>
            <ul>
              <li>+216 70 000 000</li>
              <li>contact&#64;la3bakbira.tn</li>
              <li>Tunis, Tunisie</li>
            </ul>
          </div>
        </div>
      </div>
      <div class="copyright">© {{ year }} la3bakbira – Tous droits réservés</div>
    </footer>
  `,
  styles: `
    .site-footer { background: #0f172a; color: #cbd5e1; font-size: 0.9rem; }
    .footer-logo { font-size: 1.5rem; font-weight: 800; color: #fff; }
    .footer-logo span { color: var(--brand-accent); }
    h6 { color: #fff; font-weight: 600; margin-bottom: 0.75rem; }
    ul { list-style: none; padding: 0; margin: 0; }
    li { padding: 0.15rem 0; }
    a { color: inherit; text-decoration: none; }
    a:hover { color: #fff; }
    .copyright { border-top: 1px solid #1e293b; padding: 1rem; text-align: center; font-size: 0.8rem; }
  `,
})
export class Footer {
  private readonly tree = inject(CategoryTreeStore).tree;
  protected readonly topCategories = computed(() => (this.tree() ?? []).slice(0, 6));
  protected readonly year = new Date().getFullYear();
}
