import { useAuthStore } from '@/store/auth';

export default defineNuxtPlugin(async () => {
  if (!import.meta.client) return;

  const authStore = useAuthStore();
  authStore.initializeAuth();
  await authStore.checkAuth();
});
