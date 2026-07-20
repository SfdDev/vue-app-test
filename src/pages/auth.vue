<script setup lang="ts">
import { useAuthForm } from '@/composables/useAuthForm';

const {
  isLogin,
  username,
  password,
  error,
  success,
  coincidence,
  usernameErrors,
  submit,
  toggleForm,
  validateUsername,
} = useAuthForm();
</script>

<template>
  <section class="auth">
    <div class="container">
      <div class="row justify-center">
        <div class="col-12 col-sm-9 col-lg-6">
          <div class="card auth__card">
            <h2 class="auth__title">
              {{ isLogin ? 'Вход' : 'Регистрация' }}
            </h2>
            <form class="form-auth" @submit.prevent="submit">
              <div class="field">
                <label class="label">Имя пользователя</label>
                <input
                  v-model="username"
                  type="text"
                  class="input"
                  @input="validateUsername"
                >
                <div v-if="usernameErrors.length" class="text-error auth__message">
                  <div v-for="msg in usernameErrors" :key="msg">
                    {{ msg }}
                  </div>
                </div>
              </div>

              <div class="field">
                <label class="label">Пароль</label>
                <input
                  v-model="password"
                  type="password"
                  class="input"
                >
              </div>

              <div v-show="!isLogin" id="recaptcha-container" class="g-recaptcha" />

              <button
                class="btn btn--default auth__submit"
                type="submit"
              >
                {{ isLogin ? 'Войти' : 'Зарегистрироваться' }}
              </button>

              <button
                class="btn btn--light auth__toggle"
                type="button"
                @click="toggleForm"
              >
                {{ isLogin ? 'Регистрация' : 'Вход' }}
              </button>

              <p v-if="error" class="text-error auth__message">
                {{ error }}
              </p>
              <p v-if="success" class="text-success auth__message">
                {{ success }}
              </p>
              <p v-if="coincidence" class="text-warning auth__message">
                {{ coincidence }}
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.auth {
  &__card {
    padding: 1.5rem;
  }

  &__title {
    margin: 0 0 1.5rem;
    text-align: center;
  }

  &__submit,
  &__toggle {
    width: 100%;
    height: auto;
    margin-top: 0.75rem;
  }

  &__message {
    margin-top: 0.5rem;
  }
}

.g-recaptcha {
  margin: 20px 0;
}
</style>
