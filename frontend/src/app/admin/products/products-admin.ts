import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, debounceTime, of, switchMap, tap } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AdminCatalogService } from '../../core/catalog/admin-catalog.service';
import { Brand, Category, PageResponse, ProductQuery, ProductSummary } from '../../core/catalog/catalog.models';
import { toIndentedList } from '../../core/catalog/category-utils';
import { Confirmer } from '../../core/ui/confirm-dialog';
import { Notifier } from '../../core/ui/notifier';
import { TndPipe } from '../../core/ui/tnd.pipe';

type StatusFilter = 'all' | 'active' | 'inactive';

@Component({
  selector: 'app-products-admin',
  imports: [
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatSelectModule,
    MatSortModule,
    MatTableModule,
    MatTooltipModule,
    TndPipe,
  ],
  templateUrl: './products-admin.html',
  styleUrl: './products-admin.scss',
})
export class ProductsAdmin {
  private readonly api = inject(AdminCatalogService);
  private readonly confirmer = inject(Confirmer);
  private readonly notifier = inject(Notifier);

  protected readonly columns = ['image', 'name', 'category', 'brand', 'price', 'stockQuantity', 'status', 'actions'];

  // Filters, paging and sorting
  protected readonly q = signal('');
  protected readonly categoryId = signal<number | null>(null);
  protected readonly brandId = signal<number | null>(null);
  protected readonly status = signal<StatusFilter>('all');
  protected readonly pageIndex = signal(0);
  protected readonly pageSize = signal(20);
  protected readonly sort = signal<string | undefined>(undefined);
  private readonly refresh = signal(0);

  protected readonly loading = signal(true);
  protected readonly page = signal<PageResponse<ProductSummary> | null>(null);

  protected readonly categoryOptions = signal(toIndentedList([]));
  protected readonly brands = signal<Brand[]>([]);

  private readonly query = computed<ProductQuery>(() => {
    this.refresh();
    return {
      q: this.q().trim() || undefined,
      categoryId: this.categoryId() ?? undefined,
      brandId: this.brandId() ?? undefined,
      active: this.status() === 'all' ? undefined : this.status() === 'active',
      page: this.pageIndex(),
      size: this.pageSize(),
      sort: this.sort(),
    };
  });

  constructor() {
    toObservable(this.query)
      .pipe(
        debounceTime(250),
        tap(() => this.loading.set(true)),
        switchMap((query) =>
          this.api.searchProducts(query).pipe(
            catchError((err) => {
              this.notifier.error(err);
              return of(null);
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((page) => {
        this.page.set(page);
        this.loading.set(false);
      });

    this.api.listCategories().subscribe((cats: Category[]) => this.categoryOptions.set(toIndentedList(cats)));
    this.api.listBrands().subscribe((brands) => this.brands.set(brands));
  }

  /** Any filter change goes back to the first page. */
  protected setFilter<T>(target: { set(value: T): void }, value: T): void {
    target.set(value);
    this.pageIndex.set(0);
  }

  protected onPage(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  protected onSort(event: Sort): void {
    this.sort.set(event.direction ? `${event.active},${event.direction}` : undefined);
    this.pageIndex.set(0);
  }

  protected remove(product: ProductSummary): void {
    this.confirmer
      .ask({ title: 'Supprimer le produit', message: `Supprimer « ${product.name} » ? Cette action est définitive.` })
      .subscribe((ok) => {
        if (!ok) return;
        this.api.deleteProduct(product.id).subscribe({
          next: () => {
            this.notifier.success('Produit supprimé');
            this.refresh.update((n) => n + 1);
          },
          error: (err) => this.notifier.error(err),
        });
      });
  }

  protected indent(depth: number): string {
    return '   '.repeat(depth);
  }
}
