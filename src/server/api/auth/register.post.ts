import { authService } from '../../composition/container';
import { mapDomainError } from '../../shared/http/map-error';

export default defineEventHandler(async (event) => {
  const body = await readBody<{ username: string; password: string; recaptcha: string }>(event);

  try {
    return await authService.register(body.username, body.password, body.recaptcha);
  } catch (error) {
    mapDomainError(error);
  }
});
