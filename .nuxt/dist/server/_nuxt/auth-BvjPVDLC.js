import { ref, computed, watch, defineComponent, mergeProps, unref, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrInterpolate, ssrRenderAttr, ssrRenderList, ssrRenderStyle } from "vue/server-renderer";
import { u as useAuthStore } from "./auth-DqrS12MN.js";
import { u as useRouter, _ as _export_sfc } from "../server.mjs";
import "pinia";
import "/home/dmt/projects/vue-app-test/node_modules/hookable/dist/index.mjs";
import "/home/dmt/projects/vue-app-test/node_modules/ofetch/dist/node.mjs";
import "#internal/nuxt/paths";
import "/home/dmt/projects/vue-app-test/node_modules/unctx/dist/index.mjs";
import "/home/dmt/projects/vue-app-test/node_modules/h3/dist/index.mjs";
import "/home/dmt/projects/vue-app-test/node_modules/defu/dist/defu.mjs";
import "vue-router";
import "/home/dmt/projects/vue-app-test/node_modules/ufo/dist/index.mjs";
import "/home/dmt/projects/vue-app-test/node_modules/klona/dist/index.mjs";
function useAuthForm() {
  const authStore = useAuthStore();
  const router = useRouter();
  const isLogin = ref(true);
  const username = ref("");
  const password = ref("");
  const error = ref(null);
  const success = ref(null);
  const coincidence = ref(null);
  const usernameErrors = ref([]);
  const recaptchaLoaded = ref(false);
  const recaptchaWidgetId = ref(null);
  const usernameRules = [
    (v) => !!v || "Не хватает у вас мощи)))",
    (v) => v.length >= 3 && v.length <= 15 || "Имя должно быть от 3 до 15 символов и содержать буквы латинского или кириллического алфавита",
    (v) => /^[a-zA-Zа-яА-Я]+$/.test(v) || "Только буквы (латиница или кириллица)"
  ];
  const isUsernameValid = computed(() => {
    return usernameRules.every((rule) => {
      const result = rule(username.value);
      return typeof result !== "string";
    });
  });
  function setMessage(refVar, message) {
    setTimeout(() => {
      if (Array.isArray(message)) {
        refVar.value = message;
      } else {
        refVar.value = message;
      }
    }, 0);
  }
  function validateUsername() {
    username.value = username.value.replace(/[^a-zA-Zа-яА-Я]/g, "").slice(0, 15);
    const errors = [];
    usernameRules.forEach((rule) => {
      const result = rule(username.value);
      if (typeof result === "string") errors.push(result);
    });
    if (errors.length > 0) {
      setMessage(usernameErrors, errors);
    } else {
      usernameErrors.value = [];
    }
  }
  function renderRecaptcha() {
    if (!recaptchaLoaded.value || true) return;
  }
  function resetRecaptcha() {
    if (recaptchaWidgetId.value !== null && (void 0).grecaptcha) {
      (void 0).grecaptcha.reset(recaptchaWidgetId.value);
    }
  }
  async function submit() {
    console.log("Submit function called");
    console.log("Form data:", { username: username.value, password: password.value, isLogin: isLogin.value });
    try {
      error.value = null;
      success.value = null;
      coincidence.value = null;
      if (isLogin.value) {
        console.log("Attempting login...");
        await authStore.login(username.value, password.value);
        console.log("Login successful!");
        success.value = "Вход выполнен успешно!";
        setTimeout(() => {
          router.push("/");
        }, 1e3);
      } else {
        if (!isUsernameValid.value) {
          error.value = "Имя пользователя должно быть от 3 до 15 букв (латиница или кириллица)";
          return;
        }
        try {
          const existsResponse = await $fetch("/api/auth/check-username", {
            method: "POST",
            body: { username: username.value }
          });
          if (existsResponse.exists) {
            setMessage(coincidence, "Такой пользователь уже существует");
            return;
          }
        } catch (err) {
          console.warn("Username check failed, proceeding...");
        }
        const recaptchaResponse = recaptchaWidgetId.value !== null && (void 0).grecaptcha ? (void 0).grecaptcha.getResponse(recaptchaWidgetId.value) : "test-recaptcha-response";
        await authStore.register(username.value, password.value, recaptchaResponse);
        success.value = "Регистрация прошла успешно! Теперь вы можете войти.";
        isLogin.value = true;
        resetRecaptcha();
      }
    } catch (err) {
      console.error("Submit error:", err);
      error.value = err.data?.message || err.message || "Ошибка авторизации";
    }
  }
  function toggleForm() {
    isLogin.value = !isLogin.value;
    error.value = null;
    success.value = null;
    coincidence.value = null;
    usernameErrors.value = [];
    if (isLogin.value && recaptchaWidgetId.value !== null) {
      resetRecaptcha();
    } else if (!isLogin.value && recaptchaLoaded.value && recaptchaWidgetId.value !== null) {
      renderRecaptcha();
    }
  }
  watch(isLogin, (newVal) => {
    if (!newVal && recaptchaLoaded.value) {
      setTimeout(() => renderRecaptcha(), 100);
    }
  });
  return {
    isLogin,
    username,
    password,
    error,
    success,
    coincidence,
    usernameErrors,
    recaptchaLoaded,
    submit,
    toggleForm,
    validateUsername
  };
}
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "auth",
  __ssrInlineRender: true,
  setup(__props) {
    const {
      isLogin,
      username,
      password,
      error,
      success,
      coincidence,
      usernameErrors
    } = useAuthForm();
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "auth" }, _attrs))} data-v-b5c6be21><div class="container" data-v-b5c6be21><div class="row justify-center" data-v-b5c6be21><div class="col-12 col-sm-9 col-lg-6" data-v-b5c6be21><div class="card auth__card" data-v-b5c6be21><h2 class="auth__title" data-v-b5c6be21>${ssrInterpolate(unref(isLogin) ? "Вход" : "Регистрация")}</h2><form class="form-auth" data-v-b5c6be21><div class="field" data-v-b5c6be21><label class="label" data-v-b5c6be21>Имя пользователя</label><input${ssrRenderAttr("value", unref(username))} type="text" class="input" data-v-b5c6be21>`);
      if (unref(usernameErrors).length) {
        _push(`<div class="text-error auth__message" data-v-b5c6be21><!--[-->`);
        ssrRenderList(unref(usernameErrors), (msg) => {
          _push(`<div data-v-b5c6be21>${ssrInterpolate(msg)}</div>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="field" data-v-b5c6be21><label class="label" data-v-b5c6be21>Пароль</label><input${ssrRenderAttr("value", unref(password))} type="password" class="input" data-v-b5c6be21></div><div id="recaptcha-container" class="g-recaptcha" style="${ssrRenderStyle(!unref(isLogin) ? null : { display: "none" })}" data-v-b5c6be21></div><button class="btn btn--default auth__submit" type="submit" data-v-b5c6be21>${ssrInterpolate(unref(isLogin) ? "Войти" : "Зарегистрироваться")}</button><button class="btn btn--light auth__toggle" type="button" data-v-b5c6be21>${ssrInterpolate(unref(isLogin) ? "Регистрация" : "Вход")}</button>`);
      if (unref(error)) {
        _push(`<p class="text-error auth__message" data-v-b5c6be21>${ssrInterpolate(unref(error))}</p>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(success)) {
        _push(`<p class="text-success auth__message" data-v-b5c6be21>${ssrInterpolate(unref(success))}</p>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(coincidence)) {
        _push(`<p class="text-warning auth__message" data-v-b5c6be21>${ssrInterpolate(unref(coincidence))}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</form></div></div></div></div></section>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/auth.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const auth = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-b5c6be21"]]);
export {
  auth as default
};
//# sourceMappingURL=auth-BvjPVDLC.js.map
