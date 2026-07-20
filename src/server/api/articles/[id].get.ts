import { articleService } from '../../composition/container';
import { mapDomainError } from '../../shared/http/map-error';

export default defineEventHandler(async (event) => {
  const id = Number.parseInt(event.context.params?.id ?? '', 10);
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Некорректный ID' });
  }

  try {
    return await articleService.getPublishedById(id);
  } catch (error) {
    mapDomainError(error);
  }
});
