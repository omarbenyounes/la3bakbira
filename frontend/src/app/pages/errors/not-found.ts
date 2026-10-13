import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `
    <div class="container py-5 text-center">
      <h1 class="display-6 fw-bold">Page introuvable</h1>
      <p class="text-muted">La page demandée n'existe pas ou a été déplacée.</p>
      <a class="btn btn-primary" routerLink="/">Retour à l'accueil</a>
    </div>
  `,
})
export class NotFound {}
