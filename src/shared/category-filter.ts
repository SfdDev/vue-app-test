/** Sentinel filter value: articles with category_id IS NULL */
export const UNCATEGORIZED_CATEGORY_ID = 0;

export const UNCATEGORIZED_CATEGORY_NAME = 'Без категории';

/** URL segment and legacy DB slug for articles without category */
export const RESERVED_UNCATEGORIZED_SLUG = 'uncategorized';
export const LEGACY_UNCATEGORIZED_SLUG = 'bez-kategorii';

export type CategorySlugRef = {
  id: number;
  slug: string;
};

export function isReservedUncategorizedCategory(category: {
  name?: string | null;
  slug?: string | null;
}): boolean {
  const slug = (category.slug ?? '').toLowerCase();
  const name = (category.name ?? '').trim().toLowerCase();
  return (
    slug === RESERVED_UNCATEGORIZED_SLUG ||
    slug === LEGACY_UNCATEGORIZED_SLUG ||
    name === UNCATEGORIZED_CATEGORY_NAME.toLowerCase()
  );
}

export function categoryFilterCacheKey(categoryId: number | null | undefined): string {
  if (categoryId === UNCATEGORIZED_CATEGORY_ID) return 'uncategorized';
  if (categoryId == null) return 'all';
  return String(categoryId);
}

/** Parse API/query category_id: missing → all; 0/uncategorized → uncategorized; else id */
export function parseCategoryFilterParam(raw: unknown): number | null {
  if (raw === undefined || raw === null || raw === '') {
    return null;
  }
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value === 'uncategorized' || value === '0' || value === 0) {
    return UNCATEGORIZED_CATEGORY_ID;
  }
  const id = Number.parseInt(String(value), 10);
  return Number.isNaN(id) ? null : id;
}

/** Map filter id → URL slug (?category=news). Null = all categories (omit param). */
export function categoryFilterToSlug(
  categoryId: number | null | undefined,
  categories: CategorySlugRef[],
): string | null {
  if (categoryId == null) return null;
  if (categoryId === UNCATEGORIZED_CATEGORY_ID) return RESERVED_UNCATEGORIZED_SLUG;
  return categories.find((c) => c.id === categoryId)?.slug ?? null;
}

/**
 * Resolve frontend URL filter:
 * - ?category=slug (preferred)
 * - legacy ?category_id=id
 */
export function resolveCategoryFilterQuery(
  rawCategory: unknown,
  categories: CategorySlugRef[],
  rawLegacyId?: unknown,
): number | null {
  if (rawCategory !== undefined && rawCategory !== null && rawCategory !== '') {
    const value = String(Array.isArray(rawCategory) ? rawCategory[0] : rawCategory);

    if (
      value === RESERVED_UNCATEGORIZED_SLUG ||
      value === LEGACY_UNCATEGORIZED_SLUG ||
      value === '0'
    ) {
      return UNCATEGORIZED_CATEGORY_ID;
    }

    const bySlug = categories.find((c) => c.slug === value);
    if (bySlug) return bySlug.id;

    // Allow numeric id in ?category= for old bookmarks
    if (/^\d+$/.test(value)) {
      return parseCategoryFilterParam(value);
    }

    return null;
  }

  return parseCategoryFilterParam(rawLegacyId);
}
