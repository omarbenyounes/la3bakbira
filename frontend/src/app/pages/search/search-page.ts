import { Component, input } from '@angular/core';

@Component({
  selector: 'app-search-page',
  template: `
    <div class="container py-4">
      <h1 class="h4">Résultats pour « {{ q() }} »</h1>
      <p class="text-muted">Les produits correspondants s'afficheront ici.</p>
    </div>
  `,
})
export class SearchPage {
  /** Bound from the query parameter ?q= */
  readonly q = input('');
}
