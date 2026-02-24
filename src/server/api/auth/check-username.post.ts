import { usernameExists } from '../../services/auth.service';

export default defineEventHandler(async (event) => {
  const body = await readBody<{ username: string }>(event);

  try {
    const exists = await usernameExists(body.username);
    return { exists };
  } catch (error: any) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message ?? 'Ошибка проверки имени пользователя',
    });
  }
});