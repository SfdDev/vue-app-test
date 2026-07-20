import { categoryService } from '../../composition/container';
import { mapDomainError } from '../../shared/http/map-error';

export default defineEventHandler(async (event) => {
  try {
    const categoryId = Number.parseInt(getRouterParam(event, 'id') || '', 10);
    if (Number.isNaN(categoryId)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Неверный ID категории',
      });
    }

    const category = await categoryService.getById(categoryId);
    return { data: category };
  } catch (error) {
    mapDomainError(error);
  }
});
