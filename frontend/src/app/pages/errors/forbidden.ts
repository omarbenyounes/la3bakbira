import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forbidden',
  imports: [RouterLink],
  template: `
    <div class="container py-5 text-center">
      <h1 class="display-6 fw-bold">Accès refusé</h1>
      <p class="text-muted">Cette section est réservée aux administrateurs de la boutique.</p>
      <a class="btn btn-primary" routerLink="/">Retour à l'accueil</a>
    </div>
  `,
})
export class Forbidden {}
