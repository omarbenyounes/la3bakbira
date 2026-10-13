import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

/** Shell of the admin dashboard: sidebar + content. Sections are enabled as they are built. */
@Component({
  selector: 'app-admin-layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, MatIconModule],
  template: `
    <div class="admin">
      <aside class="sidebar">
        <div class="sidebar-title">Administration</div>
        <nav>
          <a routerLink="/admin" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
            <mat-icon>dashboard</mat-icon>Tableau de bord
          </a>
          @for (section of upcoming; track section.label) {
            <span class="disabled" title="Disponible prochainement"><mat-icon>{{ section.icon }}</mat-icon>{{ section.label }}</span>
          }
        </nav>
      </aside>
      <main class="content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: `
    .admin { display: flex; min-height: calc(100vh - 220px); background: #f3f4f6; }
    .sidebar { width: 240px; flex-shrink: 0; background: #111827; color: #d1d5db; padding: 1rem 0; }
    .sidebar-title { padding: 0 1.25rem 0.75rem; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; color: #9ca3af; }
    nav a, nav span { display: flex; align-items: center; gap: 0.75rem; padding: 0.6rem 1.25rem; color: inherit; text-decoration: none; }
    nav a:hover, nav a.active { background: #1f2937; color: #fff; }
    nav .disabled { opacity: 0.45; cursor: not-allowed; }
    .content { flex: 1; padding: 1.5rem; min-width: 0; }
    @media (max-width: 767.98px) { .admin { flex-direction: column; } .sidebar { width: 100%; } }
  `,
})
export class AdminLayout {
  protected readonly upcoming = [
    { icon: 'category', label: 'Catégories' },
    { icon: 'inventory_2', label: 'Produits' },
    { icon: 'sell', label: 'Marques' },
    { icon: 'local_offer', label: 'Offres' },
    { icon: 'receipt_long', label: 'Commandes' },
  ];
}
