import { Category } from './catalog.models';
import { selfAndDescendantIds, siblingsOf, toIndentedList } from './category-utils';

const cat = (id: number, name: string, parentId: number | null, displayOrder = 0): Category => ({
  id, name, parentId, displayOrder, slug: name.toLowerCase(), description: null, imageUrl: null,
  active: true, createdAt: '', updatedAt: '',
});

// Informatique(1) > PC(2) > Gamer(4) ; Informatique > Composants(3) ; Téléphonie(5)
const categories = [
  cat(5, 'Téléphonie', null, 1),
  cat(3, 'Composants', 1, 1),
  cat(4, 'Gamer', 2),
  cat(1, 'Informatique', null, 0),
  cat(2, 'PC', 1, 0),
];

describe('category utils', () => {
  it('lists categories in tree order with depth', () => {
    expect(toIndentedList(categories).map((r) => `${r.depth}:${r.category.name}`)).toEqual([
      '0:Informatique', '1:PC', '2:Gamer', '1:Composants', '0:Téléphonie',
    ]);
  });

  it('finds a category and all of its descendants', () => {
    expect([...selfAndDescendantIds(1, categories)].sort()).toEqual([1, 2, 3, 4]);
    expect([...selfAndDescendantIds(4, categories)]).toEqual([4]);
  });

  it('returns siblings in display order', () => {
    expect(siblingsOf(categories[1], categories).map((c) => c.name)).toEqual(['PC', 'Composants']);
    expect(siblingsOf(categories[0], categories).map((c) => c.name)).toEqual(['Informatique', 'Téléphonie']);
  });
});
