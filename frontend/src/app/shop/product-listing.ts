import { Component, computed, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, distinctUntilChanged, map, of, switchMap, tap } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { CatalogService } from '../core/catalog/catalog.service';
import { CategoryTreeNode, ProductQuery } from '../core/catalog/catalog.models';
import { TndPipe } from '../core/ui/tnd.pipe';
import { ListingState, parseListingState, SORTS, SortKey, toQueryParams } from './listing-state';
import { Pager } from './pager';
import { ProductCard } from './product-card';

const PAGE_SIZE = 24;
const sameJson = <T>(a: T, b: T) => JSON.stringify(a) === JSON.stringify(b);

/** Filters + sort + product grid + pagination. Filter state lives in the URL query string. */
@Component({
  selector: 'app-product-listing',
  imports: [RouterLink, MatIconModule, TndPipe, Pager, ProductCard],
  templateUrl: './product-listing.html',
  styleUrl: './product-listing.scss',
})
export class ProductListing {
  /** Restrict to a category branch (category page) */
  readonly categoryId = input<number>();
  /** Full-text query (search page) */
  readonly q = input<string>();
  /** Sub-categories offered as links in the sidebar */
  readonly subcategories = input<CategoryTreeNode[]>([]);

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly catalog = inject(CatalogService);

  protected readonly sorts = Object.entries(SORTS) as [SortKey, (typeof SORTS)[SortKey]][];
  protected readonly filtersOpen = signal(false);
  protected readonly loading = signal(true);

  protected readonly state = toSignal(this.route.queryParamMap.pipe(map(parseListingState)), { requireSync: true });

  private readonly baseQuery = computed<ProductQuery>(() => ({
    q: this.q()?.trim() || undefined,
    categoryId: this.categoryId(),
  }));

  private readonly productQuery = computed<ProductQuery>(() => {
    const s = this.state();
    return {
      ...this.baseQuery(),
      brandId: s.brands,
      minPrice: s.minPrice ?? undefined,
      maxPrice: s.maxPrice ?? undefined,
      inStock: s.inStock || undefined,
      sort: SORTS[s.sort].api,
      page: s.page - 1,
      size: PAGE_SIZE,
    };
  });

  /** undefined = loading, null = error */
  protected readonly results = toSignal(
    toObservable(this.productQuery).pipe(
      distinctUntilChanged(sameJson),
      tap(() => this.loading.set(true)),
      switchMap((query) => this.catalog.searchProducts(query).pipe(catchError(() => of(null)))),
      tap(() => this.loading.set(false)),
    ),
    { initialValue: undefined },
  );

  /** Brand list and price range ignore the brand/price filters themselves (computed server-side). */
  protected readonly facets = toSignal(
    toObservable(computed(() => ({ ...this.baseQuery(), inStock: this.state().inStock || undefined }))).pipe(
      distinctUntilChanged(sameJson),
      switchMap((query) => this.catalog.getFacets(query).pipe(catchError(() => of(null)))),
    ),
    { initialValue: undefined },
  );

  protected readonly hasFilters = computed(() => {
    const s = this.state();
    return s.brands.length > 0 || s.minPrice !== null || s.maxPrice !== null || s.inStock;
  });

  protected readonly selectedBrands = computed(() =>
    (this.facets()?.brands ?? []).filter((b) => this.state().brands.includes(b.id)),
  );

  /** e.g. "Min 399" / "Max 4699": whole dinars, matching what the inputs accept. */
  protected pricePlaceholder(label: string, value: number | null | undefined, round: 'floor' | 'ceil'): string {
    return value === null || value === undefined ? label : `${label} ${Math[round](value)}`;
  }

  protected toggleBrand(id: number, checked: boolean): void {
    const brands = checked ? [...this.state().brands, id] : this.state().brands.filter((b) => b !== id);
    this.update({ brands });
  }

  protected applyPrice(min: string, max: string): void {
    let minPrice = min === '' ? null : Math.max(0, Number(min));
    let maxPrice = max === '' ? null : Math.max(0, Number(max));
    if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
      [minPrice, maxPrice] = [maxPrice, minPrice];
    }
    this.update({ minPrice, maxPrice });
  }

  protected setSort(sort: string): void {
    this.update({ sort: sort as SortKey });
  }

  protected goToPage(page: number): void {
    this.update({ page }, false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected resetFilters(): void {
    this.update({ brands: [], minPrice: null, maxPrice: null, inStock: false });
  }

  /** Any filter change goes back to page 1 unless keepPage is requested. */
  protected update(patch: Partial<ListingState>, resetPage = true): void {
    const next: ListingState = { ...this.state(), ...(resetPage ? { page: 1 } : {}), ...patch };
    this.router.navigate([], { relativeTo: this.route, queryParams: toQueryParams(next), queryParamsHandling: 'merge' });
  }
}
