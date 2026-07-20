import { _ as __nuxt_component_0 } from "./nuxt-link-AjE5NoNn.js";
import { defineComponent, ref, computed, watch, mergeProps, unref, withCtx, createTextVNode, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrInterpolate, ssrRenderAttr, ssrRenderComponent, ssrIncludeBooleanAttr } from "vue/server-renderer";
import { u as useArticlesStore, f as formatDate, g as getFullImageUrl } from "./common-CJOXLyB6.js";
import { a as useRoute, u as useRouter, _ as _export_sfc } from "../server.mjs";
import "/home/dmt/projects/vue-app-test/node_modules/ufo/dist/index.mjs";
import "./auth-DqrS12MN.js";
import "pinia";
import "/home/dmt/projects/vue-app-test/node_modules/hookable/dist/index.mjs";
import "/home/dmt/projects/vue-app-test/node_modules/ofetch/dist/node.mjs";
import "#internal/nuxt/paths";
import "/home/dmt/projects/vue-app-test/node_modules/unctx/dist/index.mjs";
import "/home/dmt/projects/vue-app-test/node_modules/h3/dist/index.mjs";
import "/home/dmt/projects/vue-app-test/node_modules/defu/dist/defu.mjs";
import "vue-router";
import "/home/dmt/projects/vue-app-test/node_modules/klona/dist/index.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[id]",
  __ssrInlineRender: true,
  setup(__props) {
    const articlesStore = useArticlesStore();
    const route = useRoute();
    useRouter();
    const loading = ref(true);
    computed(() => Number(route.params.id));
    const article = computed(() => articlesStore.article);
    const currentIndex = computed(() => {
      if (!article.value || !articlesStore.articles.length) return -1;
      return articlesStore.articles.findIndex((a) => a.id === article.value?.id);
    });
    const canGoPrevious = computed(() => {
      if (currentIndex.value === -1) return false;
      return currentIndex.value > 0 || articlesStore.pagination.currentPage > 1;
    });
    const canGoNext = computed(() => {
      if (currentIndex.value === -1) return false;
      return currentIndex.value < articlesStore.articles.length - 1 || articlesStore.pagination.currentPage < articlesStore.pagination.totalPages;
    });
    async function loadPageForArticle(id) {
      if (!id || Number.isNaN(id)) return;
      const { articlesPerPage } = articlesStore.pagination;
      const response = await $fetch(`/api/articles/page-of/${id}`, {
        query: { per_page: articlesPerPage }
      });
      const page = response.page;
      articlesStore.setOriginPage(page);
      await articlesStore.loadArticles(page, articlesPerPage);
      await articlesStore.loadArticleById(id);
    }
    watch(
      () => route.params.id,
      async (newId) => {
        if (newId) {
          loading.value = true;
          await loadPageForArticle(Number(newId));
          loading.value = false;
        }
      }
    );
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "article" }, _attrs))} data-v-a2b89802><div class="container" data-v-a2b89802>`);
      if (article.value && !loading.value) {
        _push(`<div class="row justify-center" data-v-a2b89802><div class="col-12 col-sm-8 col-md-7" data-v-a2b89802><article class="card article__card" data-v-a2b89802><h1 class="article__title" data-v-a2b89802>${ssrInterpolate(article.value.title)}</h1><div class="article__meta" data-v-a2b89802><div data-v-a2b89802>Автор: ${ssrInterpolate(article.value.author_name)}</div><div data-v-a2b89802>Опубликовано: ${ssrInterpolate(unref(formatDate)(article.value.created_at))}</div></div>`);
        if (article.value.image_url) {
          _push(`<img${ssrRenderAttr("src", unref(getFullImageUrl)(article.value.image_url))}${ssrRenderAttr("alt", article.value.title)} class="article-image" loading="lazy" data-v-a2b89802>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="article__body" data-v-a2b89802><p class="article-content" data-v-a2b89802>${article.value.content ?? ""}</p></div><div class="article__actions" data-v-a2b89802>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/blog",
          class: "btn btn--link"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` ← Назад к блогу `);
            } else {
              return [
                createTextVNode(" ← Назад к блогу ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<button class="btn" type="button" data-v-a2b89802> Назад </button><div class="article__nav" data-v-a2b89802><button class="btn" type="button"${ssrIncludeBooleanAttr(!canGoPrevious.value) ? " disabled" : ""}${ssrRenderAttr("aria-disabled", !canGoPrevious.value)} data-v-a2b89802> Предыдущая </button><button class="btn" type="button"${ssrIncludeBooleanAttr(!canGoNext.value) ? " disabled" : ""}${ssrRenderAttr("aria-disabled", !canGoNext.value)} data-v-a2b89802> Следующая </button></div></div></article></div></div>`);
      } else {
        _push(`<div class="article__loading" data-v-a2b89802> Загрузка... </div>`);
      }
      _push(`</div></section>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/blog/[id].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const _id_ = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-a2b89802"]]);
export {
  _id_ as default
};
//# sourceMappingURL=_id_-DgvmkAzG.js.map
