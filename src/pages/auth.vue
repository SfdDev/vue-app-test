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
  <div class="container">
    <div class="row justify-center">
      <div class="col-12 col-sm-9 col-lg-6">
        <section class="card pa-4">
          <h2 class="mb-4 text-center">
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
              <div v-if="usernameErrors.length" class="text-error mt-1">
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
              class="btn btn--default h-auto w-100 mt-3"
              type="submit"
            >
              {{ isLogin ? 'Войти' : 'Зарегистрироваться' }}
            </button>

            <button
              class="btn btn--light h-auto w-100 mt-2"
              type="button"
              @click="toggleForm"
            >
              {{ isLogin ? 'Регистрация' : 'Вход' }}
            </button>

            <p v-if="error" class="text-error mt-2">
              {{ error }}
            </p>
            <p v-if="success" class="text-success mt-2">
              {{ success }}
            </p>
            <p v-if="coincidence" class="text-warning mt-2">
              {{ coincidence }}
            </p>
          </form>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.auth {
  background-image: linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), url('/image/idP5t3FQc5ntEzcbl6yg--0--ya9qu.webp');
  background-position: center;
  background-size: cover;
}

.g-recaptcha {
  margin: 20px 0;
}
</style>

