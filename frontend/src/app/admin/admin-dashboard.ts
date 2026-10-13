import { Component, inject } from '@angular/core';
import { AuthService } from '../core/auth/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  template: `
    <h1 class="h4 fw-bold">Bonjour {{ auth.displayName() }}</h1>
    <p class="text-muted mb-0">
      Bienvenue dans l'espace d'administration. La gestion des catégories, produits, marques et offres
      sera ajoutée dans les prochaines étapes.
    </p>
  `,
})
export class AdminDashboard {
  protected readonly auth = inject(AuthService);
}
