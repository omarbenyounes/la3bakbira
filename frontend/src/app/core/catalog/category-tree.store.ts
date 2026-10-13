import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of, shareReplay } from 'rxjs';
import { CatalogService } from './catalog.service';
import { CategoryTreeNode } from './catalog.models';

/** Category tree loaded once and shared by the menu, home page and category pages. */
@Injectable({ providedIn: 'root' })
export class CategoryTreeStore {
  private readonly tree$ = inject(CatalogService)
    .getCategoryTree()
    .pipe(
      catchError(() => of(null)),
      shareReplay(1),
    );

  /** undefined = loading, null = failed, array = loaded */
  readonly tree = toSignal<CategoryTreeNode[] | null | undefined>(this.tree$, { initialValue: undefined });

  findBySlug(slug: string, nodes: CategoryTreeNode[] = this.tree() ?? []): CategoryTreeNode | undefined {
    for (const node of nodes) {
      if (node.slug === slug) {
        return node;
      }
      const found = this.findBySlug(slug, node.children);
      if (found) {
        return found;
      }
    }
    return undefined;
  }
}
