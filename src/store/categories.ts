import { defineStore } from 'pinia';
import type { Category } from '~/server/models/category.model';

interface CategoryState {
  categories: Category[];
  loading: boolean;
  error: string | null;
}

export const useCategoryStore = defineStore('category', {
  state: (): CategoryState => ({
    categories: [],
    loading: false,
    error: null,
  }),

  getters: {
    getCategories: (state) => state.categories,
    isLoading: (state) => state.loading,
    getError: (state) => state.error,
    
    // Получить категорию по ID
    getCategoryById: (state) => (id: number) => {
      return state.categories.find(cat => cat.id === id);
    },
    
    // Получить категорию по slug
    getCategoryBySlug: (state) => (slug: string) => {
      return state.categories.find(cat => cat.slug === slug);
    },
    
    // Получить категории для селекта (id, name, description)
    getCategoriesForSelect: (state) => {
      return state.categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description
      }));
    }
  },

  actions: {
    async loadCategories() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await $fetch<{ data: Category[] }>('/api/categories');
        this.categories = response.data;
      } catch (error: any) {
        this.error = error.message || 'Ошибка при загрузке категорий';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createCategory(categoryData: { name: string; slug?: string; description?: string }) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await $fetch<{ data: Category }>('/api/categories', {
          method: 'POST',
          body: categoryData
        });
        
        this.categories.push(response.data);
        return response.data;
      } catch (error: any) {
        this.error = error.message || 'Ошибка при создании категории';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateCategory(id: number, categoryData: { name?: string; slug?: string; description?: string }) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await $fetch<{data: Category}>(`/api/categories/${id}`, {
          method: 'PUT',
          body: categoryData
        });
        
        const index = this.categories.findIndex(cat => cat.id === id);
        if (index !== -1) {
          this.categories[index] = response.data;
        }
        
        return response.data;
      } catch (error: any) {
        this.error = error.message || 'Ошибка при обновлении категории';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteCategory(id: number) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await $fetch<{data: Category}>(`/api/categories/${id}`, {
          method: 'DELETE'
        });
        
        const index = this.categories.findIndex(cat => cat.id === id);
        if (index !== -1) {
          this.categories.splice(index, 1);
        }
        
        return response.data;
      } catch (error: any) {
        this.error = error.message || 'Ошибка при удалении категории';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Очистка ошибок
    clearError() {
      this.error = null;
    },

    // Сброс состояния
    resetState() {
      this.categories = [];
      this.loading = false;
      this.error = null;
    }
  },
});
