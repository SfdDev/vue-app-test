import { getPageOfArticle } from '../../../services/article.service';

export default defineEventHandler(async (event) => {
  const id = Number.parseInt(event.context.params?.id ?? '', 10);
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Некорректный ID' });
  }

  const query = getQuery(event);
  const perPage = Number.parseInt((query.per_page as string) ?? '6', 10) || 6;

  try {
    return await getPageOfArticle(id, perPage);
  } catch (error: any) {
    const statusCode = error.statusCode ?? 400;
    throw createError({
      statusCode,
      statusMessage: error.message ?? 'Ошибка определения страницы статьи',
    });
  }
});

