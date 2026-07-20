import { defineComponent, useSSRContext } from "vue";
import { ssrRenderComponent } from "vue/server-renderer";
import { _ as _sfc_main$1 } from "./hero-D-Bh1vTN.js";
import "/home/dmt/projects/vue-app-test/node_modules/hookable/dist/index.mjs";
import "./nuxt-link-AjE5NoNn.js";
import "/home/dmt/projects/vue-app-test/node_modules/ufo/dist/index.mjs";
import "../server.mjs";
import "/home/dmt/projects/vue-app-test/node_modules/ofetch/dist/node.mjs";
import "#internal/nuxt/paths";
import "/home/dmt/projects/vue-app-test/node_modules/unctx/dist/index.mjs";
import "/home/dmt/projects/vue-app-test/node_modules/h3/dist/index.mjs";
import "pinia";
import "/home/dmt/projects/vue-app-test/node_modules/defu/dist/defu.mjs";
import "vue-router";
import "/home/dmt/projects/vue-app-test/node_modules/klona/dist/index.mjs";
import "./common-CJOXLyB6.js";
import "./auth-DqrS12MN.js";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(_sfc_main$1, _attrs, null, _parent));
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};
//# sourceMappingURL=index-DetgqRz4.js.map
