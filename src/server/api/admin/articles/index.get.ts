import { getAdminArticles } from '../../../services/article.service';
import { requireAdmin } from '../../../utils/auth';
import { getDbPool } from '../../../utils/db';

export default defineEventHandler(async (event) => {
  const user = requireAdmin(event);
  const query = getQuery(event);
  const page = Number.parseInt((query.page as string) ?? '1', 10) || 1;
  const perPage = Number.parseInt((query.per_page as string) ?? '4', 10) || 4;
  const categoryId = query.category_id ? Number.parseInt(query.category_id as string, 10) : null;

  console.log('Admin articles API called:', { page, perPage, categoryId, user: user.username });

  try {
    const result = await getAdminArticles(page, perPage, categoryId);
    console.log('Admin articles result:', {
      articlesCount: result.data.length,
      total: result.meta.total,
      articles: result.data.map(a => ({ id: a.id, title: a.title, category_id: a.category_id })),
      requestedCategoryId: categoryId
    });
    
    // Дополнительная проверка для категории 7
    if (categoryId === 7) {
      console.log('DEBUG: Checking category 7 specifically');
      const pool = getDbPool();
      const directQuery = await pool.query(`
        SELECT a.id, a.title, a.category_id, c.name as category_name
        FROM articles a
        LEFT JOIN categories c ON a.category_id = c.id
        WHERE a.category_id = 7
        ORDER BY a.created_at DESC
      `);
      console.log('Direct DB query for category 7:', directQuery.rows);
    }
    
    return result;
  } catch (error: any) {
    console.error('Admin articles error:', error);
    throw createError({
      statusCode: 400,
      statusMessage: error.message ?? 'Ошибка получения статей',
    });
  }
});
