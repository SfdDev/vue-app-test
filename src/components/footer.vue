<script setup lang="ts">
import { useAuth, useSocialIcons, useBaseLinks } from '@/utils/common';

const { navLinks } = useBaseLinks();
const { socialIcons } = useSocialIcons();
const { isAuthenticated, currentUsername } = useAuth();
</script>

<template>
  <footer class="footer">
    <div class="container">
      <div class="row">
        <nav class="footer__nav">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.text"
            class="btn btn--pixel"
            :to="link.href"
          >
            {{ link.text }}
          </NuxtLink>
        </nav>
        <hr class="hr-pixel footer__divider-mobile">
        <div class="social-icons social-icons--pixel">
          <a
            v-for="(icon, index) in socialIcons"
            :key="index"
            :href="icon.link"
            target="_blank"
            rel="noopener noreferrer"
            :class="['social-icons__link', `icon-${icon.name}`]"
          />
        </div>
        <hr class="hr-pixel">

        <div class="footer__desc">
          Phasellus feugiat arcu sapien, et iaculis ipsum elementum sit amet.
          Mauris cursus commodo interdum. Praesent ut risus eget metus luctus accumsan id ultrices nunc.
          Sed at orci sed massa consectetur dignissim a sit amet dui. Duis commodo vitae velit et faucibus.
          Morbi vehicula lacinia malesuada. Nulla placerat augue vel ipsum ultrices, cursus iaculis dui sollicitudin.
          Vestibulum eu ipsum vel diam elementum tempor vel ut orci. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.
        </div>
        <hr class="hr-pixel">
        <div class="footer__info">
          Все права защищены {{ new Date().getFullYear() }}г.
          <span
            v-if="isAuthenticated"
            class="name-user text-capitalize"
          >
            /{{ currentUsername }}
          </span>
          <NuxtLink class="logo" to="/">
            <img src="@/assets/logo.svg" alt="logo for footer">
          </NuxtLink>
        </div>
      </div>
    </div>
  </footer>
</template>
