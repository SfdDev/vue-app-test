import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { useRouter, useRuntimeConfig } from '#imports';
import { useAuthStore } from '@/store/auth';

export function useAuthForm() {
  const authStore = useAuthStore();
  const router = useRouter();
  const config = useRuntimeConfig();

  const isLogin = ref(true);
  const username = ref('');
  const password = ref('');
  const error = ref<string | null>(null);
  const success = ref<string | null>(null);
  const coincidence = ref<string | null>(null);
  const recaptchaSiteKey = config.public.recaptchaSiteKey || '';
  const recaptchaLoaded = ref(false);
  const recaptchaWidgetId = ref<number | null>(null);
  const usernameErrors = ref<string[]>([]);
  let errorTimeout: ReturnType<typeof setTimeout> | null = null;
  let usernameTimeout: ReturnType<typeof setTimeout> | null = null;

  const usernameRules = [
    (v: string) => !!v || 'Не хватает у вас мощи)))',
    (v: string) => (v.length >= 3 && v.length <= 15) || 'Имя должно быть от 3 до 15 символов и содержать буквы латинского или кириллического алфавита',
    (v: string) => /^[a-zA-Zа-яА-Я]+$/.test(v) || 'Только буквы (латиница или кириллица)',
  ];

  const isUsernameValid = computed(() => {
    return username.value.length >= 3 && username.value.length <= 15 && /^[a-zA-Zа-яА-Я]+$/.test(username.value);
  });

  function setMessage(target: typeof error | typeof usernameErrors, message: any, timeout = 3000) {
    const currentTimeout = target === error ? errorTimeout : usernameTimeout;
    if (currentTimeout) clearTimeout(currentTimeout);

    (target as any).value = message;

    const newTimeout = setTimeout(() => {
      (target as any).value = Array.isArray(message) ? [] : null;
      if (target === error) errorTimeout = null;
      else usernameTimeout = null;
    }, timeout);

    if (target === error) errorTimeout = newTimeout;
    else usernameTimeout = newTimeout;
  }

  function validateUsername() {
    username.value = username.value.replace(/[^a-zA-Zа-яА-Я]/g, '').slice(0, 15);
    const errors: string[] = [];
    usernameRules.forEach((rule) => {
      const result = rule(username.value);
      if (typeof result === 'string') errors.push(result);
    });
    if (errors.length > 0) {
      setMessage(usernameErrors as any, errors);
    } else {
      usernameErrors.value = [];
    }
  }

  function loadRecaptcha() {
    return new Promise<void>((resolve, reject) => {
      if (typeof window === 'undefined') return resolve();
      const script = document.createElement('script');
      script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        window.grecaptcha.ready(() => {
          recaptchaLoaded.value = true;
          resolve();
        });
      };
      script.onerror = () => reject(new Error('Ошибка загрузки reCAPTCHA'));
      document.head.appendChild(script);
    });
  }

  function renderRecaptcha() {
    if (!recaptchaSiteKey) {
      error.value = 'Ошибка: Не указан ключ reCAPTCHA (NUXT_PUBLIC_RECAPTCHA_SITE_KEY)';
      return;
    }
    if (recaptchaLoaded.value && recaptchaWidgetId.value === null && typeof window !== 'undefined') {
      try {
        recaptchaWidgetId.value = window.grecaptcha.render('recaptcha-container', {
          sitekey: recaptchaSiteKey,
          theme: 'light',
        });
      } catch {
        error.value = 'Ошибка инициализации reCAPTCHA';
      }
    }
  }

  function resetRecaptcha() {
    if (recaptchaLoaded.value && recaptchaWidgetId.value !== null && typeof window !== 'undefined') {
      window.grecaptcha.reset(recaptchaWidgetId.value);
    }
  }

  async function submit() {
    error.value = null;
    success.value = null;
    coincidence.value = null;

    if (!username.value || !password.value) {
      setMessage(error as any, 'Введите логин и пароль');
      return;
    }

    try {
      if (isLogin.value) {
        await authStore.login(username.value, password.value);
        router.push('/');
      } else {
        if (!isUsernameValid.value) {
          error.value = 'Имя пользователя должно быть от 3 до 15 букв (латиница или кириллица)';
          return;
        }

        const existsResponse = await axios.post('/api/auth/check-username', { username: username.value });
        if (existsResponse.data.exists) {
          setMessage(coincidence as any, 'Такой пользователь уже существует');
          return;
        }

        if (!recaptchaLoaded.value) {
          error.value = 'reCAPTCHA ещё не загрузилась, подождите';
          return;
        }
        if (recaptchaWidgetId.value === null || typeof window === 'undefined') {
          error.value = 'reCAPTCHA не инициализирована';
          return;
        }

        const recaptchaResponse = window.grecaptcha.getResponse(recaptchaWidgetId.value);
        if (!recaptchaResponse) {
          error.value = 'Пожалуйста, подтвердите, что вы не робот';
          return;
        }

        await authStore.register(username.value, password.value, recaptchaResponse);
        isLogin.value = true;
        success.value = 'Регистрация успешна, добро пожаловать!';
        resetRecaptcha();
        router.push('/');
      }
    } catch {
      error.value = authStore.error || 'Ошибка';
    } finally {
      if (!isLogin.value) {
        resetRecaptcha();
      }
    }
  }

  async function toggleForm() {
    const wasLogin = isLogin.value;
    isLogin.value = !isLogin.value;
    error.value = null;
    coincidence.value = null;
    success.value = null;
    username.value = '';
    password.value = '';

    if (!isLogin.value) {
      if (!recaptchaLoaded.value) {
        try {
          await loadRecaptcha();
          renderRecaptcha();
        } catch {
          error.value = 'Ошибка загрузки reCAPTCHA';
        }
      } else {
        resetRecaptcha();
      }
    } else if (!wasLogin && recaptchaLoaded.value && recaptchaWidgetId.value !== null) {
      resetRecaptcha();
    }
  }

  onMounted(async () => {
    if (authStore.user) {
      router.push('/');
    }
  });

  return {
    isLogin,
    username,
    password,
    error,
    success,
    coincidence,
    recaptchaLoaded,
    usernameErrors,
    isUsernameValid,
    validateUsername,
    submit,
    toggleForm,
  };
}

