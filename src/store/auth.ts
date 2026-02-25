import { defineStore } from 'pinia';

export interface AuthState {
  user: any | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.is_admin || false,
  },

  actions: {
    initializeAuth() {
      if (process.client) {
        const token = localStorage.getItem('token');
        console.log('initializeAuth: token from localStorage:', token);
        if (token) {
          this.token = token;
          console.log('initializeAuth: token set to store');
        } else {
          console.log('initializeAuth: no token found in localStorage');
        }
      }
    },

    async checkAuth() {
      if (!this.token) {
        console.log('No token, skipping checkAuth');
        return;
      }
      
      console.log('Checking auth with token:', this.token);
      this.loading = true;
      try {
        const response = await $fetch<{ user: any }>('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        });
        
        console.log('Auth check response:', response);
        this.user = response;
      } catch (error) {
        console.error('Auth check failed:', error);
        this.logout();
      } finally {
        this.loading = false;
      }
    },

    async register(username: string, password: string, recaptcha: string) {
      this.loading = true;
      this.error = null;
      
      try {
        await $fetch('/api/auth/register', {
          method: 'POST',
          body: {
            username,
            password,
            recaptcha,
          },
        });
        
        this.loading = false;
      } catch (error: any) {
        this.error = error.message || 'Ошибка регистрации';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async login(username: string, password: string) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await $fetch<{ token: string; user: any }>('/api/auth/login', {
          method: 'POST',
          body: {
            username,
            password,
          },
        });
        
        if (response.token) {
          this.token = response.token;
          this.user = response.user;
          
          // Сохраняем токен в localStorage
          if (process.client) {
            localStorage.setItem('token', response.token);
            console.log('Token saved to localStorage:', response.token);
          }
        }
        
        this.loading = false;
      } catch (error: any) {
        this.error = error.message || 'Ошибка входа';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    logout() {
      this.token = null;
      this.user = null;
      if (process.client) {
        localStorage.removeItem('token');
      }
    },

    clearError() {
      this.error = null;
    },
  },
});
