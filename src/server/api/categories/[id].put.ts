import { categoryService } from '../../composition/container';
import { requireAdmin } from '../../shared/auth/require-admin';
import { mapDomainError } from '../../shared/http/map-error';

export default defineEventHandler(async (event) => {
  try {
    requireAdmin(event);
    const categoryId = Number.parseInt(getRouterParam(event, 'id') || '', 10);
    if (Number.isNaN(categoryId)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Неверный ID категории',
      });
    }

    const body = await readBody(event);
    const category = await categoryService.update(categoryId, {
      name: body.name,
      slug: body.slug,
      description: body.description,
    });
    return { data: category };
  } catch (error) {
    mapDomainError(error);
  }
});
