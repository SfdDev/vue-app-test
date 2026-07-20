import { articleService } from '../../../composition/container';
import { requireAdmin } from '../../../shared/auth/require-admin';
import { clearArticlesListCache } from '../../../shared/articles-list-cache';
import { mapDomainError } from '../../../shared/http/map-error';

export default defineEventHandler(async (event) => {
  try {
    requireAdmin(event);
    const id = Number.parseInt(event.context.params?.id ?? '', 10);
    if (!id) {
      throw createError({ statusCode: 400, statusMessage: 'Некорректный ID' });
    }

    const result = await articleService.togglePublish(id);
    clearArticlesListCache();
    return {
      data: {
        article: result.article,
        message: result.message,
      },
    };
  } catch (error) {
    mapDomainError(error);
  }
});
