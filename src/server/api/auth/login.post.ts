import { loginUser } from '../../services/auth.service';

export default defineEventHandler(async (event) => {
  const body = await readBody<{ username: string; password: string }>(event);

  try {
    const result = await loginUser(body.username, body.password);
    return result;
  } catch (error: any) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message ?? 'Ошибка входа',
    });
  }
});

