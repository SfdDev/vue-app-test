import { getArticleById } from '../../services/article.service';

export default defineEventHandler(async (event) => {
  const id = Number.parseInt(event.context.params?.id ?? '', 10);
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Некорректный ID' });
  }

  try {
    return await getArticleById(id);
  } catch (error: any) {
    const statusCode = error.statusCode ?? 400;
    throw createError({
      statusCode,
      statusMessage: error.message ?? 'Ошибка получения статьи',
    });
  }
});

