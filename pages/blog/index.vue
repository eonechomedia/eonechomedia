<script setup lang="ts">
import { ref, computed, useHead, useAsyncData } from '#imports'
import Nav from '~/components/Nav.vue'
import BlogCard from '~/components/BlogCard.vue'
import Footer from '~/components/Footer.vue'
import { getAllPublishedPosts } from '~/composables/firebase'

const canonicalUrl = 'https://eonechomedia.com/blog'

useHead({
  title: 'The Echo Journal | Eon Echo Media Blog',
  link: [{ rel: 'canonical', href: canonicalUrl }],
  meta: [
    { name: 'description', content: 'Insights, industry updates, and deep-dives into content marketing from the editorial team at Eon Echo Media — India\'s full-spectrum content studio.' },
    { name: 'keywords', content: 'content marketing blog India, digital marketing insights, content strategy, brand storytelling, Eon Echo Media blog' },
    // Open Graph
    { property: 'og:title', content: 'The Echo Journal | Eon Echo Media Blog' },
    { property: 'og:description', content: 'Insights and deep-dives into content marketing from India\'s full-spectrum content studio.' },
    { property: 'og:url', content: canonicalUrl },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: 'Eon Echo Media' },
    { property: 'og:locale', content: 'en_IN' },
    { property: 'og:image', content: 'https://eonechomedia.com/eonechomedia.jpg' },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    // Twitter Card
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'The Echo Journal | Eon Echo Media Blog' },
    { name: 'twitter:description', content: 'Insights into content marketing from India\'s full-spectrum content studio.' },
    { name: 'twitter:image', content: 'https://eonechomedia.com/eonechomedia.jpg' },
  ],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Blog',
        name: 'The Echo Journal',
        description: 'Insights and deep-dives into content marketing from Eon Echo Media.',
        url: canonicalUrl,
        publisher: {
          '@type': 'Organization',
          name: 'Eon Echo Media',
          url: 'https://eonechomedia.com',
          logo: {
            '@type': 'ImageObject',
            url: 'https://eonechomedia.com/eonechomedia.jpg'
          }
        }
      })
    }
  ]
})

// Fetch posts
const { data: posts, pending, error } = await useAsyncData('published-posts', () => getAllPublishedPosts())

// State
const searchQuery = ref('')
const selectedTag = ref('')

// Available tags
const allTags = computed(() => {
  if (!posts.value) return []
  const tagsSet = new Set<string>()
  posts.value.forEach(post => {
    if (post.tags) {
      post.tags.forEach(tag => tagsSet.add(tag))
    }
  })
  return Array.from(tagsSet)
})

// Filtered posts logic

const filteredPosts = computed(() => {
  if (!posts.value) return []

  const query = searchQuery.value.trim().toLowerCase()
  const selected = selectedTag.value.trim().toLowerCase()
  
  return posts.value.filter(post => {
    const title = String(post.title || '').toLowerCase()
    const excerpt = String(post.excerpt || '').toLowerCase()
    const tags = (post.tags || []).map(tag => String(tag).trim().toLowerCase())
    const matchesSearch =
      !query ||
      title.includes(query) ||
      excerpt.includes(query) ||
      tags.some(tag => tag.includes(query))

    const matchesTag = !selected || tags.includes(selected)
    return matchesSearch && matchesTag
  })
})

// Featured post: Custom marked post or latest post (if no filters are selected, show featured block)
const featuredPost = computed(() => {
  if (!posts.value || posts.value.length === 0) return null
  // Only display featured post if we aren't searching/filtering
  // if (searchQuery.value !== '' || selectedTag.value !== '') return null
  
  // Find a post marked as featured
  const featured = posts.value.find(p => p.isFeatured === true)
  if (featured) return featured
  
  // Default to the first (latest) post
  return posts.value[0]
})

