import { articleService } from '../../composition/container';
import { mapDomainError } from '../../shared/http/map-error';
import { categoryFilterCacheKey, parseCategoryFilterParam } from '../../../shared/category-filter';
import {
  getArticlesListCache,
  setArticlesListCache,
} from '../../shared/articles-list-cache';

const CACHE_TTL = 30 * 1000; // short TTL; mutations also clear the cache

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const page = Number.parseInt((query.page as string) ?? '1', 10) || 1;
  const perPage = Number.parseInt((query.per_page as string) ?? '6', 10) || 6;
  const categoryId = parseCategoryFilterParam(query.category_id);
  const cacheKey = `articles:${page}:${perPage}:${categoryFilterCacheKey(categoryId)}`;

  try {
    const cached = getArticlesListCache(cacheKey, CACHE_TTL);
    if (cached) {
      return cached;
    }

    const result = await articleService.listPublished(page, perPage, categoryId);
    setArticlesListCache(cacheKey, result);
    return result;
  } catch (error) {
    mapDomainError(error);
  }
});
