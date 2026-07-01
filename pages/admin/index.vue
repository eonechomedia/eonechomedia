<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useHead } from '#imports'
import { 
  onAuthChange, 
  logoutAdmin, 
  getAllPosts, 
  createPost, 
  updatePost, 
  deletePost, 
  firestoreError,
  type Post 
} from '~/composables/firebase'
import Nav from '~/components/Nav.vue'
import Footer from '~/components/Footer.vue'
import RichEditor from '~/components/RichEditor.vue'

useHead({
  title: 'Admin Dashboard | Eon Echo Media',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }]
})

const router = useRouter()
const isCheckingAuth = ref(true)
const currentAdminEmail = ref('')
const posts = ref<Post[]>([])
const isLoadingPosts = ref(false)
const statusFilter = ref<'all' | 'published' | 'draft'>('all')
const searchQuery = ref('')
const togglingId = ref<string | null>(null)

// Editor state
const isEditing = ref(false)
const editingPostId = ref<string | null>(null)
const formTitle = ref('')
const formSlug = ref('')
const formExcerpt = ref('')
const formCover = ref('')
const formContent = ref('')
const formTags = ref('')
const formStatus = ref<'draft' | 'published'>('draft')
const formIsFeatured = ref(false)
const formError = ref('')
const isSaving = ref(false)

// Auth check
onMounted(() => {
  onAuthChange((user) => {
    if (!user) {
      router.push('/admin/login')
    } else {
      currentAdminEmail.value = user.email || 'Admin'
      isCheckingAuth.value = false
      fetchPosts()
    }
  })
})

async function fetchPosts() {
  isLoadingPosts.value = true
  try {
    posts.value = await getAllPosts()
  } catch (e) {
    console.error(e)
  } finally {
    isLoadingPosts.value = false
  }
}

// Filtered + searched posts
const filteredPosts = computed(() => {
  let result = posts.value
  if (statusFilter.value !== 'all') {
    result = result.filter(p => p.status === statusFilter.value)
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    result = result.filter(p =>
      p.title.toLowerCase().includes(q) ||
      (p.excerpt || '').toLowerCase().includes(q) ||
      (p.tags || []).some(t => t.toLowerCase().includes(q)) ||
      p.slug.toLowerCase().includes(q)
    )
  }
  return result
})

const publishedCount = computed(() => posts.value.filter(p => p.status === 'published').length)
const draftCount = computed(() => posts.value.filter(p => p.status === 'draft').length)

// Quick toggle publish/unpublish
async function toggleStatus(post: Post) {
  togglingId.value = post.id
  const newStatus = post.status === 'published' ? 'draft' : 'published'
  try {
    await updatePost(post.id, { status: newStatus })
    // Update local state immediately (no full refetch needed)
    const idx = posts.value.findIndex(p => p.id === post.id)
    if (idx !== -1) posts.value[idx] = { ...posts.value[idx], status: newStatus }
  } catch (e: any) {
    console.error(e)
    alert('Failed to update status: ' + e.message)
  } finally {
    togglingId.value = null
  }
}

// Auto-generate slug from title (only when creating new)
watch(formTitle, (newVal) => {
  if (!editingPostId.value) {
    formSlug.value = newVal
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }
})

function openCreateForm() {
  isEditing.value = true
  editingPostId.value = null
  formTitle.value = ''
  formSlug.value = ''
  formExcerpt.value = ''
  formCover.value = ''
  formContent.value = ''
  formTags.value = ''
  formStatus.value = 'draft'
  formIsFeatured.value = false
  formError.value = ''
}

function openEditForm(post: Post) {
  isEditing.value = true
  editingPostId.value = post.id
  formTitle.value = post.title
  formSlug.value = post.slug
  formExcerpt.value = post.excerpt || ''
  formCover.value = post.cover || ''
  formContent.value = post.content
  formTags.value = post.tags ? post.tags.join(', ') : ''
  formStatus.value = (post.status as 'draft' | 'published') || 'draft'
  formIsFeatured.value = post.isFeatured || false
  formError.value = ''
}

function closeForm() {
  isEditing.value = false
  editingPostId.value = null
  formError.value = ''
}

