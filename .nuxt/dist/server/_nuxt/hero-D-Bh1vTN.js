import { _ as __nuxt_component_0 } from "./nuxt-link-AjE5NoNn.js";
import { reactive, computed, mergeProps, unref, withCtx, createVNode, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent } from "vue/server-renderer";
import { a as useAuth } from "./common-CJOXLyB6.js";
import { defineStore } from "pinia";
import { a as useRoute } from "../server.mjs";
const useHeroStore = defineStore("heroStore", () => {
  const state = reactive({
    home: {
      heroText: "Добро пожаловать!",
      description: "Это главная страница нашего сайта, где вы найдёте всё самое интересное!"
    },
    blog: {
      heroText: "Блог",
      description: "Читайте наши последние статьи и новости в блоге."
    },
    about: {
      heroText: "О нас",
      description: "Узнайте больше о нашей команде и миссии."
    },
    learn: {
      heroText: "Обучение",
      description: "Узнайте больше о разработке вместе с нами"
    },
    todo: {
      heroText: "Задачник",
      description: "Создавайте задачи и совершенствуйтесь в их выполнении"
    },
    parallax: {
      heroText: "Параллакс",
      description: "Создавайте задачи и совершенствуйтесь в их выполнении"
    }
  });
  function getContent(routeName, key, fallback = "") {
    if (state[routeName] && state[routeName][key]) {
      return state[routeName][key];
    }
    return fallback;
  }
  return {
    getContent
  };
});
const _sfc_main = {
  __name: "hero",
  __ssrInlineRender: true,
  setup(__props) {
    const heroStore = useHeroStore();
    const { isAuthenticated, currentUsername } = useAuth();
    const route = useRoute();
    function useHeroContent(key, fallback) {
      return computed(() => heroStore.getContent(route.name, key, fallback));
    }
    const heroText = useHeroContent("heroText", "Страница");
    const description = useHeroContent("description", "Описание страницы");
    const isHomePage = computed(() => route.name === "home");
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "hero" }, _attrs))}><div class="container"><div class="hero__content"><h1 class="hero__headline">${ssrInterpolate(unref(heroText) || "Страница")}</h1><p class="hero__desc">${ssrInterpolate(unref(description) || "Описание страницы")}</p>`);
      if (unref(isAuthenticated)) {
        _push(`<div class="name-user name-user--xl text-no-wrap hover--yellow">${ssrInterpolate(unref(currentUsername))}</div>`);
      } else {
        _push(`<!---->`);
      }
      if (isHomePage.value) {
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/about",
          class: "btn btn--default"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span${_scopeId}>Узнать больше о нас</span>`);
            } else {
              return [
                createVNode("span", null, "Узнать больше о нас")
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div></section>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/hero.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as _
};
//# sourceMappingURL=hero-D-Bh1vTN.js.map
