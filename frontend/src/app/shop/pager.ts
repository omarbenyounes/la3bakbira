import { Component, computed, input, output } from '@angular/core';

/** Page numbers to display: first, last, current ±1, with gaps (null) in between. */
export function pageWindow(current: number, total: number): (number | null)[] {
  const pages = new Set([1, total, current - 1, current, current + 1].filter((p) => p >= 1 && p <= total));
  const sorted = [...pages].sort((a, b) => a - b);
  const result: (number | null)[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) result.push(null);
    result.push(p);
  });
  return result;
}

@Component({
  selector: 'app-pager',
  template: `
    @if (totalPages() > 1) {
      <nav aria-label="Pagination">
        <ul class="pagination justify-content-center mb-0">
          <li class="page-item" [class.disabled]="page() === 1">
            <button class="page-link" (click)="go(page() - 1)" aria-label="Page précédente">‹</button>
          </li>
          @for (p of pages(); track $index) {
            @if (p === null) {
              <li class="page-item disabled"><span class="page-link">…</span></li>
            } @else {
              <li class="page-item" [class.active]="p === page()">
                <button class="page-link" (click)="go(p)" [attr.aria-current]="p === page() ? 'page' : null">{{ p }}</button>
              </li>
            }
          }
          <li class="page-item" [class.disabled]="page() === totalPages()">
            <button class="page-link" (click)="go(page() + 1)" aria-label="Page suivante">›</button>
          </li>
        </ul>
      </nav>
    }
  `,
})
export class Pager {
  /** 1-based */
  readonly page = input.required<number>();
  readonly totalPages = input.required<number>();
  readonly pageChange = output<number>();
  protected readonly pages = computed(() => pageWindow(this.page(), this.totalPages()));

  protected go(page: number): void {
    if (page >= 1 && page <= this.totalPages() && page !== this.page()) {
      this.pageChange.emit(page);
    }
  }
}