async function handleSave() {
  formError.value = ''
  if (!formTitle.value || !formSlug.value || !formContent.value) {
    formError.value = 'Title, slug, and content are required fields.'
    return
  }

  const tagsArray = formTags.value
    ? formTags.value.split(',').map(t => t.trim()).filter(Boolean)
    : []

  const postPayload = {
    title: formTitle.value,
    slug: formSlug.value,
    excerpt: formExcerpt.value,
    cover: formCover.value,
    content: formContent.value,
    tags: tagsArray,
    status: formStatus.value,
    isFeatured: formIsFeatured.value
  }

  isSaving.value = true
  try {
    if (editingPostId.value) {
      await updatePost(editingPostId.value, postPayload)
    } else {
      await createPost(postPayload)
    }
    await fetchPosts()
    closeForm()
  } catch (e: any) {
    console.error(e)
    formError.value = 'Failed to save: ' + e.message
  } finally {
    isSaving.value = false
  }
}

async function handleDelete(id: string, title: string) {
  if (confirm(`Delete "${title}"? This cannot be undone.`)) {
    try {
      await deletePost(id)
      posts.value = posts.value.filter(p => p.id !== id)
    } catch (e) {
      console.error(e)
      alert('Failed to delete post.')
    }
  }
}

async function handleLogout() {
  try {
    await logoutAdmin()
    router.push('/admin/login')
  } catch (e) { console.error(e) }
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, '').slice(0, 120)
}
</script>

