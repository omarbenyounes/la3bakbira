import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AdminCatalogService } from '../../core/catalog/admin-catalog.service';
import { Category, CategoryRequest } from '../../core/catalog/catalog.models';
import { siblingsOf, toIndentedList } from '../../core/catalog/category-utils';
import { CategoryTreeStore } from '../../core/catalog/category-tree.store';
import { Confirmer } from '../../core/ui/confirm-dialog';
import { Notifier } from '../../core/ui/notifier';
import { CategoryDialog, CategoryDialogData } from './category-dialog';

const toRequest = (c: Category): CategoryRequest => ({
  name: c.name,
  slug: c.slug,
  description: c.description,
  imageUrl: c.imageUrl,
  parentId: c.parentId,
  displayOrder: c.displayOrder,
  active: c.active,
});

@Component({
  selector: 'app-categories-admin',
  imports: [MatButtonModule, MatIconModule, MatProgressBarModule, MatTooltipModule],
  template: `
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
      <h1 class="h4 fw-bold mb-0">Catégories</h1>
      <button mat-flat-button (click)="openDialog()"><mat-icon>add</mat-icon>Nouvelle catégorie</button>
    </div>

    <div class="card shadow-sm">
      @if (loading()) { <mat-progress-bar mode="indeterminate" /> }
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>Nom</th>
              <th class="d-none d-md-table-cell">Slug</th>
              <th class="text-center">Ordre</th>
              <th class="text-center">Statut</th>
              <th class="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (row of rows(); track row.category.id; let first = $first) {
              <tr>
                <td [style.padding-left.rem]="0.75 + row.depth * 1.5">
                  @if (row.depth > 0) { <span class="text-muted me-1">└</span> }
                  <span [class.fw-semibold]="row.depth === 0">{{ row.category.name }}</span>
                </td>
                <td class="d-none d-md-table-cell text-muted small">{{ row.category.slug }}</td>
                <td class="text-center text-nowrap">
                  <button mat-icon-button matTooltip="Monter" (click)="move(row.category, -1)"
                          [disabled]="busy() || isFirstSibling(row.category)">
                    <mat-icon>arrow_upward</mat-icon>
                  </button>
                  <button mat-icon-button matTooltip="Descendre" (click)="move(row.category, 1)"
                          [disabled]="busy() || isLastSibling(row.category)">
                    <mat-icon>arrow_downward</mat-icon>
                  </button>
                </td>
                <td class="text-center">
                  <span class="badge" [class]="row.category.active ? 'text-bg-success' : 'text-bg-secondary'">
                    {{ row.category.active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="text-end text-nowrap">
                  <button mat-icon-button matTooltip="Ajouter une sous-catégorie" (click)="openDialog(undefined, row.category.id)">
                    <mat-icon>add_circle_outline</mat-icon>
                  </button>
                  <button mat-icon-button matTooltip="Modifier" (click)="openDialog(row.category)"><mat-icon>edit</mat-icon></button>
                  <button mat-icon-button matTooltip="Supprimer" (click)="remove(row.category)"><mat-icon>delete</mat-icon></button>
                </td>
              </tr>
            } @empty {
              @if (!loading()) {
                <tr><td colspan="5" class="text-center text-muted py-4">Aucune catégorie. Créez la première !</td></tr>
              }
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class CategoriesAdmin implements OnInit {
  private readonly api = inject(AdminCatalogService);
  private readonly dialog = inject(MatDialog);
  private readonly confirmer = inject(Confirmer);
  private readonly notifier = inject(Notifier);
  private readonly treeStore = inject(CategoryTreeStore);

  protected readonly categories = signal<Category[]>([]);
  protected readonly loading = signal(true);
  protected readonly busy = signal(false);
  protected readonly rows = computed(() => toIndentedList(this.categories()));

  ngOnInit(): void {
    this.load();
  }

  protected openDialog(category?: Category, parentId?: number): void {
    const data: CategoryDialogData = { category, parentId, categories: this.categories() };
    this.dialog
      .open(CategoryDialog, { data, autoFocus: 'first-tabbable' })
      .afterClosed()
      .subscribe((saved?: Category) => {
        if (saved) {
          this.notifier.success(category ? 'Catégorie modifiée' : 'Catégorie créée');
          this.changed();
        }
      });
  }

  protected remove(category: Category): void {
    this.confirmer
      .ask({ title: 'Supprimer la catégorie', message: `Supprimer « ${category.name} » ? Cette action est définitive.` })
      .subscribe((ok) => {
        if (!ok) return;
        this.api.deleteCategory(category.id).subscribe({
          next: () => {
            this.notifier.success('Catégorie supprimée');
            this.changed();
          },
          error: (err) => this.notifier.error(err),
        });
      });
  }

  protected isFirstSibling(category: Category): boolean {
    return siblingsOf(category, this.categories())[0]?.id === category.id;
  }

  protected isLastSibling(category: Category): boolean {
    return siblingsOf(category, this.categories()).at(-1)?.id === category.id;
  }

  /** Swaps with the previous/next sibling, then renumbers siblings 0, 10, 20… and saves those that changed. */
  protected move(category: Category, direction: -1 | 1): void {
    const siblings = siblingsOf(category, this.categories());
    const index = siblings.findIndex((c) => c.id === category.id);
    const target = index + direction;
    if (target < 0 || target >= siblings.length) return;
    [siblings[index], siblings[target]] = [siblings[target], siblings[index]];

    const updates: Observable<Category>[] = siblings
      .map((c, i) => ({ c, order: i * 10 }))
      .filter(({ c, order }) => c.displayOrder !== order)
      .map(({ c, order }) => this.api.updateCategory(c.id, { ...toRequest(c), displayOrder: order }));

    this.busy.set(true);
    forkJoin(updates).subscribe({
      next: () => this.changed(),
      error: (err) => {
        this.notifier.error(err);
        this.changed();
      },
    });
  }

  private changed(): void {
    this.load();
    this.treeStore.reload(); // keep the storefront menu in sync
  }

  private load(): void {
    this.loading.set(true);
    this.api.listCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories);
        this.loading.set(false);
        this.busy.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.busy.set(false);
        this.notifier.error(err);
      },
    });
  }
}
