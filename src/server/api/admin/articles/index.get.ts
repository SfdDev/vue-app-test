import { articleService } from '../../../composition/container';
import { requireAdmin } from '../../../shared/auth/require-admin';
import { mapDomainError } from '../../../shared/http/map-error';
import { parseCategoryFilterParam } from '../../../../shared/category-filter';

export default defineEventHandler(async (event) => {
  try {
    requireAdmin(event);
    const query = getQuery(event);
    const page = Number.parseInt((query.page as string) ?? '1', 10) || 1;
    const perPage = Number.parseInt((query.per_page as string) ?? '4', 10) || 4;
    const categoryId = parseCategoryFilterParam(query.category_id);

    return await articleService.listAdmin(page, perPage, categoryId);
  } catch (error) {
    mapDomainError(error);
  }
});
