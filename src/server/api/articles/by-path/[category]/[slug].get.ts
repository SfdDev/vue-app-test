import { articleService } from '../../../../composition/container';
import { mapDomainError } from '../../../../shared/http/map-error';

export default defineEventHandler(async (event) => {
  const category = getRouterParam(event, 'category') || '';
  const slug = getRouterParam(event, 'slug') || '';

  if (!category || !slug) {
    throw createError({ statusCode: 400, statusMessage: 'Некорректный путь статьи' });
  }

  try {
    return await articleService.getPublishedByPath(
      decodeURIComponent(category),
      decodeURIComponent(slug),
    );
  } catch (error) {
    mapDomainError(error);
  }
});
