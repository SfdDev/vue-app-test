import { defineStore } from 'pinia';
import axios from 'axios';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    loading: false,
    error: null,
  }),

  actions: {
    async register(username, password, recaptcha) {
      this.loading = true;
      try {
        const response = await axios.post('/api/auth/register', {
          username,
          password,
          recaptcha,
        });
        this.user = response.data;
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || error.response?.data?.error || 'Ошибка регистрации';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async login(username, password) {
      this.loading = true;
      try {
        const response = await axios.post('/api/auth/login', { username, password });
        this.user = response.data.user;
        this.token = response.data.token;
        if (process.client) {
          localStorage.setItem('token', this.token);
        }
        axios.defaults.headers.common.Authorization = `Bearer ${this.token}`;
      } catch (error) {
        this.error = error.response?.data?.message || error.response?.data?.error || 'Ошибка входа';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    logout() {
      this.user = null;
      this.token = null;
      if (process.client) {
        localStorage.removeItem('token');
      }
      delete axios.defaults.headers.common.Authorization;
    },

    async checkAuth() {
      if (!process.client) return;
      const token = localStorage.getItem('token');
      if (token) {
        this.token = token;
        axios.defaults.headers.common.Authorization = `Bearer ${this.token}`;
        try {
          const response = await axios.get('/api/auth/me');
          this.user = {
            id: response.data.id,
            username: response.data.username,
            is_admin: response.data.is_admin,
          };
          this.error = null;
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Ошибка проверки авторизации:', error);
          this.logout();
        }
      }
    },
  },
});
