import { useAuthStore } from '@/store/auth';

export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore();
  
  // Инициализируем авторизацию при загрузке приложения
  if (process.client) {
    authStore.initializeAuth();
    await authStore.checkAuth();
  }
});
