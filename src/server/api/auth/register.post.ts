import { registerUser } from '../../services/auth.service';

export default defineEventHandler(async (event) => {
  const body = await readBody<{ username: string; password: string; recaptcha: string }>(event);

  try {
    const user = await registerUser(body.username, body.password, body.recaptcha);
    return user;
  } catch (error: any) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message ?? 'Ошибка регистрации',
    });
  }
});
