import { defineStore } from "pinia";
import "vue";
import "/home/dmt/projects/vue-app-test/node_modules/hookable/dist/index.mjs";
import "../server.mjs";
const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    token: null,
    loading: false,
    error: null
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.is_admin || false
  },
  actions: {
    initializeAuth() {
    },
    getAuthHeader() {
      const token = this.token || null;
      return token ? { Authorization: `Bearer ${token}` } : {};
    },
    async checkAuth() {
      if (!this.token) {
        console.log("No token, skipping checkAuth");
        return;
      }
      console.log("Checking auth with token:", this.token);
      this.loading = true;
      try {
        const response = await $fetch("/api/auth/me", {
          headers: this.getAuthHeader()
        });
        console.log("Auth check response:", response);
        this.user = response;
      } catch (error) {
        console.error("Auth check failed:", error);
        this.logout();
      } finally {
        this.loading = false;
      }
    },
    async register(username, password, recaptcha) {
      this.loading = true;
      this.error = null;
      try {
        await $fetch("/api/auth/register", {
          method: "POST",
          body: {
            username,
            password,
            recaptcha
          }
        });
        this.loading = false;
      } catch (error) {
        this.error = error.message || "Ошибка регистрации";
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async login(username, password) {
      this.loading = true;
      this.error = null;
      try {
        const response = await $fetch("/api/auth/login", {
          method: "POST",
          body: {
            username,
            password
          }
        });
        if (response.token) {
          this.token = response.token;
          this.user = response.user;
          if (false) ;
        }
        this.loading = false;
      } catch (error) {
        this.error = error.message || "Ошибка входа";
        throw error;
      } finally {
        this.loading = false;
      }
    },
    logout() {
      this.token = null;
      this.user = null;
    },
    clearError() {
      this.error = null;
    }
  }
});
export {
  useAuthStore as u
};
//# sourceMappingURL=auth-DqrS12MN.js.map
