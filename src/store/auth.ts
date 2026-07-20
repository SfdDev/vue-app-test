import { defineStore } from 'pinia';

export interface AuthUser {
  id: number;
  username: string;
  is_admin: boolean;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  /** True after client auth bootstrap finished (avoids SSR/client hydration mismatch) */
  ready: boolean;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    loading: false,
    error: null,
    ready: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
    isAdmin: (state) => state.user?.is_admin || false,
  },

  actions: {
    initializeAuth() {
      if (import.meta.client) {
        const token = localStorage.getItem('token');
        if (token) {
          this.token = token;
        }
      }
    },

    getAuthHeader(): Record<string, string> {
      const token = this.token || (import.meta.client ? localStorage.getItem('token') : null);
      return token ? { Authorization: `Bearer ${token}` } : {};
    },

    async checkAuth() {
      if (!this.token) {
        this.ready = true;
        return;
      }

      this.loading = true;
      try {
        const response = await $fetch<AuthUser>('/api/auth/me', {
          headers: this.getAuthHeader(),
        });

        this.user = response;
      } catch (error) {
        console.error('Auth check failed:', error);
        this.logout();
      } finally {
        this.loading = false;
        this.ready = true;
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
      } catch (error: any) {
        this.error = error.data?.message || error.message || 'Ошибка регистрации';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async login(username: string, password: string) {
      this.loading = true;
      this.error = null;

      try {
        const response = await $fetch<{ token: string; user: AuthUser }>('/api/auth/login', {
          method: 'POST',
          body: {
            username,
            password,
          },
        });

        if (response.token) {
          this.token = response.token;
          this.user = response.user;
          this.ready = true;
          if (import.meta.client) {
            localStorage.setItem('token', response.token);
          }
        }
      } catch (error: any) {
        this.error = error.data?.message || error.message || 'Ошибка входа';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    logout() {
      this.token = null;
      this.user = null;
      this.ready = true;
      if (import.meta.client) {
        localStorage.removeItem('token');
      }
    },

    clearError() {
      this.error = null;
    },
  },
});
