<script setup lang="ts">
import { useRoute, useHead, useAsyncData, computed, onMounted } from '#imports'
import { useRouter } from '#imports'
import Nav from '~/components/Nav.vue'
import Footer from '~/components/Footer.vue'
import { getPostForPreview, onAuthChange } from '~/composables/firebase'

useHead({
  title: 'Preview Post | Admin',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }]
})

const route = useRoute()
const router = useRouter()
const id = route.params.id as string

// Auth guard — only admins can access preview
onMounted(() => {
  onAuthChange((user: any) => {
    if (!user) {
      router.push('/admin/login')
    }
  })
})

const { data: post, pending, error } = await useAsyncData(`preview-${id}`, () => getPostForPreview(id))

const dateStr = computed(() => {
  if (!post.value?.createdAt) return ''
  return new Date(post.value.createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  })
})
</script>

<template>
  <div class="bg-bg text-ink font-sans min-h-screen flex flex-col">
    <Nav />

    <!-- Draft Preview Banner -->
    <div class="sticky top-[57px] z-50 bg-amber-50 border-b border-amber-200 px-6 py-3 flex items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <span class="text-base">🔍</span>
        <div>
          <span class="text-xs font-bold text-amber-800 uppercase tracking-wider">Draft Preview</span>
          <span class="text-xs text-amber-700 ml-2">— This post is not visible to the public until published.</span>
        </div>
        <span
          v-if="post"
          class="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wide border"
          :class="post.status === 'published'
            ? 'bg-green-50 text-green-700 border-green-200'
            : 'bg-yellow-50 text-yellow-700 border-yellow-200'"
        >
          {{ post.status }}
        </span>
      </div>
      <div class="flex items-center gap-2">
        <NuxtLink
          to="/admin"
          class="text-xs font-semibold px-4 py-1.5 rounded-lg bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-200 transition-colors"
        >
          ← Back to Dashboard
        </NuxtLink>
      </div>
    </div>

    <main class="flex-grow w-full max-w-4xl mx-auto px-6 py-12 md:py-20">
      <div v-if="pending" class="animate-pulse flex flex-col gap-6">
        <div class="h-6 bg-black/[0.04] rounded w-1/4"></div>
        <div class="h-12 bg-black/[0.04] rounded w-3/4"></div>
        <div class="h-96 bg-black/[0.04] rounded-2xl w-full my-4"></div>
        <div class="h-6 bg-black/[0.04] rounded w-full"></div>
      </div>

      <div v-else-if="error || !post" class="text-center py-24 border border-dashed border-black/[0.08] rounded-3xl bg-white shadow-sm max-w-lg mx-auto">
        <span class="text-4xl">🔍</span>
        <h1 class="font-playfair text-2xl font-bold text-ink mt-4">Post Not Found</h1>
        <p class="text-xs text-ink2 mt-2 max-w-[300px] mx-auto leading-relaxed">
          This post could not be found. It may have been deleted.
        </p>
        <NuxtLink to="/admin" class="inline-block mt-6 bg-ink text-white text-xs font-semibold px-6 py-2.5 rounded-full hover:bg-accent transition-colors">
          Return to Dashboard
        </NuxtLink>
      </div>

      <article v-else class="flex flex-col">
        <!-- Post Header -->
        <header class="mb-10">
          <div v-if="post.tags && post.tags.length" class="flex flex-wrap gap-2 mb-4">
            <span
              v-for="tag in post.tags"
              :key="tag"
              class="text-[9px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-accent/5 text-accent border border-accent/10"
            >
              {{ tag }}
            </span>
          </div>

          <h1 class="font-playfair text-3xl md:text-5xl font-bold text-ink leading-tight mb-4 tracking-tight">
            {{ post.title }}
          </h1>

          <div class="flex items-center gap-3 text-xs text-muted border-b border-black/[0.05] pb-6">
            <span>Published on {{ dateStr }}</span>
            <span class="w-1 h-1 rounded-full bg-black/[0.08]"></span>
            <span>By Eon Echo Editorial</span>
          </div>
        </header>

        <!-- Cover Image -->
        <div v-if="post.cover" class="w-full h-[300px] md:h-[450px] overflow-hidden rounded-2xl mb-12 border border-black/[0.06]">
          <img :src="post.cover" :alt="post.title" class="w-full h-full object-cover" />
        </div>

        <!-- Content Body -->
        <div v-html="post.content" class="blog-content text-sm md:text-base leading-relaxed text-ink2 max-w-none">
        </div>
      </article>
    </main>

    <Footer />
  </div>
</template>

<style>
.blog-content p { margin-bottom: 1.5rem; }
.blog-content h2 { font-family: 'Playfair Display', serif; color: #1C1C1E; font-size: 1.6rem; font-weight: 600; margin-top: 2rem; margin-bottom: 1rem; line-height: 1.3; }
.blog-content h3 { font-family: 'Playfair Display', serif; color: #1C1C1E; font-size: 1.3rem; font-weight: 600; margin-top: 1.8rem; margin-bottom: 0.8rem; line-height: 1.3; }
.blog-content strong { color: #1C1C1E; font-weight: 600; }
.blog-content em { font-style: italic; }
.blog-content ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1.5rem; }
.blog-content ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 1.5rem; }
.blog-content li { margin-bottom: 0.5rem; }
.blog-content a { color: #D4622A; text-decoration: underline; transition: color 0.2s; }
.blog-content a:hover { color: #1C1C1E; }
.blog-content blockquote { border-left: 4px solid #D4622A; padding-left: 1rem; margin-left: 0; margin-bottom: 1.5rem; font-style: italic; color: #8E8E93; }
.blog-content pre { background: #FAFAF7; border: 1px solid rgba(28,28,30,0.06); padding: 1rem; border-radius: 8px; overflow-x: auto; margin-bottom: 1.5rem; }
.blog-content code { font-family: 'DM Mono', monospace; font-size: 0.9em; }
.blog-content hr { border: none; border-top: 1px solid rgba(28,28,30,0.08); margin: 2rem 0; }
</style>
