import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, catchError, of, shareReplay, switchMap } from 'rxjs';
import { CatalogService } from './catalog.service';
import { CategoryTreeNode } from './catalog.models';

/** Category tree loaded once and shared by the menu, home page and category pages. */
@Injectable({ providedIn: 'root' })
export class CategoryTreeStore {
  private readonly catalog = inject(CatalogService);
  private readonly reload$ = new BehaviorSubject<void>(undefined);

  private readonly tree$ = this.reload$.pipe(
    switchMap(() => this.catalog.getCategoryTree().pipe(catchError(() => of(null)))),
    shareReplay(1),
  );

  /** undefined = loading, null = failed, array = loaded */
  readonly tree = toSignal<CategoryTreeNode[] | null | undefined>(this.tree$, { initialValue: undefined });

  /** Fetch the tree again (after categories were changed in the admin). */
  reload(): void {
    this.reload$.next();
  }

  /** Nodes from the top-level category down to the given one (for breadcrumbs); empty if unknown. */
  pathTo(id: number, nodes: CategoryTreeNode[] = this.tree() ?? []): CategoryTreeNode[] {
    for (const node of nodes) {
      if (node.id === id) {
        return [node];
      }
      const sub = this.pathTo(id, node.children);
      if (sub.length) {
        return [node, ...sub];
      }
    }
    return [];
  }

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
