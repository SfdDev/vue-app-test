import { defineComponent, ref, mergeProps, useSSRContext, computed, watch, unref } from "vue";
import { ssrRenderAttrs, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList, ssrInterpolate, ssrRenderComponent } from "vue/server-renderer";
import { _ as _sfc_main$2 } from "./hero-D-Bh1vTN.js";
import { u as useCategoryStore, P as Pagination } from "./categories-BabCzmgV.js";
import { _ as _export_sfc, a as useRoute, u as useRouter } from "../server.mjs";
import { u as useArticlesStore, g as getFullImageUrl, f as formatDate } from "./common-CJOXLyB6.js";
import "./nuxt-link-AjE5NoNn.js";
import "/home/dmt/projects/vue-app-test/node_modules/ufo/dist/index.mjs";
import "pinia";
import "./auth-DqrS12MN.js";
import "/home/dmt/projects/vue-app-test/node_modules/hookable/dist/index.mjs";
import "/home/dmt/projects/vue-app-test/node_modules/ofetch/dist/node.mjs";
import "#internal/nuxt/paths";
import "/home/dmt/projects/vue-app-test/node_modules/unctx/dist/index.mjs";
import "/home/dmt/projects/vue-app-test/node_modules/h3/dist/index.mjs";
import "/home/dmt/projects/vue-app-test/node_modules/defu/dist/defu.mjs";
import "vue-router";
import "/home/dmt/projects/vue-app-test/node_modules/klona/dist/index.mjs";
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "CategoryFilter",
  __ssrInlineRender: true,
  emits: ["categoryChanged"],
  setup(__props, { emit: __emit }) {
    useCategoryStore();
    const categories = ref([]);
    const selectedCategoryId = ref(null);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "category-filter" }, _attrs))} data-v-be530315><div class="container" data-v-be530315><div class="category-filter__row" data-v-be530315><h3 class="category-filter__title" data-v-be530315>Фильтр по категориям:</h3><select class="select" data-v-be530315><option${ssrRenderAttr("value", null)} data-v-be530315${ssrIncludeBooleanAttr(Array.isArray(selectedCategoryId.value) ? ssrLooseContain(selectedCategoryId.value, null) : ssrLooseEqual(selectedCategoryId.value, null)) ? " selected" : ""}>Все категории</option><!--[-->`);
      ssrRenderList(categories.value, (category) => {
        _push(`<option${ssrRenderAttr("value", category.id)} data-v-be530315${ssrIncludeBooleanAttr(Array.isArray(selectedCategoryId.value) ? ssrLooseContain(selectedCategoryId.value, category.id) : ssrLooseEqual(selectedCategoryId.value, category.id)) ? " selected" : ""}>${ssrInterpolate(category.name)}</option>`);
      });
      _push(`<!--]--></select>`);
      if (selectedCategoryId.value) {
        _push(`<button class="btn btn--outline" type="button" data-v-be530315> Сбросить </button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div></div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/CategoryFilter.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const CategoryFilter = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-be530315"]]);
function useBlog(perPage = 6, baseRoute = "/blog") {
  const articlesStore = useArticlesStore();
  const route = useRoute();
  useRouter();
  const articles = computed(() => articlesStore.getCurrentArticles);
  const loadArticles = async (page, categoryId) => {
    await articlesStore.loadArticles(page, perPage, categoryId);
  };
  watch(
    () => route.query.page,
    async (newPage) => {
      const page = Number.parseInt(newPage || "1", 10) || 1;
      if (page !== articlesStore.pagination.currentPage) {
        await articlesStore.loadArticles(page, perPage);
      }
    }
  );
  watch(
    () => articlesStore.pagination.currentPage,
    async (newPage) => {
      if (newPage && newPage !== Number.parseInt(route.query.page || "1", 10)) {
        await articlesStore.loadArticles(newPage, perPage);
      }
    }
  );
  const changePage = async (page) => {
    const pageNum = Number.parseInt(String(page), 10) || 1;
    if (pageNum < 1 || pageNum > articlesStore.pagination.totalPages) {
      console.warn("Некорректный номер страницы:", page);
      return;
    }
    if (pageNum !== articlesStore.pagination.currentPage) {
      try {
        await articlesStore.loadArticles(pageNum, perPage);
      } catch (error) {
        console.error("Ошибка при загрузке страницы:", error);
      }
    }
  };
  return {
    articles,
    pagination: computed(() => articlesStore.pagination),
    changePage,
    loadArticles
  };
}
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const { articles, pagination, loadArticles } = useBlog(6, "/blog");
    const selectedCategory = ref(null);
    watch(selectedCategory, async (newCategory) => {
      await loadArticles(1, newCategory);
    });
    function onCategoryChanged(categoryId) {
      selectedCategory.value = categoryId;
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<!--[-->`);
      _push(ssrRenderComponent(_sfc_main$2, null, null, _parent));
      _push(`<section class="blog">`);
      _push(ssrRenderComponent(CategoryFilter, { onCategoryChanged }, null, _parent));
      _push(`<div class="blog__content"><div class="container"><div class="row"><!--[-->`);
      ssrRenderList(unref(articles), (article) => {
        _push(`<div class="col-12 col-sm-6 col-lg-4"><article class="card"><img class="card__image"${ssrRenderAttr("src", unref(getFullImageUrl)(article.image_url))} alt="" loading="lazy"><div class="card__body"><h3 class="card__headline">${ssrInterpolate(article.title)}</h3><hr class="hr-pixel"><div class="card__created"> Опубликовано: ${ssrInterpolate(unref(formatDate)(article.created_at))}</div><hr class="hr-pixel"><div class="card__author"> Автор: ${ssrInterpolate(article.author_name)}</div>`);
        if (article.category_name) {
          _push(`<hr class="hr-pixel">`);
        } else {
          _push(`<!---->`);
        }
        if (article.category_name) {
          _push(`<div class="card__category"> Категория: ${ssrInterpolate(article.category_name)}</div>`);
        } else {
          _push(`<!---->`);
        }
        if (article.category_name) {
          _push(`<hr class="hr-pixel">`);
        } else {
          _push(`<!---->`);
        }
        _push(`<p class="card__description">${ssrInterpolate(article.content)}... </p><hr class="hr-pixel"><div class="card__footer"><button class="btn" type="button"> Читать дальше </button></div></div></article></div>`);
      });
      _push(`<!--]--></div>`);
      _push(ssrRenderComponent(Pagination, {
        "total-pages": unref(pagination).totalPages,
        "model-value": unref(pagination).currentPage,
        "onUpdate:modelValue": (page) => unref(pagination).currentPage = page
      }, null, _parent));
      _push(`</div></div></section><!--]-->`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/blog/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};
//# sourceMappingURL=index-BB4yn1hn.js.map
