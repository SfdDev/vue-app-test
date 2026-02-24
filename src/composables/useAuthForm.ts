import { ref, computed, onMounted, watch } from 'vue';
import { useAuthStore } from '@/store/auth';
import { useRouter } from '#imports';

export function useAuthForm() {
  const authStore = useAuthStore();
  const router = useRouter();

  const isLogin = ref(true);
  const username = ref('');
  const password = ref('');
  const error = ref<string | null>(null);
  const success = ref<string | null>(null);
  const coincidence = ref<string | null>(null);
  const usernameErrors = ref<string[]>([]);
  const recaptchaLoaded = ref(false);
  const recaptchaWidgetId = ref<number | null>(null);
  let errorTimeout: ReturnType<typeof setTimeout> | null = null;
  let usernameTimeout: ReturnType<typeof setTimeout> | null = null;

  const usernameRules = [
    (v: string) => !!v || 'Не хватает у вас мощи)))',
    (v: string) => (v.length >= 3 && v.length <= 15) || 'Имя должно быть от 3 до 15 символов и содержать буквы латинского или кириллического алфавита',
    (v: string) => /^[a-zA-Zа-яА-Я]+$/.test(v) || 'Только буквы (латиница или кириллица)',
  ];

  const isUsernameValid = computed(() => {
    return usernameRules.every((rule) => {
      const result = rule(username.value);
      return typeof result !== 'string';
    });
  });

  function setMessage(refVar: any, message: string | string[]) {
    errorTimeout = setTimeout(() => {
      if (Array.isArray(message)) {
        refVar.value = message;
      } else {
        refVar.value = message;
      }
    }, 0);
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
      
      // Если reCAPTCHA уже загружена
      if (typeof window !== 'undefined' && window.grecaptcha) {
        recaptchaLoaded.value = true;
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.grecaptcha) {
          window.grecaptcha.ready(() => {
            recaptchaLoaded.value = true;
            resolve();
          });
        } else {
          reject(new Error('reCAPTCHA not available'));
        }
      };
      script.onerror = () => reject(new Error('Ошибка загрузки reCAPTCHA'));
      document.head.appendChild(script);
    });
  }

  function renderRecaptcha() {
    if (!recaptchaLoaded.value || typeof window === 'undefined' || !window.grecaptcha) return;
    
    const container = document.getElementById('recaptcha-container');
    if (!container) return;

    if (recaptchaWidgetId.value !== null) {
      window.grecaptcha.reset(recaptchaWidgetId.value);
    } else {
      recaptchaWidgetId.value = window.grecaptcha.render(container, {
        sitekey: '6LeIxAcTAAAAAJcZVRqyHh71UMIEbUjQ3Yc2a6e0', // тестовый ключ
        theme: 'light',
      });
    }
  }

  function resetRecaptcha() {
    if (recaptchaWidgetId.value !== null && window.grecaptcha) {
      window.grecaptcha.reset(recaptchaWidgetId.value);
    }
  }

  async function submit() {
    console.log('Submit function called');
    console.log('Form data:', { username: username.value, password: password.value, isLogin: isLogin.value });
    
    try {
      error.value = null;
      success.value = null;
      coincidence.value = null;

      if (isLogin.value) {
        console.log('Attempting login...');
        await authStore.login(username.value, password.value);
        console.log('Login successful!');
        success.value = 'Вход выполнен успешно!';
        setTimeout(() => {
          router.push('/');
        }, 1000);
      } else {
        if (!isUsernameValid.value) {
          error.value = 'Имя пользователя должно быть от 3 до 15 букв (латиница или кириллица)';
          return;
        }

        // Проверяем существование пользователя
        try {
          const existsResponse = await $fetch('/api/auth/check-username', {
            method: 'POST',
            body: { username: username.value }
          });
          if (existsResponse.exists) {
            setMessage(coincidence as any, 'Такой пользователь уже существует');
            return;
          }
        } catch (err) {
          // Если API проверки недоступен, продолжаем
          console.warn('Username check failed, proceeding...');
        }

        // Для регистрации пропускаем reCAPTCHA в тестовом режиме
        const recaptchaResponse = recaptchaWidgetId.value !== null && window.grecaptcha
          ? window.grecaptcha.getResponse(recaptchaWidgetId.value)
          : 'test-recaptcha-response';

        await authStore.register(username.value, password.value, recaptchaResponse);
        success.value = 'Регистрация прошла успешно! Теперь вы можете войти.';
        isLogin.value = true;
        resetRecaptcha();
      }
    } catch (err: any) {
      console.error('Submit error:', err);
      error.value = err.data?.message || err.message || 'Ошибка авторизации';
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

  // Следим за изменением формы для рендеринга reCAPTCHA
  watch(isLogin, (newVal) => {
    if (!newVal && recaptchaLoaded.value) {
      setTimeout(() => renderRecaptcha(), 100);
    }
  });

  onMounted(async () => {
    // Проверяем, авторизован ли пользователь
    if (process.client) {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      if (token && user) {
        router.push('/');
        return;
      }
    }

    // Загружаем reCAPTCHA
    try {
      await loadRecaptcha();
      if (!isLogin.value) {
        setTimeout(() => renderRecaptcha(), 100);
      }
    } catch (err) {
      console.warn('reCAPTCHA loading failed:', err);
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
    validateUsername,
  };
}
