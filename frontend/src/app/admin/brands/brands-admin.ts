import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AdminCatalogService } from '../../core/catalog/admin-catalog.service';
import { Brand } from '../../core/catalog/catalog.models';
import { Confirmer } from '../../core/ui/confirm-dialog';
import { Notifier } from '../../core/ui/notifier';
import { BrandDialog } from './brand-dialog';

@Component({
  selector: 'app-brands-admin',
  imports: [MatButtonModule, MatIconModule, MatProgressBarModule, MatTooltipModule],
  template: `
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
      <h1 class="h4 fw-bold mb-0">Marques</h1>
      <button mat-flat-button (click)="openDialog()"><mat-icon>add</mat-icon>Nouvelle marque</button>
    </div>

    <div class="card shadow-sm">
      @if (loading()) { <mat-progress-bar mode="indeterminate" /> }
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr><th style="width: 80px">Logo</th><th>Nom</th><th class="d-none d-md-table-cell">Slug</th><th class="text-center">Statut</th><th class="text-end">Actions</th></tr>
          </thead>
          <tbody>
            @for (brand of brands(); track brand.id) {
              <tr>
                <td>
                  @if (brand.logoUrl) { <img class="logo" [src]="brand.logoUrl" [alt]="brand.name" /> }
                  @else { <span class="text-muted small">—</span> }
                </td>
                <td class="fw-semibold">{{ brand.name }}</td>
                <td class="d-none d-md-table-cell text-muted small">{{ brand.slug }}</td>
                <td class="text-center">
                  <span class="badge" [class]="brand.active ? 'text-bg-success' : 'text-bg-secondary'">
                    {{ brand.active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="text-end text-nowrap">
                  <button mat-icon-button matTooltip="Modifier" (click)="openDialog(brand)"><mat-icon>edit</mat-icon></button>
                  <button mat-icon-button matTooltip="Supprimer" (click)="remove(brand)"><mat-icon>delete</mat-icon></button>
                </td>
              </tr>
            } @empty {
              @if (!loading()) {
                <tr><td colspan="5" class="text-center text-muted py-4">Aucune marque pour le moment.</td></tr>
              }
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: `.logo { max-height: 32px; max-width: 64px; object-fit: contain; }`,
})
export class BrandsAdmin implements OnInit {
  private readonly api = inject(AdminCatalogService);
  private readonly dialog = inject(MatDialog);
  private readonly confirmer = inject(Confirmer);
  private readonly notifier = inject(Notifier);

  protected readonly brands = signal<Brand[]>([]);
  protected readonly loading = signal(true);

  ngOnInit(): void {
    this.load();
  }

  protected openDialog(brand?: Brand): void {
    this.dialog
      .open(BrandDialog, { data: brand, autoFocus: 'first-tabbable' })
      .afterClosed()
      .subscribe((saved?: Brand) => {
        if (saved) {
          this.notifier.success(brand ? 'Marque modifiée' : 'Marque créée');
          this.load();
        }
      });
  }

  protected remove(brand: Brand): void {
    this.confirmer
      .ask({ title: 'Supprimer la marque', message: `Supprimer « ${brand.name} » ? Cette action est définitive.` })
      .subscribe((ok) => {
        if (!ok) return;
        this.api.deleteBrand(brand.id).subscribe({
          next: () => {
            this.notifier.success('Marque supprimée');
            this.load();
          },
          error: (err) => this.notifier.error(err),
        });
      });
  }

  private load(): void {
    this.loading.set(true);
    this.api.listBrands().subscribe({
      next: (brands) => {
        this.brands.set(brands);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.notifier.error(err);
      },
    });
  }
}
