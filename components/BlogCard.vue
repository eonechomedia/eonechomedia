<script setup lang="ts">
import { computed } from 'vue'

interface PostProps {
  slug: string;
  title: string;
  excerpt?: string;
  cover?: string;
  tags?: string[];
  createdAt?: string;
  content?: string;
}

const props = defineProps<{
  post: PostProps
}>()

const date = computed(() => {
  if (!props.post.createdAt) return ''
  return new Date(props.post.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
})

const readTime = computed(() => {
  if (!props.post.content) return '1 min read'
  const words = props.post.content.replace(/<[^>]*>/g, '').split(/\s+/).length
  const mins = Math.ceil(words / 200)
  return `${mins} min read`
})
</script>

<template>
  <NuxtLink :to="`/blog/${post.slug}`" class="group flex flex-col h-full bg-white border border-black/[0.05] hover:border-[#D4622A]/30 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1.5">
    <div v-if="post.cover" class="w-full h-52 overflow-hidden border-b border-black/[0.03] relative">
      <img 
        :src="post.cover" 
        :alt="post.title" 
        loading="lazy" 
        class="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-out"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    </div>
    <div v-else class="w-full h-52 bg-gradient-to-br from-[#FAF6DC]/30 to-[#E8F0E5]/30 flex items-center justify-center border-b border-black/[0.03]">
      <span class="text-4xl opacity-30">🗞️</span>
    </div>
    
    <div class="p-7 flex flex-col flex-grow">
      <!-- Tags & Reading time -->
      <div class="flex items-center justify-between gap-4 mb-4">
        <div v-if="post.tags && post.tags.length" class="flex flex-wrap gap-1">
          <span 
            v-for="tag in post.tags.slice(0, 2)" 
            :key="tag" 
            class="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#D4622A]/5 text-[#D4622A] border border-[#D4622A]/10"
          >
            {{ tag }}
          </span>
        </div>
        <span class="text-[9px] font-semibold text-[#8E8E93] uppercase tracking-wider shrink-0">
          {{ readTime }}
        </span>
      </div>

      <!-- Title -->
      <h3 class="font-playfair text-lg md:text-xl font-bold mb-3 leading-snug text-[#1C1C1E] group-hover:text-[#D4622A] transition-colors duration-300">
        {{ post.title }}
      </h3>

      <!-- Excerpt -->
      <p v-if="post.excerpt" class="text-xs text-[#3A3A3C] leading-relaxed mb-5 flex-grow line-clamp-3">
        {{ post.excerpt }}
      </p>

      <!-- Footer Info -->
      <div class="mt-auto pt-4 border-t border-black/[0.04] flex items-center justify-between text-[10px] font-bold text-[#8E8E93] uppercase tracking-wider">
        <span>{{ date }}</span>
        <span class="text-[#D4622A] group-hover:translate-x-1 transition-transform duration-300">
          Read Story →
        </span>
      </div>
    </div>
  </NuxtLink>
</template>
