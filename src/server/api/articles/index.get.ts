import { getArticles } from '../../services/article.service';

// Простое memory кеширование
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 минут

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const page = Number.parseInt((query.page as string) ?? '1', 10) || 1;
  const perPage = Number.parseInt((query.per_page as string) ?? '6', 10) || 6;
  const categoryId = query.category_id ? Number.parseInt(query.category_id as string, 10) : null;
  
  console.log('Blog API called:', { page, perPage, categoryId });
  
  const cacheKey = `articles:${page}:${perPage}:${categoryId || 'all'}`;

  try {
    // Проверяем кеш
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log('Returning cached data for blog');
      return cached.data;
    }

    // Загружаем данные
    const result = await getArticles(page, perPage, categoryId);
    
    console.log('Blog API result:', {
      articlesCount: result.data.length,
      total: result.meta.total,
      totalPages: result.meta.total_pages,
      categoryId: categoryId,
      articles: result.data.map(a => ({ 
        id: a.id, 
        title: a.title, 
        is_published: a.is_published, 
        category_id: a.category_id,
        category_name: a.category_name,
        category_slug: a.category_slug,
        allKeys: Object.keys(a)
      }))
    });
    
    // Сохраняем в кеш
    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    return result;
  } catch (error: any) {
    console.error('Blog API error:', error);
    throw createError({
      statusCode: 400,
      statusMessage: error.message ?? 'Ошибка получения статей',
    });
  }
});

