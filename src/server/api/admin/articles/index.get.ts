import { getAdminArticles } from '../../../services/article.service';
import { requireAdmin } from '../../../utils/auth';

export default defineEventHandler(async (event) => {
  const user = requireAdmin(event);
  const query = getQuery(event);
  const page = Number.parseInt((query.page as string) ?? '1', 10) || 1;
  const perPage = Number.parseInt((query.per_page as string) ?? '4', 10) || 4;
  const categoryId = query.category_id ? Number.parseInt(query.category_id as string, 10) : null;

  try {
    return await getAdminArticles(page, perPage, categoryId);
  } catch (error: any) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message ?? 'Ошибка получения статей',
    });
  }
});
