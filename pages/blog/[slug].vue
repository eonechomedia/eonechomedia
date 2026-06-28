<script setup lang="ts">
import { useRoute, useHead, useAsyncData, computed } from '#imports'
import Nav from '~/components/Nav.vue'
import Footer from '~/components/Footer.vue'
import { getPostBySlug } from '~/composables/firebase'

const route = useRoute()
const slug = route.params.slug as string

const { data: post, pending, error } = await useAsyncData(`post-${slug}`, () => getPostBySlug(slug))

const canonicalUrl = computed(() => `https://eonechomedia.com/blog/${slug}`)
const ogImage = computed(() => post.value?.cover || 'https://eonechomedia.com/eonechomedia.jpg')
const publishedDate = computed(() => {
  if (!post.value?.createdAt) return new Date().toISOString()
  return new Date(post.value.createdAt).toISOString()
})
const modifiedDate = computed(() => {
  if (!post.value?.updatedAt) return publishedDate.value
  return new Date(post.value.updatedAt).toISOString()
})

// Dynamic SEO — full Article schema for Google & social
useHead(computed(() => ({
  title: post.value ? post.value.title : 'Article | Eon Echo Media',
  link: [{ rel: 'canonical', href: canonicalUrl.value }],
  meta: [
    { name: 'description', content: post.value?.excerpt || 'Read the latest insights on content marketing from Eon Echo Media.' },
    { name: 'keywords', content: post.value?.tags ? post.value.tags.join(', ') : 'content marketing, Eon Echo Media' },
    { name: 'author', content: 'Eon Echo Editorial Team' },
    { name: 'robots', content: 'index, follow' },
    // Open Graph
    { property: 'og:title', content: post.value?.title || 'Article | Eon Echo Media' },
    { property: 'og:description', content: post.value?.excerpt || 'Read the latest insights from Eon Echo Media.' },
    { property: 'og:url', content: canonicalUrl.value },
    { property: 'og:type', content: 'article' },
    { property: 'og:site_name', content: 'Eon Echo Media' },
    { property: 'og:locale', content: 'en_IN' },
    { property: 'og:image', content: ogImage.value },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { property: 'og:image:alt', content: post.value?.title || 'Eon Echo Media' },
    // Article-specific OG
    { property: 'article:published_time', content: publishedDate.value },
    { property: 'article:modified_time', content: modifiedDate.value },
    { property: 'article:author', content: 'Eon Echo Editorial Team' },
    { property: 'article:section', content: 'Content Marketing' },
    ...(post.value?.tags || []).map(tag => ({ property: 'article:tag', content: tag })),
    // Twitter Card
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:site', content: '@eonechomedia' },
    { name: 'twitter:title', content: post.value?.title || 'Eon Echo Media' },
    { name: 'twitter:description', content: post.value?.excerpt || 'Read on eonechomedia.com' },
    { name: 'twitter:image', content: ogImage.value },
    { name: 'twitter:image:alt', content: post.value?.title || 'Eon Echo Media' },
  ],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.value?.title || '',
        description: post.value?.excerpt || '',
        image: ogImage.value,
        url: canonicalUrl.value,
        datePublished: publishedDate.value,
        dateModified: modifiedDate.value,
        author: {
          '@type': 'Organization',
          name: 'Eon Echo Editorial Team',
          url: 'https://eonechomedia.com'
        },
        publisher: {
          '@type': 'Organization',
          name: 'Eon Echo Media',
          url: 'https://eonechomedia.com',
          logo: {
            '@type': 'ImageObject',
            url: 'https://eonechomedia.com/eonechomedia.jpg'
          }
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': canonicalUrl.value
        },
        keywords: post.value?.tags?.join(', ') || '',
        inLanguage: 'en-IN'
      })
    }
  ]
})))

const dateStr = computed(() => {
  if (!post.value?.createdAt) return ''
  return new Date(post.value.createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  })
})

const readTime = computed(() => {
  if (!post.value?.content) return '1 min read'
  const words = post.value.content.replace(/<[^>]*>/g, '').split(/\s+/).length
  const mins = Math.ceil(words / 200)
  return `${mins} min read`
})
</script>