// Rest of the posts (excluding featured post if visible)
const gridPosts = computed(() => {
  const list = filteredPosts.value
  if (!list.length) return []
  if (featuredPost.value) {
    // Exclude the featured post by ID to avoid duplication
     return list
    // return list.filter(p => p.id !== featuredPost.value!.id)
  }
  return list
})

function selectTag(tag: string) {
  selectedTag.value = selectedTag.value === tag ? '' : tag
}

function clearFilters() {
  searchQuery.value = ''
  selectedTag.value = ''
}

function formatDate(dateStr?: string) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<template>
  <div class="bg-[#FAFAF7] text-[#1C1C1E] font-sans min-h-screen flex flex-col">
    <Nav />

    <!-- Blog Header -->
    <header class="relative overflow-hidden bg-gradient-to-b from-[#FAF6DC]/30 to-transparent py-16 md:py-24 border-b border-black/[0.03]">
      <div class="max-w-6xl mx-auto px-6 text-center relative z-10">
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4622A]/10 border border-[#D4622A]/20 text-[10px] font-bold uppercase tracking-widest text-[#D4622A] mb-4">
          <span class="w-1.5 h-1.5 rounded-full bg-[#D4622A] animate-pulse"></span>
          Insights & Ideas
        </div>
        <h1 class="font-playfair text-5xl md:text-7xl font-bold mb-5 tracking-tight text-[#1C1C1E]">
          The <span class="text-[#D4622A] italic">Echo</span> Journal
        </h1>
        <p class="text-xs md:text-sm text-[#3A3A3C] max-w-[500px] mx-auto leading-relaxed">
          Deep-dives into digital campaigns, print editing, branding psychology, and full-spectrum content strategy.
        </p>
      </div>
      <!-- Background shapes -->
      <div class="absolute -top-10 -right-20 w-80 h-80 rounded-full bg-[#EDE8F5]/30 blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-10 -left-20 w-80 h-80 rounded-full bg-[#E8F0E5]/30 blur-3xl pointer-events-none"></div>
    </header>

    <!-- Main Content Area -->
    <main class="max-w-6xl mx-auto px-6 py-12 md:py-16 flex-grow w-full">

      <!-- Featured Post (only when not searching/filtering) -->
      <div v-if="featuredPost" class="mb-16">
        <div class="text-[10px] font-bold uppercase tracking-widest text-[#D4622A] mb-4">Featured Story</div>
        <NuxtLink :to="`/blog/${featuredPost.slug}`" class="group grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white border border-black/[0.05] hover:border-[#D4622A]/30 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500">
          <div class="lg:col-span-7 h-64 md:h-96 lg:h-full min-h-[300px] overflow-hidden relative">
            <img 
              v-if="featuredPost.cover" 
              :src="featuredPost.cover" 
              :alt="featuredPost.title"
              class="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700" 
              loading="eager"
            />
            <div v-else class="w-full h-full bg-gradient-to-br from-[#E4F0F6] to-[#EDE8F5] flex items-center justify-center">
              <span class="text-6xl opacity-35">🗞️</span>
            </div>
            <!-- Overlay badge -->
            <div class="absolute top-4 left-4 bg-black/50 backdrop-blur-md text-white text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Must Read
            </div>
          </div>
          <div class="lg:col-span-5 p-8 md:p-10 flex flex-col justify-center">
            <div v-if="featuredPost.tags && featuredPost.tags.length" class="flex flex-wrap gap-2 mb-4">
              <span v-for="tag in featuredPost.tags" :key="tag" 
                class="text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#D4622A]/5 text-[#D4622A] border border-[#D4622A]/10">
                {{ tag }}
              </span>
            </div>
            <h2 class="font-playfair text-2xl md:text-3xl font-bold leading-tight mb-4 text-[#1C1C1E] group-hover:text-[#D4622A] transition-colors duration-300">
              {{ featuredPost.title }}
            </h2>
            <p v-if="featuredPost.excerpt" class="text-xs md:text-sm text-[#3A3A3C] leading-relaxed mb-6">
              {{ featuredPost.excerpt }}
            </p>
            <div class="mt-auto flex items-center justify-between text-[11px] font-semibold text-[#8E8E93] pt-4 border-t border-black/[0.04]">
              <span>{{ formatDate(featuredPost.createdAt) }}</span>
              <span class="text-[#D4622A] group-hover:translate-x-1.5 transition-transform duration-300">Read Article →</span>
            </div>
          </div>
        </NuxtLink>
      </div>

      <!-- Filter & Search Panel -->
      <div class="border-b border-black/[0.06] pb-8 mb-12 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <!-- Tags Filter -->
        <div class="flex flex-wrap gap-2 items-center">
          <span class="text-xs font-bold text-[#8E8E93] mr-2">Filter:</span>
          <button 
            @click="selectTag('')"
            :class="['px-4 py-2 rounded-full text-xs font-semibold border transition-all duration-200', 
              selectedTag === '' 
                ? 'bg-[#1C1C1E] text-white border-transparent shadow-sm' 
                : 'bg-white text-[#3A3A3C] border-black/[0.06] hover:border-[#D4622A]/30']"
          >
            All Articles
          </button>
          <button 
            v-for="tag in allTags" 
            :key="tag"
            @click="selectTag(tag)"  
            :class="['px-4 py-2 rounded-full text-xs font-semibold border transition-all duration-200', 
              selectedTag === tag 
                ? 'bg-[#D4622A] text-white border-transparent shadow-sm' 
                : 'bg-white text-[#3A3A3C] border-black/[0.06] hover:border-[#D4622A]/30']"
          >
            {{ tag }}
          </button>
        </div>

        <!-- Search Bar -->
        <div class="relative w-full md:w-80">
          <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E8E93]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search stories & concepts..." 
            class="w-full pl-10 pr-10 py-3 rounded-full border border-black/[0.08] focus:border-[#D4622A] focus:ring-1 focus:ring-[#D4622A] outline-none text-xs bg-white transition-all shadow-sm"
          />
          <button v-if="searchQuery" @click="searchQuery = ''" class="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#8E8E93] hover:text-[#1C1C1E]">
            ✕
          </button>
        </div>
      </div>

      <!-- Pending Skeletons -->
      <div v-if="pending" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
        <div v-for="i in 3" :key="i" class="animate-pulse bg-white border border-black/[0.05] rounded-3xl h-[420px] shadow-sm">
          <div class="h-56 bg-black/[0.03] rounded-t-3xl w-full"></div>
          <div class="p-7 flex flex-col gap-4">
            <div class="h-3 bg-black/[0.03] rounded w-1/4"></div>
            <div class="h-6 bg-black/[0.03] rounded w-3/4"></div>
            <div class="h-4 bg-black/[0.03] rounded w-full"></div>
            <div class="h-4 bg-black/[0.03] rounded w-5/6"></div>
          </div>
        </div>
      </div>

      <!-- Error / Empty State -->
      <div v-else-if="error || !filteredPosts.length" class="text-center py-20 border border-dashed border-black/[0.08] rounded-3xl bg-white shadow-sm max-w-lg mx-auto">
        <span class="text-4xl">🔍</span>
        <h2 class="font-playfair text-xl font-bold text-[#1C1C1E] mt-4">No stories found</h2>
        <p class="text-xs text-[#8E8E93] mt-2 max-w-[320px] mx-auto leading-relaxed">
          We couldn't find any published stories matching your current filter criteria.
        </p>
        <button @click="clearFilters" class="mt-6 bg-[#1C1C1E] hover:bg-[#D4622A] text-white text-xs font-semibold px-6 py-2.5 rounded-full transition-all">
          Clear Filters
        </button>
      </div>

      <!-- Grid of Cards -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
        <BlogCard v-for="post in gridPosts" :key="post.id" :post="post" />
      </div>
    </main>

    <Footer />
  </div>
</template>
