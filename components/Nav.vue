<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from '#imports'

const emit = defineEmits(['show-contact'])

const route = useRoute()
const isBlogOrAdmin = computed(() => route.path.startsWith('/blog') || route.path.startsWith('/admin'))

function onCtaClick() {
  if (route.path !== '/') {
    // If not on homepage, redirect to home contact section
    window.location.href = '/#contact'
  } else {
    // If on homepage, open contact modal
    emit('show-contact')
  }
}
</script>

<template>
  <nav>
    <NuxtLink to="/" class="logo">
      Eon <span>Echo</span> Media
    </NuxtLink>
    <div class="nav-links">
      <NuxtLink :to="isBlogOrAdmin ? '/#niches' : '#niches'">What we cover</NuxtLink>
      <NuxtLink :to="isBlogOrAdmin ? '/#services' : '#services'">Services</NuxtLink>
      <NuxtLink :to="isBlogOrAdmin ? '/#how' : '#how'">Our process</NuxtLink>
      <NuxtLink :to="isBlogOrAdmin ? '/#why' : '#why'">Studio</NuxtLink>
      <NuxtLink to="/blog" :class="{ active: route.path.startsWith('/blog') }">Blog</NuxtLink>
    </div>
    <button class="nav-cta" @click="onCtaClick">Work with us</button>
  </nav>
</template>
