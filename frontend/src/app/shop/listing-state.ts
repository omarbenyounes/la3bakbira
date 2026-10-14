import { ParamMap, Params } from '@angular/router';

/** Sort options offered to shoppers (URL value -> API sort). */
export const SORTS = {
  nouveautes: { label: 'Nouveautés', api: 'createdAt,desc' },
  'prix-asc': { label: 'Prix croissant', api: 'effectivePrice,asc' },
  'prix-desc': { label: 'Prix décroissant', api: 'effectivePrice,desc' },
  nom: { label: 'Nom (A → Z)', api: 'name,asc' },
} as const;

export type SortKey = keyof typeof SORTS;

/** Listing filters as kept in the URL, e.g. ?marques=1,2&prixMin=500&stock=1&tri=prix-asc&page=2 */
export interface ListingState {
  brands: number[];
  minPrice: number | null;
  maxPrice: number | null;
  inStock: boolean;
  sort: SortKey;
  /** 1-based, as shown to the user */
  page: number;
}

const positiveNumber = (value: string | null): number | null => {
  const n = value === null || value === '' ? NaN : Number(value);
  return Number.isFinite(n) && n >= 0 ? n : null;
};

export function parseListingState(params: ParamMap): ListingState {
  const sort = params.get('tri');
  const page = Math.floor(positiveNumber(params.get('page')) ?? 1);
  return {
    brands: (params.get('marques') ?? '')
      .split(',')
      .map(Number)
      .filter((n) => Number.isInteger(n) && n > 0),
    minPrice: positiveNumber(params.get('prixMin')),
    maxPrice: positiveNumber(params.get('prixMax')),
    inStock: params.get('stock') === '1',
    sort: sort && sort in SORTS ? (sort as SortKey) : 'nouveautes',
    page: page >= 1 ? page : 1,
  };
}

/** Query params for router.navigate; defaults are removed (null) to keep URLs short. */
export function toQueryParams(state: ListingState): Params {
  return {
    marques: state.brands.length ? state.brands.join(',') : null,
    prixMin: state.minPrice ?? null,
    prixMax: state.maxPrice ?? null,
    stock: state.inStock ? '1' : null,
    tri: state.sort === 'nouveautes' ? null : state.sort,
    page: state.page > 1 ? state.page : null,
  };
}

/** Discount shown on product cards, e.g. 1500 -> 1200 gives 20. */
export function discountPercent(price: number, discountPrice: number | null): number | null {
  if (discountPrice === null || discountPrice >= price || price <= 0) {
    return null;
  }
  return Math.round((1 - discountPrice / price) * 100);
}
