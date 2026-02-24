import { getUserFromRequest } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  const user = getUserFromRequest(event);
  
  if (!user) {
    throw createError({ 
      statusCode: 401, 
      statusMessage: 'Требуется авторизация' 
    });
  }

  return {
    id: user.id,
    username: user.username,
    is_admin: user.is_admin
  };
});
