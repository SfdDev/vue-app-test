import { readMultipartFormData } from 'h3';
import { articleService } from '../../composition/container';
import { requireAdmin } from '../../shared/auth/require-admin';
import { clearArticlesListCache } from '../../shared/articles-list-cache';
import { mapDomainError } from '../../shared/http/map-error';
import { getFormField, getFormImage } from '../../shared/http/multipart';

export default defineEventHandler(async (event) => {
  try {
    const user = requireAdmin(event);

    const formData = await readMultipartFormData(event);
    if (!formData) {
      throw createError({ statusCode: 400, statusMessage: 'Некорректные данные формы' });
    }

    const title = getFormField(formData, 'title');
    const content = getFormField(formData, 'content');
    const isPublishedField = getFormField(formData, 'is_published');
    const isPublished = isPublishedField ? isPublishedField === 'true' : true;
    const categoryIdField = getFormField(formData, 'category_id');
    const categoryId = categoryIdField ? Number.parseInt(categoryIdField, 10) : null;
    const image = getFormImage(formData);
    const imageUrlField = getFormField(formData, 'image_url') || null;

    const article = await articleService.create(
      title,
      content,
      user.id,
      image,
      imageUrlField,
      isPublished,
      categoryId,
    );

    clearArticlesListCache();
    return { data: { article } };
  } catch (error) {
    mapDomainError(error);
  }
});
