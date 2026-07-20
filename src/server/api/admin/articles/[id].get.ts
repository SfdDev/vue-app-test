import { articleService } from '../../../composition/container';
import { requireAdmin } from '../../../shared/auth/require-admin';
import { mapDomainError } from '../../../shared/http/map-error';

export default defineEventHandler(async (event) => {
  try {
    requireAdmin(event);
    const id = Number.parseInt(event.context.params?.id ?? '', 10);
    if (!id) {
      throw createError({ statusCode: 400, statusMessage: 'Некорректный ID' });
    }

    return await articleService.getByIdAdmin(id);
  } catch (error) {
    mapDomainError(error);
  }
});
