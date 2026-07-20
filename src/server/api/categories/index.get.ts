import { categoryService } from '../../composition/container';
import { mapDomainError } from '../../shared/http/map-error';

export default defineEventHandler(async (event) => {
  try {
    const categories = await categoryService.list();
    return { data: categories };
  } catch (error) {
    mapDomainError(error);
  }
});
