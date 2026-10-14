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

/** GET /api/catalog/categories (flat, all fields). */
export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  parentId: number | null;
  displayOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

/** POST/PUT body. A blank slug = generate from name (create) or keep current (update). */
export interface CategoryRequest {
  name: string;
  slug?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  parentId?: number | null;
  displayOrder?: number;
  active?: boolean;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logoUrl: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BrandRequest {
  name: string;
  slug?: string | null;
  logoUrl?: string | null;
  active?: boolean;
}

export interface Ref {
  id: number;
  name: string;
  slug: string;
}

export interface ProductImage {
  url: string;
  altText: string | null;
}

export interface ProductSpec {
  name: string;
  value: string;
}

/** Product card / list row. */
export interface ProductSummary {
  id: number;
  name: string;
  slug: string;
  sku: string;
  shortDescription: string | null;
  price: number;
  discountPrice: number | null;
  effectivePrice: number;
  stockQuantity: number;
  inStock: boolean;
  active: boolean;
  featured: boolean;
  mainImageUrl: string | null;
  category: Ref;
  brand: Ref | null;
}

/** Full product (product page, admin edit form). */
export interface Product extends Omit<ProductSummary, 'mainImageUrl'> {
  description: string | null;
  images: ProductImage[];
  specs: ProductSpec[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductRequest {
  name: string;
  slug?: string | null;
  sku: string;
  shortDescription?: string | null;
  description?: string | null;
  price: number;
  discountPrice?: number | null;
  stockQuantity: number;
  categoryId: number;
  brandId?: number | null;
  active?: boolean;
  featured?: boolean;
  images?: ProductImage[];
  specs?: ProductSpec[];
}

/** Query of GET /api/catalog/products; every field optional. */
export interface ProductQuery {
  q?: string;
  categoryId?: number;
  /** One or several brands (matches any) */
  brandId?: number | number[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  featured?: boolean;
  active?: boolean;
  page?: number;
  size?: number;
  /** e.g. "effectivePrice,asc" (price actually paid), "createdAt,desc", "name,asc" */
  sort?: string;
}

export interface BrandFacet {
  id: number;
  name: string;
  slug: string;
  count: number;
}

/** GET /api/catalog/products/facets: filter options for a listing. */
export interface ProductFacets {
  brands: BrandFacet[];
  minPrice: number | null;
  maxPrice: number | null;
  total: number;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
