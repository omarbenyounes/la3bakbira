import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../core/auth/auth.service';
import { CategoryTreeStore } from '../../core/catalog/category-tree.store';

@Component({
  selector: 'app-header',
  imports: [RouterLink, MatBadgeModule, MatButtonModule, MatIconModule, MatMenuModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  protected readonly auth = inject(AuthService);
  protected readonly categories = inject(CategoryTreeStore).tree;
  protected readonly mobileMenuOpen = signal(false);
  /**
   * After navigating from the menu, the pointer is still over it and the hover mega menu would cover the new page:
   * keep it hidden until the pointer leaves the bar.
   */
  protected readonly megaSuppressed = signal(false);
  protected readonly pointerInBar = signal(false);
  private readonly categoryBar = viewChild.required<ElementRef<HTMLElement>>('categoryBar');
  private readonly router = inject(Router);

  constructor() {
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        this.mobileMenuOpen.set(false);
        this.megaSuppressed.set(this.pointerInBar());
        // A focused menu link would keep the panel open through :focus-within
        const focused = document.activeElement;
        if (focused instanceof HTMLElement && this.categoryBar().nativeElement.contains(focused)) {
          focused.blur();
        }
      });
  }

  protected leaveBar(): void {
    this.pointerInBar.set(false);
    this.megaSuppressed.set(false);
  }

  protected search(query: string): void {
    const q = query.trim();
    if (q) {
      this.router.navigate(['/recherche'], { queryParams: { q } });
    }
  }
}
