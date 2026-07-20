import { defineComponent, ref, useSSRContext } from "vue";
import { ssrRenderComponent } from "vue/server-renderer";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { _ as _sfc_main$1 } from "./hero-D-Bh1vTN.js";
import { _ as _export_sfc } from "../server.mjs";
import "./nuxt-link-AjE5NoNn.js";
import "/home/dmt/projects/vue-app-test/node_modules/ufo/dist/index.mjs";
import "./common-CJOXLyB6.js";
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
  __name: "parallax-container",
  __ssrInlineRender: true,
  setup(__props) {
    gsap.registerPlugin(ScrollTrigger);
    ref(null);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<!--[-->`);
      _push(ssrRenderComponent(_sfc_main$1, null, null, _parent));
      _push(`<section class="parallax-demo" data-v-83c59279><div class="box" data-v-83c59279> ScrollTrigger работает </div></section><section class="parallax-container" data-v-83c59279></section><section class="scroll-spacer" data-v-83c59279></section><!--]-->`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/parallax-container.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const parallaxContainer = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-83c59279"]]);
export {
  parallaxContainer as default
};
//# sourceMappingURL=parallax-container-BYPNbLq2.js.map
