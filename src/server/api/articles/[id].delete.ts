import { articleService } from '../../composition/container';
import { requireAdmin } from '../../shared/auth/require-admin';
import { clearArticlesListCache } from '../../shared/articles-list-cache';
import { mapDomainError } from '../../shared/http/map-error';

export default defineEventHandler(async (event) => {
  try {
    const user = requireAdmin(event);
    const id = Number.parseInt(event.context.params?.id ?? '', 10);
    if (!id) {
      throw createError({ statusCode: 400, statusMessage: 'Некорректный ID' });
    }

    await articleService.delete(id, user.id);
    clearArticlesListCache();
    setResponseStatus(event, 204);
    return null;
  } catch (error) {
    mapDomainError(error);
  }
});