<template>
  <div class="bg-bg text-ink font-sans min-h-screen flex flex-col">
    <Nav />

    <!-- Auth spinner -->
    <div v-if="isCheckingAuth" class="flex-grow flex flex-col items-center justify-center py-40">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      <p class="text-xs text-muted mt-4">Verifying session...</p>
    </div>

    <!-- Dashboard -->
    <main v-else class="flex-grow w-full max-w-6xl mx-auto px-6 py-10">

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/[0.05] pb-8 mb-8">
        <div>
          <div class="text-[10px] font-semibold tracking-widest text-accent uppercase mb-1">Studio Journal Editor</div>
          <h1 class="text-2xl font-bold text-ink" style="font-family:'Cormorant Garamond',serif">Control Dashboard</h1>
          <p class="text-xs text-muted mt-1">Logged in as <span class="font-semibold text-ink2">{{ currentAdminEmail }}</span></p>
        </div>
        <div class="flex items-center gap-3">
          <button v-if="!isEditing" @click="openCreateForm"
            class="text-xs font-semibold px-5 py-2.5 rounded-full bg-accent text-white hover:bg-ink transition-all hover:-translate-y-[1px]">
            + New Post
          </button>
          <button @click="handleLogout"
            class="text-xs font-semibold px-5 py-2.5 rounded-full bg-white border border-black/[0.08] text-ink2 hover:bg-red-50 hover:text-red-600 transition-all hover:-translate-y-[1px]">
            Logout
          </button>
        </div>
      </div>

      <!-- Firebase Error Banner -->
      <div v-if="firestoreError" class="mb-8 p-5 bg-red-50 border border-red-200 rounded-2xl">
        <div class="flex items-start gap-3">
          <span class="text-xl">🔥</span>
          <div>
            <div class="text-sm font-bold text-red-700 mb-1">Firebase Firestore Not Configured</div>
            <p class="text-xs text-red-600 leading-relaxed mb-3">
              Firestore is not enabled or security rules are blocking access. Posts cannot be loaded or saved.
            </p>
            <ol class="text-xs text-red-600 leading-relaxed list-decimal pl-4 space-y-1 mb-3">
              <li>Go to <a href="https://console.firebase.google.com" target="_blank" class="underline font-semibold">console.firebase.google.com</a> → select <code class="bg-red-100 px-1 rounded">eonechomedai</code></li>
              <li>Click <strong>Firestore Database</strong> → <strong>Create database</strong> → Start in test mode</li>
              <li>Go to <strong>Rules</strong> tab → paste: <code class="bg-red-100 px-1 rounded">allow read: if true; allow write: if request.auth != null;</code> → Publish</li>
            </ol>
            <p class="text-[10px] text-red-400">Error: {{ firestoreError }}</p>
          </div>
        </div>
      </div>

      <!-- EDITOR / COMPOSER -->
      <div v-if="isEditing" class="bg-white border border-black/[0.06] rounded-3xl p-6 md:p-8 shadow-sm mb-10">
        <div class="flex items-center justify-between border-b border-black/[0.05] pb-5 mb-7">
          <h2 class="text-xl font-bold text-ink" style="font-family:'Cormorant Garamond',serif">
            {{ editingPostId ? 'Edit Article' : 'Compose New Article' }}
          </h2>
          <button @click="closeForm" class="text-xs font-medium text-muted hover:text-ink">✕ Cancel</button>
        </div>

        <form @submit.prevent="handleSave" class="flex flex-col gap-6">
          <div v-if="formError" class="p-4 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 font-medium">
            ⚠️ {{ formError }}
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div class="flex flex-col gap-1.5">
              <label class="text-[10px] font-bold uppercase tracking-wider text-ink2">Article Title *</label>
              <input type="text" v-model="formTitle" placeholder="Enter title..." required
                class="w-full px-4 py-3 rounded-xl border border-black/[0.08] focus:border-accent focus:ring-1 focus:ring-accent outline-none text-sm bg-[#FAFAF7]" />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-[10px] font-bold uppercase tracking-wider text-ink2">URL Slug *</label>
              <input type="text" v-model="formSlug" placeholder="url-friendly-slug" required
                class="w-full px-4 py-3 rounded-xl border border-black/[0.08] focus:border-accent focus:ring-1 focus:ring-accent outline-none text-sm bg-[#FAFAF7] font-mono" />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div class="flex flex-col gap-1.5">
              <label class="text-[10px] font-bold uppercase tracking-wider text-ink2">Cover Image URL</label>
              <input type="url" v-model="formCover" placeholder="https://..."
                class="w-full px-4 py-3 rounded-xl border border-black/[0.08] focus:border-accent focus:ring-1 focus:ring-accent outline-none text-sm bg-[#FAFAF7]" />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-[10px] font-bold uppercase tracking-wider text-ink2">Tags (comma separated)</label>
              <input type="text" v-model="formTags" placeholder="Marketing, Strategy, Digital"
                class="w-full px-4 py-3 rounded-xl border border-black/[0.08] focus:border-accent focus:ring-1 focus:ring-accent outline-none text-sm bg-[#FAFAF7]" />
            </div>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-[10px] font-bold uppercase tracking-wider text-ink2">Excerpt (short summary shown on blog cards)</label>
            <input type="text" v-model="formExcerpt" placeholder="A brief, compelling summary of the article..."
              class="w-full px-4 py-3 rounded-xl border border-black/[0.08] focus:border-accent focus:ring-1 focus:ring-accent outline-none text-sm bg-[#FAFAF7]" />
          </div>

          <!-- Rich Text Editor -->
          <div class="flex flex-col gap-1.5">
            <label class="text-[10px] font-bold uppercase tracking-wider text-ink2">Content *</label>
            <ClientOnly>
              <RichEditor v-model="formContent" placeholder="Write your article here..." />
              <template #fallback>
                <textarea v-model="formContent" rows="10" placeholder="Write your article here..."
                  class="w-full px-4 py-4 rounded-xl border border-black/[0.08] focus:border-accent outline-none text-sm bg-[#FAFAF7] font-mono leading-relaxed"></textarea>
              </template>
            </ClientOnly>
          </div>

          <!-- Cover preview -->
          <div v-if="formCover" class="rounded-xl overflow-hidden h-36 border border-black/[0.06]">
            <img :src="formCover" alt="Cover preview" class="w-full h-full object-cover" @error="formCover = ''" />
          </div>

          <!-- Status & Actions -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pt-4 border-t border-black/[0.05]">
            <div class="flex flex-wrap items-center gap-6">
              <div class="flex items-center gap-3">
                <label class="text-[10px] font-bold uppercase tracking-wider text-ink2">Status:</label>
                <select v-model="formStatus"
                  class="px-4 py-2.5 rounded-xl border border-black/[0.08] text-xs font-semibold bg-white focus:border-accent outline-none cursor-pointer">
                  <option value="draft">📝 Draft</option>
                  <option value="published">✅ Published</option>
                </select>
              </div>
              <div class="flex items-center gap-2">
                <input type="checkbox" id="formIsFeatured" v-model="formIsFeatured"
                  class="w-4 h-4 rounded text-accent border-black/[0.08] focus:ring-accent cursor-pointer" />
                <label for="formIsFeatured" class="text-[10px] font-bold uppercase tracking-wider text-ink2 cursor-pointer select-none">
                  ⭐ Feature this post
                </label>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <button type="button" @click="closeForm"
                class="text-xs font-semibold px-6 py-3 rounded-xl border border-black/[0.08] text-ink2 hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit" :disabled="isSaving"
                class="text-xs font-semibold px-8 py-3 rounded-xl bg-ink text-white hover:bg-accent disabled:bg-muted disabled:cursor-not-allowed transition-all">
                {{ isSaving ? 'Saving...' : (editingPostId ? 'Update Article' : 'Save Article') }}
              </button>
            </div>
          </div>
        </form>
      </div>

      <!-- POST LIST -->
      <div v-else>
        <!-- Search + Filter toolbar -->
        <div class="flex flex-col sm:flex-row gap-3 mb-6">
          <!-- Search bar -->
          <div class="relative flex-grow">
            <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search by title, tag, or slug..."
              class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-black/[0.08] bg-white focus:border-accent focus:ring-1 focus:ring-accent outline-none text-xs"
            />
            <button v-if="searchQuery" @click="searchQuery = ''" class="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink text-xs">✕</button>
          </div>

          <!-- Filter tabs -->
          <div class="flex items-center gap-1 bg-white border border-black/[0.06] rounded-xl p-1 shrink-0">
            <button v-for="tab in ['all', 'published', 'draft'] as const" :key="tab"
              @click="statusFilter = tab"
              :class="['px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all',
                statusFilter === tab ? 'bg-ink text-white' : 'text-muted hover:text-ink']">
              {{ tab === 'all' ? `All (${posts.length})` : tab === 'published' ? `✅ ${publishedCount}` : `📝 ${draftCount}` }}
            </button>
          </div>
        </div>

        <!-- Search result info -->
        <div v-if="searchQuery && filteredPosts.length !== posts.length" class="mb-4 text-xs text-muted">
          Showing <span class="font-semibold text-ink">{{ filteredPosts.length }}</span> result{{ filteredPosts.length !== 1 ? 's' : '' }} for
          <span class="font-semibold text-accent">"{{ searchQuery }}"</span>
        </div>

        <!-- Loading -->
        <div v-if="isLoadingPosts" class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div v-for="i in 4" :key="i" class="animate-pulse bg-white border border-black/[0.06] rounded-2xl h-48 shadow-sm"></div>
        </div>

        <!-- Empty -->
        <div v-else-if="!filteredPosts.length" class="text-center py-20 border border-dashed border-black/[0.08] rounded-3xl bg-white shadow-sm">
          <span class="text-3xl">{{ searchQuery ? '🔍' : statusFilter === 'draft' ? '📝' : '📰' }}</span>
          <h3 class="font-semibold text-lg text-ink mt-4">
            {{ searchQuery ? `No results for "${searchQuery}"` : statusFilter === 'all' ? 'No articles yet' : `No ${statusFilter} articles` }}
          </h3>
          <p class="text-xs text-muted mt-1 max-w-[280px] mx-auto leading-relaxed">
            {{ searchQuery ? 'Try a different search term or clear the search.' : 'Click "+ New Post" to write your first article.' }}
          </p>
          <button v-if="!searchQuery && statusFilter === 'all'" @click="openCreateForm"
            class="mt-5 inline-block bg-accent text-white text-xs font-semibold px-6 py-2.5 rounded-full hover:bg-ink transition-colors">
            Write First Article
          </button>
        </div>

        <!-- Post Cards Grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div v-for="post in filteredPosts" :key="post.id"
            class="bg-white border border-black/[0.06] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group">

            <!-- Cover Thumbnail -->
            <div class="relative h-32 bg-gradient-to-br from-[#F5EDE4] to-[#DDF0EA] overflow-hidden">
              <img v-if="post.cover" :src="post.cover" :alt="post.title"
                class="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" />
              <div v-else class="w-full h-full flex items-center justify-center">
                <span class="text-3xl opacity-20">🗞️</span>
              </div>
              <!-- Status badge overlay -->
              <span class="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wide border backdrop-blur-sm"
                :class="post.status === 'published'
                  ? 'bg-green-50/90 text-green-700 border-green-200'
                  : 'bg-amber-50/90 text-amber-700 border-amber-200'">
                {{ post.status === 'published' ? '✅ Published' : '📝 Draft' }}
              </span>
              <!-- Featured badge overlay -->
              <span v-if="post.isFeatured" class="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wide border backdrop-blur-sm bg-amber-500 text-white border-amber-400 font-semibold">
                ⭐ Featured
              </span>
            </div>

            <!-- Post Info -->
            <div class="p-5">
              <!-- Tags -->
              <div v-if="post.tags && post.tags.length" class="flex flex-wrap gap-1.5 mb-2">
                <span v-for="tag in post.tags.slice(0, 3)" :key="tag"
                  class="text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent/5 text-accent border border-accent/10">
                  {{ tag }}
                </span>
              </div>

              <!-- Title -->
              <h3 class="text-sm font-bold text-ink mb-1.5 leading-snug line-clamp-2">
                {{ post.title }}
              </h3>

              <!-- Excerpt / Content preview -->
              <p class="text-xs text-muted leading-relaxed line-clamp-2 mb-3">
                {{ post.excerpt || stripHtml(post.content) }}
              </p>

              <!-- Date + Slug -->
              <div class="flex items-center justify-between text-[10px] text-muted mb-4">
                <span>{{ formatDate(post.createdAt) }}</span>
                <span class="font-mono truncate max-w-[110px] opacity-60">/{{ post.slug }}</span>
              </div>

              <!-- Action buttons -->
              <div class="flex items-center gap-2">
                <!-- Quick publish/unpublish toggle -->
                <button
                  @click="toggleStatus(post)"
                  :disabled="togglingId === post.id"
                  :class="['flex-1 px-3 py-2 rounded-lg text-xs font-semibold border transition-all disabled:opacity-50 disabled:cursor-not-allowed',
                    post.status === 'published'
                      ? 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                      : 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100']"
                  :title="post.status === 'published' ? 'Click to unpublish (move to draft)' : 'Click to publish'"
                >
                  <span v-if="togglingId === post.id" class="inline-block w-3 h-3 border border-current rounded-full border-t-transparent animate-spin mr-1"></span>
                  {{ post.status === 'published' ? '⬇ Unpublish' : '⬆ Publish' }}
                </button>

                <!-- Preview: draft → /admin/preview/[id], published → /blog/[slug] in new tab -->
                <NuxtLink
                  :to="post.status === 'published' ? `/blog/${post.slug}` : `/admin/preview/${post.id}`"
                  :target="post.status === 'published' ? '_blank' : undefined"
                  class="px-3 py-2 rounded-lg border border-black/[0.06] hover:bg-gray-50 text-ink2 text-xs font-semibold transition-colors"
                  :title="post.status === 'published' ? 'View live article' : 'Preview draft'">
                  {{ post.status === 'published' ? '🔗' : '🔍' }}
                </NuxtLink>

                <button @click="openEditForm(post)"
                  class="px-3 py-2 rounded-lg border border-black/[0.06] hover:bg-gray-50 text-ink2 text-xs font-semibold transition-colors"
                  title="Edit article">
                  ✏️
                </button>
                <button @click="handleDelete(post.id, post.title)"
                  class="px-3 py-2 rounded-lg border border-red-100 bg-red-50/50 hover:bg-red-50 text-red-500 text-xs font-semibold transition-colors"
                  title="Delete article">
                  🗑️
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <Footer />
  </div>
</template>
