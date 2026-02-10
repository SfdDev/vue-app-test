import { getArticles } from '../../services/article.service';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const page = Number.parseInt((query.page as string) ?? '1', 10) || 1;
  const perPage = Number.parseInt((query.per_page as string) ?? '6', 10) || 6;

  try {
    return await getArticles(page, perPage);
  } catch (error: any) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message ?? 'Ошибка получения статей',
    });
  }
});

