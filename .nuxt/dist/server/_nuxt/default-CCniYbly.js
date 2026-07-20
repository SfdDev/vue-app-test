import { defineComponent, ref, watch, computed, mergeProps, withCtx, createVNode, unref, createTextVNode, toDisplayString, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrInterpolate, ssrRenderClass, ssrRenderList, ssrRenderSlot } from "vue/server-renderer";
import { _ as __nuxt_component_0 } from "./nuxt-link-AjE5NoNn.js";
import { u as useAuthStore } from "./auth-DqrS12MN.js";
import { a as useAuth, b as useSocialIcons, c as useBaseLinks } from "./common-CJOXLyB6.js";
import { a as useRoute, u as useRouter, _ as _export_sfc } from "../server.mjs";
import "/home/dmt/projects/vue-app-test/node_modules/ufo/dist/index.mjs";
import "pinia";
import "/home/dmt/projects/vue-app-test/node_modules/hookable/dist/index.mjs";
import "/home/dmt/projects/vue-app-test/node_modules/ofetch/dist/node.mjs";
import "#internal/nuxt/paths";
import "/home/dmt/projects/vue-app-test/node_modules/unctx/dist/index.mjs";
import "/home/dmt/projects/vue-app-test/node_modules/h3/dist/index.mjs";
import "/home/dmt/projects/vue-app-test/node_modules/defu/dist/defu.mjs";
import "vue-router";
import "/home/dmt/projects/vue-app-test/node_modules/klona/dist/index.mjs";
const _imports_0 = "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20261.76%20226.69'%3e%3cpath%20d='M161.096.001l-30.225%2052.351L100.647.001H-.005l130.877%20226.688L261.749.001z'%20fill='%2341b883'/%3e%3cpath%20d='M161.096.001l-30.225%2052.351L100.647.001H52.346l78.526%20136.01L209.398.001z'%20fill='%2334495e'/%3e%3c/svg%3e";
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "header",
  __ssrInlineRender: true,
  setup(__props) {
    const { isAuthenticated, currentUsername } = useAuth();
    const { socialIcons } = useSocialIcons();
    const authStore = useAuthStore();
    const route = useRoute();
    useRouter();
    const isMenuOpen = ref(false);
    const { navLinks } = useBaseLinks();
    watch(
      () => route.fullPath,
      () => {
        isMenuOpen.value = false;
      }
    );
    const allNavLinks = computed(() => {
      const links = [...navLinks.value];
      return links;
    });
    watch(
      () => ({
        isAuthenticated: authStore.isAuthenticated,
        isAdmin: authStore.isAdmin
      }),
      () => {
        void allNavLinks.value;
      },
      { immediate: true }
    );
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<header${ssrRenderAttrs(mergeProps({
        class: ["header", { "bg--dark-gray": isMenuOpen.value }]
      }, _attrs))}><div class="container"><div class="header__row">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        class: "logo",
        to: "/"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<img${ssrRenderAttr("src", _imports_0)} alt="logo for header"${_scopeId}>`);
          } else {
            return [
              createVNode("img", {
                src: _imports_0,
                alt: "logo for header"
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      if (unref(isAuthenticated)) {
        _push(`<div class="name-user text-capitalize"> /${ssrInterpolate(unref(currentUsername))}</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<button class="${ssrRenderClass([{ "toggle--open": isMenuOpen.value }, "toggle"])}" type="button"><svg viewBox="0 0 800 600"><path d="M300,220 C300,220 520,220 540,220 C740,220 640,540 520,420 C440,340 300,200 300,200" class="top"></path><path d="M300,320 L540,320" class="middle"></path><path d="M300,210 C300,210 520,210 540,210 C740,210 640,530 520,410 C440,330 300,190 300,190" class="bottom" transform="translate(480, 320) scale(1, -1) translate(-480, -318) "></path></svg></button><div class="social-icons social-icons--pixel header__social"><!--[-->`);
      ssrRenderList(unref(socialIcons), (icon, index) => {
        _push(`<a${ssrRenderAttr("href", icon.link)} target="_blank" rel="noopener noreferrer" class="${ssrRenderClass(["social-icons__link", `icon-${icon.name}`])}"></a>`);
      });
      _push(`<!--]--></div><nav class="header__nav"><!--[-->`);
      ssrRenderList(allNavLinks.value, (link) => {
        _push(ssrRenderComponent(_component_NuxtLink, {
          key: link.text,
          class: "btn btn--pixel",
          to: link.href
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(link.text)}`);
            } else {
              return [
                createTextVNode(toDisplayString(link.text), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
      });
      _push(`<!--]--></nav><div class="header__auth">`);
      if (!unref(isAuthenticated)) {
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/auth",
          class: "btn-login btn btn--pixel"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Вход/Регистрация `);
            } else {
              return [
                createTextVNode(" Вход/Регистрация ")
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<button class="btn-logout btn btn--pixel" type="button"> Выйти </button>`);
      }
      _push(`</div></div></div>`);
      if (isMenuOpen.value) {
        _push(`<aside class="nav"><ul class="nav__list"><!--[-->`);
        ssrRenderList(allNavLinks.value, (link) => {
          _push(`<li class="mobile btn btn--pixel">`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: link.href,
            onClick: ($event) => isMenuOpen.value = false
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(link.text)}`);
              } else {
                return [
                  createTextVNode(toDisplayString(link.text), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</li>`);
        });
        _push(`<!--]-->`);
        if (!unref(isAuthenticated)) {
          _push(`<li class="btn-login btn btn--pixel">`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: "/auth",
            onClick: ($event) => isMenuOpen.value = false
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(` Вход / Регистрация `);
              } else {
                return [
                  createTextVNode(" Вход / Регистрация ")
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`</li>`);
        } else {
          _push(`<li class="btn-logout btn btn--pixel"><button type="button"> Выйти </button></li>`);
        }
        _push(`<li class="social-icons"><!--[-->`);
        ssrRenderList(unref(socialIcons), (icon, index) => {
          _push(`<a${ssrRenderAttr("href", icon.link)} target="_blank" rel="noopener noreferrer" class="${ssrRenderClass(["social-icons__link", `icon-${icon.name}`])}"></a>`);
        });
        _push(`<!--]--></li></ul></aside>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</header>`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/header.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "footer",
  __ssrInlineRender: true,
  setup(__props) {
    const { navLinks } = useBaseLinks();
    const { socialIcons } = useSocialIcons();
    const { isAuthenticated, currentUsername } = useAuth();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<footer${ssrRenderAttrs(mergeProps({ class: "footer" }, _attrs))}><div class="container"><div class="row"><nav class="footer__nav"><!--[-->`);
      ssrRenderList(unref(navLinks), (link) => {
        _push(ssrRenderComponent(_component_NuxtLink, {
          key: link.text,
          class: "btn btn--pixel",
          to: link.href
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(link.text)}`);
            } else {
              return [
                createTextVNode(toDisplayString(link.text), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
      });
      _push(`<!--]--></nav><hr class="hr-pixel footer__divider-mobile"><div class="social-icons social-icons--pixel"><!--[-->`);
      ssrRenderList(unref(socialIcons), (icon, index) => {
        _push(`<a${ssrRenderAttr("href", icon.link)} target="_blank" rel="noopener noreferrer" class="${ssrRenderClass(["social-icons__link", `icon-${icon.name}`])}"></a>`);
      });
      _push(`<!--]--></div><hr class="hr-pixel"><div class="footer__desc"> Phasellus feugiat arcu sapien, et iaculis ipsum elementum sit amet. Mauris cursus commodo interdum. Praesent ut risus eget metus luctus accumsan id ultrices nunc. Sed at orci sed massa consectetur dignissim a sit amet dui. Duis commodo vitae velit et faucibus. Morbi vehicula lacinia malesuada. Nulla placerat augue vel ipsum ultrices, cursus iaculis dui sollicitudin. Vestibulum eu ipsum vel diam elementum tempor vel ut orci. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. </div><hr class="hr-pixel"><div class="footer__info"> Все права защищены ${ssrInterpolate((/* @__PURE__ */ new Date()).getFullYear())}г. `);
      if (unref(isAuthenticated)) {
        _push(`<span class="name-user text-capitalize"> /${ssrInterpolate(unref(currentUsername))}</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(ssrRenderComponent(_component_NuxtLink, {
        class: "logo",
        to: "/"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<img${ssrRenderAttr("src", _imports_0)} alt="logo for footer"${_scopeId}>`);
          } else {
            return [
              createVNode("img", {
                src: _imports_0,
                alt: "logo for footer"
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div></div></footer>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/footer.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "default",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const pageClassByRoute = {
      index: "home-page",
      home: "home-page",
      about: "about-page",
      learn: "learn-page",
      blog: "blog-page",
      "blog-id": "article-page",
      auth: "auth-page",
      admin: "admin-page",
      "parallax-container": "parallax-page"
    };
    const pageClass = computed(() => {
      const name = String(route.name ?? "");
      return pageClassByRoute[name] ?? "";
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "app" }, _attrs))} data-v-48d080b3>`);
      _push(ssrRenderComponent(_sfc_main$2, null, null, _parent));
      _push(`<main class="${ssrRenderClass(pageClass.value)}" data-v-48d080b3>`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</main>`);
      _push(ssrRenderComponent(_sfc_main$1, null, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/default.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const _default = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-48d080b3"]]);
export {
  _default as default
};
//# sourceMappingURL=default-CCniYbly.js.map
