import { getArticles } from '../../services/article.service';

// Простое memory кеширование
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 минут

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const page = Number.parseInt((query.page as string) ?? '1', 10) || 1;
  const perPage = Number.parseInt((query.per_page as string) ?? '6', 10) || 6;
  const categoryId = query.category_id ? Number.parseInt(query.category_id as string, 10) : null;
  
  const cacheKey = `articles:${page}:${perPage}:${categoryId || 'all'}`;

  try {
    // Проверяем кеш
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    // Загружаем данные
    const result = await getArticles(page, perPage, categoryId);
    
    // Сохраняем в кеш
    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    return result;
  } catch (error: any) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message ?? 'Ошибка получения статей',
    });
  }
});