<template>
  <div class="bg-bg text-ink font-sans min-h-screen flex flex-col">
    <Nav />

    <main class="flex-grow w-full max-w-4xl mx-auto px-6 py-12 md:py-20">
      <!-- Back button -->
      <div class="mb-10">
        <NuxtLink to="/blog" class="inline-flex items-center gap-2 text-xs font-semibold text-accent hover:text-ink transition-colors">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="w-4 h-4">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to Journal
        </NuxtLink>
      </div>

      <!-- Loading skeleton -->
      <div v-if="pending" class="animate-pulse flex flex-col gap-6">
        <div class="h-6 bg-black/[0.04] rounded w-1/4"></div>
        <div class="h-12 bg-black/[0.04] rounded w-3/4"></div>
        <div class="h-96 bg-black/[0.04] rounded-2xl w-full my-4"></div>
        <div class="h-6 bg-black/[0.04] rounded w-full"></div>
        <div class="h-6 bg-black/[0.04] rounded w-5/6"></div>
      </div>

      <!-- Not found -->
      <div v-else-if="error || !post" class="text-center py-24 border border-dashed border-black/[0.08] rounded-3xl bg-white shadow-sm max-w-lg mx-auto">
        <span class="text-4xl">🔍</span>
        <h1 class="font-playfair text-2xl font-bold text-ink mt-4">Article Not Found</h1>
        <p class="text-xs text-ink2 mt-2 max-w-[300px] mx-auto leading-relaxed">
          This article doesn't exist or hasn't been published yet.
        </p>
        <NuxtLink to="/blog" class="inline-block mt-6 bg-ink text-white text-xs font-semibold px-6 py-2.5 rounded-full hover:bg-accent transition-colors">
          Return to Journal
        </NuxtLink>
      </div>

      <!-- Article -->
      <article v-else class="flex flex-col">
        <header class="mb-10">
          <!-- Tags -->
          <div v-if="post.tags && post.tags.length" class="flex flex-wrap gap-2 mb-5">
            <span v-for="tag in post.tags" :key="tag"
              class="text-[9px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-accent/5 text-accent border border-accent/10">
              {{ tag }}
            </span>
          </div>

          <h1 class="font-playfair text-3xl md:text-5xl font-bold text-ink leading-tight mb-5 tracking-tight">
            {{ post.title }}
          </h1>

          <p v-if="post.excerpt" class="text-base text-ink2 leading-relaxed mb-6 border-l-4 border-accent/30 pl-5 italic">
            {{ post.excerpt }}
          </p>

          <div class="flex items-center gap-3 text-xs text-muted border-b border-black/[0.05] pb-6">
            <span>{{ dateStr }}</span>
            <span class="w-1 h-1 rounded-full bg-black/[0.08]"></span>
            <span>By Eon Echo Editorial</span>
            <span class="w-1 h-1 rounded-full bg-black/[0.08]"></span>
            <span>{{ readTime }}</span>
          </div>
        </header>

        <!-- Cover Image -->
        <div v-if="post.cover" class="w-full h-[300px] md:h-[450px] overflow-hidden rounded-2xl mb-12 border border-black/[0.06]">
          <img :src="post.cover" :alt="post.title" class="w-full h-full object-cover" loading="eager" />
        </div>

        <!-- Content -->
        <div v-html="post.content" class="blog-content text-sm md:text-base leading-relaxed text-ink2 max-w-none">
        </div>

        <!-- Footer CTA -->
        <div class="mt-16 pt-8 border-t border-black/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div class="text-xs font-semibold text-accent uppercase tracking-wider mb-1">Enjoyed this article?</div>
            <p class="text-sm text-ink2">Explore more insights from the Eon Echo editorial team.</p>
          </div>
          <NuxtLink to="/blog"
            class="inline-block bg-ink text-white text-xs font-semibold px-6 py-3 rounded-full hover:bg-accent transition-colors whitespace-nowrap">
            More Articles →
          </NuxtLink>
        </div>
      </article>
    </main>

    <Footer />
  </div>
</template>

<style>
.blog-content p { margin-bottom: 1.5rem; }
.blog-content h2 { font-family: 'Playfair Display', serif; color: #1C1C1E; font-size: 1.6rem; font-weight: 600; margin-top: 2.5rem; margin-bottom: 1rem; line-height: 1.3; }
.blog-content h3 { font-family: 'Playfair Display', serif; color: #1C1C1E; font-size: 1.25rem; font-weight: 600; margin-top: 2rem; margin-bottom: 0.75rem; line-height: 1.3; }
.blog-content strong { color: #1C1C1E; font-weight: 600; }
.blog-content em { font-style: italic; }
.blog-content ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1.5rem; }
.blog-content ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 1.5rem; }
.blog-content li { margin-bottom: 0.5rem; }
.blog-content a { color: #D4622A; text-decoration: underline; transition: color 0.2s; }
.blog-content a:hover { color: #1C1C1E; }
.blog-content blockquote { border-left: 4px solid #D4622A; padding: 0.5rem 0 0.5rem 1.25rem; margin: 1.5rem 0; font-style: italic; color: #8E8E93; background: rgba(212,98,42,0.03); border-radius: 0 8px 8px 0; }
.blog-content pre { background: #FAFAF7; border: 1px solid rgba(28,28,30,0.06); padding: 1.25rem; border-radius: 10px; overflow-x: auto; margin-bottom: 1.5rem; }
.blog-content code { font-family: 'DM Mono', monospace; font-size: 0.875em; background: rgba(28,28,30,0.05); padding: 0.15em 0.35em; border-radius: 4px; }
.blog-content pre code { background: none; padding: 0; }
.blog-content hr { border: none; border-top: 1px solid rgba(28,28,30,0.08); margin: 2.5rem 0; }
</style>
