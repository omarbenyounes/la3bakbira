import { Category } from './catalog.models';

export interface IndentedCategory {
  category: Category;
  depth: number;
}

const byDisplayOrder = (a: Category, b: Category) =>
  a.displayOrder - b.displayOrder || a.name.localeCompare(b.name, 'fr');

/** Flat list in tree order (parents before children), each with its depth, e.g. for indented selects. */
export function toIndentedList(categories: Category[]): IndentedCategory[] {
  const byParent = new Map<number | null, Category[]>();
  for (const c of categories) {
    const list = byParent.get(c.parentId) ?? [];
    list.push(c);
    byParent.set(c.parentId, list);
  }
  const result: IndentedCategory[] = [];
  const visit = (parentId: number | null, depth: number) => {
    for (const c of [...(byParent.get(parentId) ?? [])].sort(byDisplayOrder)) {
      result.push({ category: c, depth });
      visit(c.id, depth + 1);
    }
  };
  visit(null, 0);
  return result;
}

/** The category and all of its descendants (they cannot become its parent). */
export function selfAndDescendantIds(id: number, categories: Category[]): Set<number> {
  const ids = new Set<number>([id]);
  let added = true;
  while (added) {
    added = false;
    for (const c of categories) {
      if (c.parentId !== null && ids.has(c.parentId) && !ids.has(c.id)) {
        ids.add(c.id);
        added = true;
      }
    }
  }
  return ids;
}

/** Siblings of a category (same parent), in display order. */
export function siblingsOf(category: Category, categories: Category[]): Category[] {
  return categories.filter((c) => c.parentId === category.parentId).sort(byDisplayOrder);
}
