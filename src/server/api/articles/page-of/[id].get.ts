import { articleService } from '../../../composition/container';
import { mapDomainError } from '../../../shared/http/map-error';

export default defineEventHandler(async (event) => {
  const id = Number.parseInt(event.context.params?.id ?? '', 10);
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Некорректный ID' });
  }

  const query = getQuery(event);
  const perPage = Number.parseInt((query.per_page as string) ?? '6', 10) || 6;

  try {
    return await articleService.getPageOfArticle(id, perPage);
  } catch (error) {
    mapDomainError(error);
  }
});
