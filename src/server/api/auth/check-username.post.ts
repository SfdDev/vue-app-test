import { authService } from '../../composition/container';
import { mapDomainError } from '../../shared/http/map-error';

export default defineEventHandler(async (event) => {
  const body = await readBody<{ username: string }>(event);

  try {
    const exists = await authService.checkUsername(body.username);
    return { exists };
  } catch (error) {
    mapDomainError(error);
  }
});
