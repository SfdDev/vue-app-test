import { getArticleByIdAdmin } from '../../../services/article.service';
import { requireAdmin } from '../../../utils/auth';

export default defineEventHandler(async (event) => {
  const user = requireAdmin(event);
  const id = Number.parseInt(event.context.params?.id ?? '', 10);
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Некорректный ID' });
  }

  try {
    return await getArticleByIdAdmin(id);
  } catch (error: any) {
    const statusCode = error.statusCode ?? 400;
    throw createError({
      statusCode,
      statusMessage: error.message ?? 'Ошибка получения статьи',
    });
  }
});
