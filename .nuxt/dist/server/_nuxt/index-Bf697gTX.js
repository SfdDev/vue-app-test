import { defineComponent, ref, computed, watch, mergeProps, unref, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderClass, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList, ssrInterpolate, ssrRenderComponent } from "vue/server-renderer";
import { u as useAuthStore } from "./auth-DqrS12MN.js";
import { u as useArticlesStore, g as getFullImageUrl, f as formatDate } from "./common-CJOXLyB6.js";
import { u as useCategoryStore, P as Pagination } from "./categories-BabCzmgV.js";
import "/home/dmt/projects/vue-app-test/node_modules/hookable/dist/index.mjs";
import { a as useRoute, u as useRouter, _ as _export_sfc } from "../server.mjs";
import "pinia";
import "/home/dmt/projects/vue-app-test/node_modules/ofetch/dist/node.mjs";
import "#internal/nuxt/paths";
import "/home/dmt/projects/vue-app-test/node_modules/unctx/dist/index.mjs";
import "/home/dmt/projects/vue-app-test/node_modules/h3/dist/index.mjs";
import "/home/dmt/projects/vue-app-test/node_modules/defu/dist/defu.mjs";
import "vue-router";
import "/home/dmt/projects/vue-app-test/node_modules/ufo/dist/index.mjs";
import "/home/dmt/projects/vue-app-test/node_modules/klona/dist/index.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const router = useRouter();
    const articlesStore = useArticlesStore();
    useAuthStore();
    const categoryStore = useCategoryStore();
    const dialogOpen = ref(false);
    const isEditing = ref(false);
    const currentTab = ref("articles");
    const categoryDialogOpen = ref(false);
    const selectedFilterCategory = ref(null);
    const currentArticle = ref({
      id: null,
      title: "",
      content: "",
      image_url: null,
      file: null,
      fileName: "",
      imagePreview: null,
      is_published: true,
      category_id: null
    });
    const currentCategory = ref({
      id: null,
      name: "",
      slug: "",
      description: null
    });
    const articles = computed(() => articlesStore.getCurrentArticles);
    const pagination = computed(() => articlesStore.pagination);
    const categories = computed(() => categoryStore.getCategories);
    async function changePage(page) {
      const pageNum = Number.parseInt(String(page), 10) || 1;
      if (pageNum < 1 || pageNum > articlesStore.pagination.totalPages) {
        console.warn("Некорректный номер страницы:", page);
        return;
      }
      if (pageNum !== articlesStore.pagination.currentPage) {
        try {
          await articlesStore.loadAdminArticles(pageNum, 4, selectedFilterCategory.value);
        } catch (error) {
          console.error("Ошибка при загрузке страницы:", error);
        }
      }
      if (pageNum === 1) {
        const query = selectedFilterCategory.value ? { category_id: selectedFilterCategory.value.toString() } : {};
        router.push({ path: "/admin", query });
      } else {
        const query = selectedFilterCategory.value ? { page: pageNum.toString(), category_id: selectedFilterCategory.value.toString() } : { page: pageNum.toString() };
        router.push({ path: "/admin", query });
      }
    }
    watch(
      () => route.query,
      async (query) => {
        const page = Number.parseInt(query.page || "1", 10) || 1;
        const categoryId = query.category_id ? Number.parseInt(query.category_id, 10) : null;
        if (categoryId !== selectedFilterCategory.value) {
          selectedFilterCategory.value = categoryId;
        }
        if (page !== articlesStore.pagination.currentPage || categoryId !== selectedFilterCategory.value) {
          await articlesStore.loadAdminArticles(page, 4, categoryId);
        }
      }
    );
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "admin" }, _attrs))} data-v-683f1ab9><div class="container" data-v-683f1ab9><div class="admin__tabs" data-v-683f1ab9><button class="${ssrRenderClass([currentTab.value === "articles" ? "btn--primary" : "btn--light", "btn"])}" type="button" data-v-683f1ab9> Статьи </button><button class="${ssrRenderClass([currentTab.value === "categories" ? "btn--primary" : "btn--light", "btn"])}" type="button" data-v-683f1ab9> Категории </button></div>`);
      if (currentTab.value === "articles") {
        _push(`<div data-v-683f1ab9><div class="admin__toolbar" data-v-683f1ab9><button class="btn btn--light" type="button" data-v-683f1ab9> Добавить статью </button><div class="admin__filters" data-v-683f1ab9><label class="label" data-v-683f1ab9>Фильтр по категории:</label><select class="select" data-v-683f1ab9><option${ssrRenderAttr("value", null)} data-v-683f1ab9${ssrIncludeBooleanAttr(Array.isArray(selectedFilterCategory.value) ? ssrLooseContain(selectedFilterCategory.value, null) : ssrLooseEqual(selectedFilterCategory.value, null)) ? " selected" : ""}>Все категории</option><!--[-->`);
        ssrRenderList(categories.value, (category) => {
          _push(`<option${ssrRenderAttr("value", category.id)} data-v-683f1ab9${ssrIncludeBooleanAttr(Array.isArray(selectedFilterCategory.value) ? ssrLooseContain(selectedFilterCategory.value, category.id) : ssrLooseEqual(selectedFilterCategory.value, category.id)) ? " selected" : ""}>${ssrInterpolate(category.name)}</option>`);
        });
        _push(`<!--]--></select><button class="btn btn--light" type="button" data-v-683f1ab9> Очистить кэш </button></div></div>`);
        if (articles.value.length) {
          _push(`<div data-v-683f1ab9><div class="row admin__list" data-v-683f1ab9><!--[-->`);
          ssrRenderList(articles.value, (article) => {
            _push(`<div class="col-12" data-v-683f1ab9><article class="card admin__card" data-v-683f1ab9><div class="row no-gutters" data-v-683f1ab9><div class="col-12 col-sm-4" data-v-683f1ab9><img${ssrRenderAttr("src", unref(getFullImageUrl)(article.image_url))} alt="" height="200" class="admin__card-image" loading="lazy" data-v-683f1ab9></div><div class="col-12 col-sm-8 admin__card-body" data-v-683f1ab9><h3 class="admin__card-title" data-v-683f1ab9>${ssrInterpolate(article.title)}</h3><p class="admin__card-text" data-v-683f1ab9>${ssrInterpolate(article.content)}... </p><p class="admin__card-meta" data-v-683f1ab9> Создано: ${ssrInterpolate(unref(formatDate)(article.created_at))}</p><p class="admin__card-meta" data-v-683f1ab9> Статус: <span class="${ssrRenderClass(article.is_published ? "text-success" : "text-warning")}" data-v-683f1ab9>${ssrInterpolate(article.is_published ? "Опубликовано" : "Не опубликовано")}</span></p><p class="admin__card-meta" data-v-683f1ab9> Автор: ${ssrInterpolate(article.author_name)}</p>`);
            if (article.category_name) {
              _push(`<p class="admin__card-meta" data-v-683f1ab9> Категория: ${ssrInterpolate(article.category_name)}</p>`);
            } else {
              _push(`<!---->`);
            }
            _push(`<div class="admin__card-actions" data-v-683f1ab9><button class="btn" type="button" data-v-683f1ab9>${ssrInterpolate(article.is_published ? "Снять с публикации" : "Опубликовать")}</button><button class="btn" type="button" data-v-683f1ab9> Удалить </button><button class="btn" type="button" data-v-683f1ab9> Редактировать </button></div></div></div></article></div>`);
          });
          _push(`<!--]--></div>`);
          _push(ssrRenderComponent(Pagination, {
            "total-pages": pagination.value.totalPages,
            "model-value": pagination.value.currentPage,
            "onUpdate:modelValue": changePage
          }, null, _parent));
          _push(`</div>`);
        } else {
          _push(`<div class="admin__empty" data-v-683f1ab9> Нет статей </div>`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      if (currentTab.value === "categories") {
        _push(`<div data-v-683f1ab9><div class="admin__toolbar" data-v-683f1ab9><button class="btn btn--light" type="button" data-v-683f1ab9> Добавить категорию </button></div>`);
        if (categories.value.length) {
          _push(`<div data-v-683f1ab9><div class="row admin__list" data-v-683f1ab9><!--[-->`);
          ssrRenderList(categories.value, (category) => {
            _push(`<div class="col-12 col-sm-6 col-lg-4" data-v-683f1ab9><div class="card admin__card" data-v-683f1ab9><div class="admin__card-body" data-v-683f1ab9><h4 class="admin__card-title" data-v-683f1ab9>${ssrInterpolate(category.name)}</h4>`);
            if (category.slug) {
              _push(`<p class="admin__card-meta text-muted" data-v-683f1ab9> Slug: ${ssrInterpolate(category.slug)}</p>`);
            } else {
              _push(`<!---->`);
            }
            if (category.description) {
              _push(`<p class="admin__card-text" data-v-683f1ab9>${ssrInterpolate(category.description)}</p>`);
            } else {
              _push(`<!---->`);
            }
            _push(`<div class="admin__card-actions" data-v-683f1ab9><button class="btn" type="button" data-v-683f1ab9> Редактировать </button><button class="btn btn--danger" type="button" data-v-683f1ab9> Удалить </button></div></div></div></div>`);
          });
          _push(`<!--]--></div></div>`);
        } else {
          _push(`<div class="admin__empty" data-v-683f1ab9> Нет категорий </div>`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      if (dialogOpen.value) {
        _push(`<dialog open class="modal" data-v-683f1ab9><section class="modal__content" data-v-683f1ab9><header class="modal__header" data-v-683f1ab9><h3 data-v-683f1ab9>${ssrInterpolate(isEditing.value ? "Редактировать статью" : "Добавить статью")}</h3></header><div class="modal__body" data-v-683f1ab9><div class="field" data-v-683f1ab9><label class="label" data-v-683f1ab9>Заголовок</label><input${ssrRenderAttr("value", currentArticle.value.title)} type="text" class="input" data-v-683f1ab9></div><div class="field" data-v-683f1ab9><label class="label" data-v-683f1ab9>Контент</label><textarea class="textarea" rows="5" data-v-683f1ab9>${ssrInterpolate(currentArticle.value.content)}</textarea></div><div class="field" data-v-683f1ab9><label class="label" data-v-683f1ab9>Категория</label><select class="select" data-v-683f1ab9><option${ssrRenderAttr("value", null)} data-v-683f1ab9${ssrIncludeBooleanAttr(Array.isArray(currentArticle.value.category_id) ? ssrLooseContain(currentArticle.value.category_id, null) : ssrLooseEqual(currentArticle.value.category_id, null)) ? " selected" : ""}>Без категории</option><!--[-->`);
        ssrRenderList(categories.value, (category) => {
          _push(`<option${ssrRenderAttr("value", category.id)} data-v-683f1ab9${ssrIncludeBooleanAttr(Array.isArray(currentArticle.value.category_id) ? ssrLooseContain(currentArticle.value.category_id, category.id) : ssrLooseEqual(currentArticle.value.category_id, category.id)) ? " selected" : ""}>${ssrInterpolate(category.name)}</option>`);
        });
        _push(`<!--]--></select></div><div class="field" data-v-683f1ab9><label class="label" data-v-683f1ab9>Статус публикации</label><label class="admin__checkbox" data-v-683f1ab9><input${ssrIncludeBooleanAttr(Array.isArray(currentArticle.value.is_published) ? ssrLooseContain(currentArticle.value.is_published, null) : currentArticle.value.is_published) ? " checked" : ""} type="checkbox" class="checkbox" data-v-683f1ab9><span data-v-683f1ab9>Опубликовано</span></label></div><div class="field" data-v-683f1ab9><label class="label" data-v-683f1ab9>Изображение</label><div class="admin__preview" data-v-683f1ab9>`);
        if (currentArticle.value.imagePreview) {
          _push(`<img${ssrRenderAttr("src", currentArticle.value.imagePreview)} alt="" height="100" data-v-683f1ab9>`);
        } else {
          _push(`<!---->`);
        }
        if (currentArticle.value.imagePreview) {
          _push(`<div class="admin__preview-caption" data-v-683f1ab9>`);
          if (currentArticle.value.file) {
            _push(`<span data-v-683f1ab9>Выбрано изображение: ${ssrInterpolate(currentArticle.value.fileName)}</span>`);
          } else {
            _push(`<span data-v-683f1ab9>Существующее изображение</span>`);
          }
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><input type="file" accept="image/jpeg,image/png" data-v-683f1ab9></div></div><footer class="modal__footer" data-v-683f1ab9><button class="btn" type="button" data-v-683f1ab9> Закрыть </button><button class="btn" type="button"${ssrIncludeBooleanAttr(unref(articlesStore).isLoading) ? " disabled" : ""} data-v-683f1ab9> Сохранить </button></footer></section></dialog>`);
      } else {
        _push(`<!---->`);
      }
      if (categoryDialogOpen.value) {
        _push(`<dialog open class="modal" data-v-683f1ab9><section class="modal__content" data-v-683f1ab9><header class="modal__header" data-v-683f1ab9><h3 data-v-683f1ab9>${ssrInterpolate(currentCategory.value.id ? "Редактировать категорию" : "Добавить категорию")}</h3></header><div class="modal__body" data-v-683f1ab9><div class="field" data-v-683f1ab9><label class="label" data-v-683f1ab9>Название</label><input${ssrRenderAttr("value", currentCategory.value.name)} type="text" class="input" data-v-683f1ab9></div><div class="field" data-v-683f1ab9><label class="label" data-v-683f1ab9>Slug</label><input${ssrRenderAttr("value", currentCategory.value.slug)} type="text" class="input" data-v-683f1ab9></div><div class="field" data-v-683f1ab9><label class="label" data-v-683f1ab9>Описание</label><textarea class="textarea" rows="3" data-v-683f1ab9>${ssrInterpolate(currentCategory.value.description)}</textarea></div></div><footer class="modal__footer" data-v-683f1ab9><button class="btn" type="button" data-v-683f1ab9> Закрыть </button><button class="btn" type="button"${ssrIncludeBooleanAttr(unref(categoryStore).loading) ? " disabled" : ""} data-v-683f1ab9> Сохранить </button></footer></section></dialog>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></section>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-683f1ab9"]]);
export {
  index as default
};
//# sourceMappingURL=index-Bf697gTX.js.map
