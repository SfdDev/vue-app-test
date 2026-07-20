import { categoryService } from '../../composition/container';
import { requireAdmin } from '../../shared/auth/require-admin';
import { mapDomainError } from '../../shared/http/map-error';

export default defineEventHandler(async (event) => {
  try {
    requireAdmin(event);
    const body = await readBody(event);
    const category = await categoryService.create({
      name: body.name,
      slug: body.slug,
      description: body.description,
    });
    return { data: category };
  } catch (error) {
    mapDomainError(error);
  }
});
