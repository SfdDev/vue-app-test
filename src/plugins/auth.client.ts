import { useAuthStore } from '@/store/auth';

export default defineNuxtPlugin(async () => {
  console.log('Auth plugin initializing...');
  const authStore = useAuthStore();
  
  // Инициализируем авторизацию при загрузке приложения
  if (process.client) {
    console.log('Running on client, initializing auth...');
    authStore.initializeAuth();
    console.log('Token after initialize:', authStore.token);
    
    try {
      await authStore.checkAuth();
      console.log('Auth check completed, user:', authStore.user);
    } catch (error) {
      console.error('Auth check failed in plugin:', error);
    }
  }
  
  console.log('Auth plugin initialized');
});
