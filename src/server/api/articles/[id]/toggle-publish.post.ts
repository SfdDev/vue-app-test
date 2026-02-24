import { requireAdmin } from '../../../utils/auth';
import { getDbPool } from '../../../utils/db';

export default defineEventHandler(async (event) => {
  const user = requireAdmin(event);
  const id = Number.parseInt(event.context.params?.id ?? '', 10);
  
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Некорректный ID' });
  }

  const pool = getDbPool();

  try {
    // Получаем текущую статью
    const currentArticleQuery = await pool.query(
      'SELECT is_published FROM articles WHERE id = $1',
      [id]
    );

    if (!currentArticleQuery.rows.length) {
      throw createError({ statusCode: 404, statusMessage: 'Статья не найдена' });
    }

    const currentStatus = currentArticleQuery.rows[0].is_published;
    const newStatus = !currentStatus;

    // Обновляем статус публикации
    const updateQuery = await pool.query(
      'UPDATE articles SET is_published = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [newStatus, id]
    );

    const updatedArticle = updateQuery.rows[0];

    return {
      data: {
        article: updatedArticle,
        message: newStatus ? 'Статья опубликована' : 'Статья снята с публикации'
      }
    };
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode ?? 500,
      statusMessage: error.message ?? 'Ошибка изменения статуса публикации',
    });
  }
});
