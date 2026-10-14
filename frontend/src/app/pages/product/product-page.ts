import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, effect, inject, input, linkedSignal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { catchError, map, of, switchMap } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { CatalogService } from '../../core/catalog/catalog.service';
import { Product } from '../../core/catalog/catalog.models';
import { CategoryTreeStore } from '../../core/catalog/category-tree.store';
import { TndPipe } from '../../core/ui/tnd.pipe';
import { Breadcrumb, Crumb } from '../../shop/breadcrumb';
import { discountPercent } from '../../shop/listing-state';
import { ProductCard } from '../../shop/product-card';

type LoadState = { status: 'loading' } | { status: 'found'; product: Product } | { status: 'missing' } | { status: 'error' };

@Component({
  selector: 'app-product-page',
  imports: [RouterLink, MatIconModule, TndPipe, Breadcrumb, ProductCard],
  templateUrl: './product-page.html',
  styleUrl: './product-page.scss',
})
export class ProductPage {
  /** Bound from the route parameter :slug */
  readonly slug = input.required<string>();

  private readonly catalog = inject(CatalogService);
  private readonly store = inject(CategoryTreeStore);

  protected readonly load = toSignal(
    toObservable(this.slug).pipe(
      switchMap((slug) =>
        this.catalog.getProductBySlug(slug).pipe(
          map((product): LoadState => ({ status: 'found', product })),
          catchError((err: unknown) =>
            of<LoadState>(err instanceof HttpErrorResponse && err.status === 404 ? { status: 'missing' } : { status: 'error' }),
          ),
        ),
      ),
    ),
    { initialValue: { status: 'loading' } as LoadState },
  );

  protected readonly product = computed(() => {
    const state = this.load();
    return state.status === 'found' ? state.product : null;
  });

  /** Index of the image shown large; reset to the first image when the product changes. */
  protected readonly selectedImage = linkedSignal({ source: this.product, computation: () => 0 });

  protected readonly discount = computed(() => {
    const p = this.product();
    return p ? discountPercent(p.price, p.discountPrice) : null;
  });

  protected readonly crumbs = computed<Crumb[]>(() => {
    const p = this.product();
    if (!p) return [];
    const path = this.store.pathTo(p.category.id).map((c) => ({ label: c.name, link: ['/categorie', c.slug] }));
    const categories = path.length ? path : [{ label: p.category.name, link: ['/categorie', p.category.slug] }];
    return [...categories, { label: p.name }];
  });

  /** Up to 4 other active products of the same category. */
  protected readonly similar = toSignal(
    toObservable(this.product).pipe(
      switchMap((p) =>
        p
          ? this.catalog.searchProducts({ categoryId: p.category.id, size: 5 }).pipe(
              map((page) => page.content.filter((s) => s.id !== p.id).slice(0, 4)),
              catchError(() => of([])),
            )
          : of([]),
      ),
    ),
    { initialValue: [] },
  );

  constructor() {
    const title = inject(Title);
    effect(() => {
      const p = this.product();
      if (p) title.setTitle(`${p.name} – la3bakbira`);
    });
  }
}
