import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface Crumb {
  label: string;
  /** Absent for the current page */
  link?: unknown[];
}

@Component({
  selector: 'app-breadcrumb',
  imports: [RouterLink],
  template: `
    <nav aria-label="Fil d'Ariane">
      <ol class="breadcrumb small mb-2">
        <li class="breadcrumb-item"><a routerLink="/">Accueil</a></li>
        @for (crumb of items(); track $index; let last = $last) {
          @if (crumb.link && !last) {
            <li class="breadcrumb-item"><a [routerLink]="crumb.link">{{ crumb.label }}</a></li>
          } @else {
            <li class="breadcrumb-item active" aria-current="page">{{ crumb.label }}</li>
          }
        }
      </ol>
    </nav>
  `,
  styles: `a { text-decoration: none; }`,
})
export class Breadcrumb {
  readonly items = input<Crumb[]>([]);
}
