import { authService } from '../../composition/container';
import { getUserFromRequest } from '../../shared/auth/get-user';
import { mapDomainError } from '../../shared/http/map-error';

export default defineEventHandler(async (event) => {
  try {
    const jwtUser = getUserFromRequest(event);
    if (!jwtUser) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Требуется авторизация',
      });
    }

    return await authService.getCurrentUser(jwtUser.id);
  } catch (error) {
    mapDomainError(error);
  }
});
