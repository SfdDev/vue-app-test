import { defineComponent, computed, mergeProps, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrIncludeBooleanAttr, ssrRenderList, ssrRenderClass, ssrInterpolate } from "vue/server-renderer";
import { u as useRouter, a as useRoute, _ as _export_sfc } from "../server.mjs";
import { defineStore } from "pinia";
import { u as useAuthStore } from "./auth-DqrS12MN.js";
import "/home/dmt/projects/vue-app-test/node_modules/hookable/dist/index.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "pagination",
  __ssrInlineRender: true,
  props: {
    modelValue: {},
    totalPages: {}
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    useRouter();
    useRoute();
    const pages = computed(() => {
      const total = props.totalPages;
      const current = props.modelValue;
      const max = 3;
      let start = Math.max(1, current - Math.floor(max / 2));
      let end = Math.min(total, start + max - 1);
      if (end - start < max - 1) {
        start = Math.max(1, end - max + 1);
      }
      return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    });
    return (_ctx, _push, _parent, _attrs) => {
      if (__props.totalPages > 1) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "pagination" }, _attrs))} data-v-15616532><button class="btn pagination__arrow" type="button"${ssrIncludeBooleanAttr(__props.modelValue === 1) ? " disabled" : ""} data-v-15616532> ← </button><!--[-->`);
        ssrRenderList(pages.value, (page) => {
          _push(`<button class="${ssrRenderClass([{ "pagination__page--active": page === __props.modelValue }, "btn pagination__page"])}" type="button" data-v-15616532>${ssrInterpolate(page)}</button>`);
        });
        _push(`<!--]--><button class="btn pagination__arrow" type="button"${ssrIncludeBooleanAttr(__props.modelValue === __props.totalPages) ? " disabled" : ""} data-v-15616532> → </button></div>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/UI/pagination.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const Pagination = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-15616532"]]);
const useCategoryStore = defineStore("category", {
  state: () => ({
    categories: [],
    loading: false,
    error: null
  }),
  getters: {
    getCategories: (state) => state.categories,
    isLoading: (state) => state.loading,
    getError: (state) => state.error,
    // Получить категорию по ID
    getCategoryById: (state) => (id) => {
      return state.categories.find((cat) => cat.id === id);
    },
    // Получить категорию по slug
    getCategoryBySlug: (state) => (slug) => {
      return state.categories.find((cat) => cat.slug === slug);
    },
    // Получить категории для селекта (id, name, description)
    getCategoriesForSelect: (state) => {
      return state.categories.map((cat) => ({
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
        const response = await $fetch("/api/categories");
        this.categories = response.data;
      } catch (error) {
        this.error = error.data?.statusMessage || error.message || "Ошибка при загрузке категорий";
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async createCategory(categoryData) {
      this.loading = true;
      this.error = null;
      const authStore = useAuthStore();
      try {
        const response = await $fetch("/api/categories", {
          method: "POST",
          body: categoryData,
          headers: authStore.getAuthHeader()
        });
        this.categories.push(response.data);
        return response.data;
      } catch (error) {
        this.error = error.data?.statusMessage || error.message || "Ошибка при создании категории";
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async updateCategory(id, categoryData) {
      this.loading = true;
      this.error = null;
      const authStore = useAuthStore();
      try {
        const response = await $fetch(`/api/categories/${id}`, {
          method: "PUT",
          body: categoryData,
          headers: authStore.getAuthHeader()
        });
        const index = this.categories.findIndex((cat) => cat.id === id);
        if (index !== -1) {
          this.categories[index] = response.data;
        }
        return response.data;
      } catch (error) {
        this.error = error.data?.statusMessage || error.message || "Ошибка при обновлении категории";
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async deleteCategory(id) {
      this.loading = true;
      this.error = null;
      const authStore = useAuthStore();
      try {
        const response = await $fetch(`/api/categories/${id}`, {
          method: "DELETE",
          headers: authStore.getAuthHeader()
        });
        const index = this.categories.findIndex((cat) => cat.id === id);
        if (index !== -1) {
          this.categories.splice(index, 1);
        }
        return response.data;
      } catch (error) {
        this.error = error.data?.statusMessage || error.message || "Ошибка при удалении категории";
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
  }
});
export {
  Pagination as P,
  useCategoryStore as u
};
//# sourceMappingURL=categories-BabCzmgV.js.map
