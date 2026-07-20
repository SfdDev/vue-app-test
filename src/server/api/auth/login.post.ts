import { authService } from '../../composition/container';
import { mapDomainError } from '../../shared/http/map-error';

export default defineEventHandler(async (event) => {
  const body = await readBody<{ username: string; password: string }>(event);

  try {
    return await authService.login(body.username, body.password);
  } catch (error) {
    mapDomainError(error);
  }
});
