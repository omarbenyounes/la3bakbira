import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ProductSummary } from '../core/catalog/catalog.models';
import { TndPipe } from '../core/ui/tnd.pipe';
import { discountPercent } from './listing-state';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink, MatIconModule, TndPipe],
  template: `
    @let p = product();
    <a class="card-link" [routerLink]="['/produit', p.slug]">
      <div class="image">
        @if (discount(); as d) { <span class="badge-discount">-{{ d }}%</span> }
        @if (p.mainImageUrl) {
          <img [src]="p.mainImageUrl" [alt]="p.name" loading="lazy" />
        } @else {
          <mat-icon>image</mat-icon>
        }
      </div>
      <div class="body">
        @if (p.brand) { <div class="brand">{{ p.brand.name }}</div> }
        <h3 class="name" [title]="p.name">{{ p.name }}</h3>
        <div class="ref">Réf. {{ p.sku }}</div>
        <div class="prices">
          <span class="price" [class.promo]="p.discountPrice !== null">{{ p.effectivePrice | tnd }}</span>
          @if (p.discountPrice !== null) { <span class="old">{{ p.price | tnd }}</span> }
        </div>
        <div class="stock" [class.out]="!p.inStock">
          <span class="dot"></span>{{ p.inStock ? 'En stock' : 'Rupture de stock' }}
        </div>
      </div>
    </a>
  `,
  styles: `
    :host { display: block; height: 100%; }
    .card-link {
      display: flex; flex-direction: column; height: 100%; background: #fff; border: 1px solid #e5e7eb;
      border-radius: 10px; overflow: hidden; color: inherit; text-decoration: none; transition: box-shadow 0.15s, border-color 0.15s;
    }
    .card-link:hover { border-color: var(--brand-primary); box-shadow: 0 8px 20px rgb(0 0 0 / 8%); }
    .image { position: relative; display: flex; align-items: center; justify-content: center; aspect-ratio: 1; padding: 0.75rem; background: #fff; }
    .image img { max-width: 100%; max-height: 100%; object-fit: contain; }
    .image mat-icon { font-size: 56px; width: 56px; height: 56px; color: #d1d5db; }
    .badge-discount { position: absolute; top: 0.5rem; left: 0.5rem; padding: 0.15rem 0.5rem; border-radius: 4px; background: var(--brand-accent); color: #fff; font-size: 0.8rem; font-weight: 700; }
    .body { display: flex; flex-direction: column; gap: 0.2rem; flex: 1; padding: 0.75rem 0.9rem 0.9rem; border-top: 1px solid #f3f4f6; }
    .brand { color: var(--brand-primary); font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }
    .name { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 2.5em; margin: 0; font-size: 0.92rem; font-weight: 600; line-height: 1.25; }
    .ref { color: #9ca3af; font-size: 0.75rem; }
    .prices { display: flex; flex-wrap: wrap; align-items: baseline; gap: 0.5rem; margin-top: auto; padding-top: 0.4rem; }
    .price { font-size: 1.1rem; font-weight: 800; color: #111827; }
    .price.promo { color: var(--brand-accent); }
    .old { color: #9ca3af; font-size: 0.85rem; text-decoration: line-through; }
    .stock { display: flex; align-items: center; gap: 0.35rem; color: #15803d; font-size: 0.8rem; font-weight: 500; }
    .stock.out { color: #b91c1c; }
    .dot { width: 8px; height: 8px; border-radius: 50%; background: currentColor; }
  `,
})
export class ProductCard {
  readonly product = input.required<ProductSummary>();
  protected readonly discount = computed(() => discountPercent(this.product().price, this.product().discountPrice));
}
