<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from '#imports'

const route = useRoute()
const isBlogOrAdmin = computed(() => route.path.startsWith('/blog') || route.path.startsWith('/admin'))
</script>

<template>
  <footer>
    <div class="ft-grid">
      <div>
        <NuxtLink to="/" class="ft-logo">Eon <span>Echo</span> Media</NuxtLink>
        <div class="ft-about">A full-spectrum content studio producing digital and print marketing across more than 10
          industries. Mumbai, India.</div>
      </div>

      <div>
        <div class="ft-col-h">Services</div>
        <div class="ft-links">
          <NuxtLink :to="isBlogOrAdmin ? '/#services' : '#services'" title="Digital content">Digital content</NuxtLink>
          <NuxtLink :to="isBlogOrAdmin ? '/#services' : '#services'" title="Print and publishing">Print and publishing</NuxtLink>
          <NuxtLink :to="isBlogOrAdmin ? '/#services' : '#services'" title="Brand storytelling">Brand storytelling</NuxtLink>
          <NuxtLink :to="isBlogOrAdmin ? '/#services' : '#services'" title="Long-form and editorial">Long-form and editorial</NuxtLink>
          <NuxtLink :to="isBlogOrAdmin ? '/#services' : '#services'" title="Video scripts">Video scripts</NuxtLink>
        </div>
      </div>

      <div>
        <div class="ft-col-h">Industries</div>
        <div class="ft-links">
          <NuxtLink :to="isBlogOrAdmin ? '/#niches' : '#niches'" title="Fashion and Lifestyle">Fashion and Lifestyle</NuxtLink>
          <NuxtLink :to="isBlogOrAdmin ? '/#niches' : '#niches'" title="Finance and Fintech">Finance and Fintech</NuxtLink>
          <NuxtLink :to="isBlogOrAdmin ? '/#niches' : '#niches'" title="Healthcare">Healthcare</NuxtLink>
          <NuxtLink :to="isBlogOrAdmin ? '/#niches' : '#niches'" title="Real Estate">Real Estate</NuxtLink>
          <NuxtLink :to="isBlogOrAdmin ? '/#niches' : '#niches'" title="Technology">Technology</NuxtLink>
          <NuxtLink :to="isBlogOrAdmin ? '/#niches' : '#niches'" title="View all industries">View all</NuxtLink>
        </div>
      </div>

      <div>
        <div class="ft-col-h">Studio</div>
        <div class="ft-links">
          <NuxtLink :to="isBlogOrAdmin ? '/#why' : '#why'" title="About Eon Echo">About</NuxtLink>
          <NuxtLink :to="isBlogOrAdmin ? '/#services' : '#services'" title="Our work">Our work</NuxtLink>
          <NuxtLink :to="isBlogOrAdmin ? '/#how' : '#how'" title="Our process">Process</NuxtLink>
          <NuxtLink :to="isBlogOrAdmin ? '/#contact' : '#contact'" title="Contact">Contact</NuxtLink>
        </div>
      </div>
    </div>

    <div class="ft-bottom">
      <div class="ft-copy">©2026 Eon Echo Media. Mumbai, India.</div>
      <div style="display:flex;gap:10px;align-items:center">
        <div class="ft-pills">
          <span class="ft-pill">Content studio</span>
          <span class="ft-pill">Digital and Print</span>
          <span class="ft-pill">10+ niches</span>
        </div>
        <div style="margin-left:12px;display:flex;gap:8px;align-items:center">
          <a href="mailto:jd@eonechomedia.com" title="Email us" class="ft-link">jd@eonechomedia.com</a>
          <a href="https://instagram.com/eonechomedia" target="_blank" rel="noopener noreferrer"
            title="Follow on Instagram" class="btn-insta"
            style="padding:8px 12px;border-radius:8px;font-size:13px">Follow</a>
        </div>
      </div>
    </div>
  </footer>
</template>
