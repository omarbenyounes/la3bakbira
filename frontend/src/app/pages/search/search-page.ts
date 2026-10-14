import { Component, input } from '@angular/core';
import { Breadcrumb } from '../../shop/breadcrumb';
import { ProductListing } from '../../shop/product-listing';

@Component({
  selector: 'app-search-page',
  imports: [Breadcrumb, ProductListing],
  template: `
    <div class="container py-4">
      <app-breadcrumb [items]="[{ label: 'Recherche' }]" />
      <h1 class="h4 fw-bold mb-3">
        @if (q()) { Résultats pour « {{ q() }} » } @else { Tous les produits }
      </h1>
      <app-product-listing [q]="q()" />
    </div>
  `,
})
export class SearchPage {
  /** Bound from the query parameter ?q= */
  readonly q = input('');
}
