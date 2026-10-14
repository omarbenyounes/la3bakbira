import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CategoryTreeStore } from './category-tree.store';
import { CategoryTreeNode } from './catalog.models';

const node = (id: number, slug: string, children: CategoryTreeNode[] = []): CategoryTreeNode => ({
  id, name: slug, slug, imageUrl: null, displayOrder: 0, active: true, children,
});

describe('CategoryTreeStore', () => {
  it('finds categories by slug and builds breadcrumb paths', async () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const store = TestBed.inject(CategoryTreeStore);
    TestBed.tick();
    TestBed.inject(HttpTestingController)
      .expectOne('/api/catalog/categories/tree?activeOnly=true')
      .flush([node(1, 'informatique', [node(2, 'portables', [node(3, 'gamer')])]), node(4, 'telephonie')]);

    expect(store.findBySlug('gamer')?.id).toBe(3);
    expect(store.pathTo(3).map((c) => c.slug)).toEqual(['informatique', 'portables', 'gamer']);
    expect(store.pathTo(4).map((c) => c.slug)).toEqual(['telephonie']);
    expect(store.pathTo(99)).toEqual([]);
  });
});
