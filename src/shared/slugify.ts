const CYRILLIC_TO_LATIN: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh',
  з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o',
  п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts',
  ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu',
  я: 'ya',
};

/** Transliterate Cyrillic to Latin and build URL-safe slug. */
export function slugify(input: string): string {
  const lower = input.trim().toLowerCase();
  let out = '';
  for (const char of lower) {
    if (CYRILLIC_TO_LATIN[char] !== undefined) {
      out += CYRILLIC_TO_LATIN[char];
      continue;
    }
    if (/[a-z0-9]/.test(char)) {
      out += char;
      continue;
    }
    if (/\s|-|_/.test(char)) {
      out += '-';
    }
  }

  return out
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 180) || 'item';
}

export const UNCATEGORIZED_PATH_SLUG = 'uncategorized';

export function articlePublicPath(article: {
  id: number;
  slug?: string | null;
  category_slug?: string | null;
  category_id?: number | null;
}): string {
  const categorySlug =
    article.category_id == null || !article.category_slug
      ? UNCATEGORIZED_PATH_SLUG
      : article.category_slug;
  const articleSlug = article.slug?.trim() || String(article.id);
  return `/blog/${categorySlug}/${articleSlug}`;
}
