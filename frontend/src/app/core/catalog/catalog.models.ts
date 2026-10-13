/** Mirrors CategoryTreeNode of catalog-service (GET /api/catalog/categories/tree). */
export interface CategoryTreeNode {
  id: number;
  name: string;
  slug: string;
  imageUrl: string | null;
  displayOrder: number;
  active: boolean;
  children: CategoryTreeNode[];
}
