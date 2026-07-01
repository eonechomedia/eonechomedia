<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useHead } from '#imports'
import { loginAdmin, onAuthChange } from '~/composables/firebase'
import Nav from '~/components/Nav.vue'
import Footer from '~/components/Footer.vue'

useHead({
  title: 'Admin Login | Eon Echo Media',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }]
})

const router = useRouter()
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

// Redirect if already logged in
onMounted(() => {
  onAuthChange((user) => {
    if (user) {
      router.push('/admin')
    }
  })
})

async function handleLogin() {
  error.value = ''
  if (!email.value || !password.value) {
    error.value = 'Please enter both email and password.'
    return
  }
  
  loading.value = true
  try {
    await loginAdmin(email.value, password.value)
    router.push('/admin')
  } catch (e: any) {
    console.error(e)
    if (e.code === 'auth/invalid-credential' || e.code === 'auth/user-not-found' || e.code === 'auth/wrong-password') {
      error.value = 'Invalid email or password. Please try again.'
    } else {
      error.value = 'An error occurred during sign in. Check console or configuration.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="bg-bg text-ink font-sans min-h-screen flex flex-col">
    <Nav />

    <main class="flex-grow flex items-center justify-center px-6 py-20">
      <div class="w-full max-w-md bg-white border border-black/[0.06] rounded-3xl p-8 md:p-10 shadow-sm">
        <div class="text-center mb-8">
          <div class="text-[10px] font-semibold tracking-widest text-accent uppercase mb-2">
            Control Panel
          </div>
          <h1 class="font-playfair text-2xl font-bold text-ink">
            Admin Portal
          </h1>
          <p class="text-xs text-muted mt-2">
            Log in to manage articles, write content, and edit drafts.
          </p>
        </div>

        <form @submit.prevent="handleLogin" class="flex flex-col gap-5">
          <div v-if="error" class="p-4 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 font-medium">
            ⚠️ {{ error }}
          </div>

          <div class="flex flex-col gap-1.5">
            <label for="email" class="text-[10px] font-bold uppercase tracking-wider text-ink2">Email Address</label>
            <input 
              id="email" 
              type="email" 
              v-model="email" 
              placeholder="admin@eonechomedia.com"
              required
              class="w-full px-4 py-3 rounded-xl border border-black/[0.08] focus:border-accent focus:ring-1 focus:ring-accent outline-none text-sm transition-all bg-[#FAFAF7]"
            />
          </div>

          <div class="flex flex-col gap-1.5">
            <label for="password" class="text-[10px] font-bold uppercase tracking-wider text-ink2">Password</label>
            <input 
              id="password" 
              type="password" 
              v-model="password" 
              placeholder="••••••••"
              required
              class="w-full px-4 py-3 rounded-xl border border-black/[0.08] focus:border-accent focus:ring-1 focus:ring-accent outline-none text-sm transition-all bg-[#FAFAF7]"
            />
          </div>

          <button 
            type="submit"
            :disabled="loading"
            class="w-full mt-2 py-3.5 rounded-xl bg-ink text-white font-semibold text-xs uppercase tracking-wider hover:bg-accent disabled:bg-muted disabled:cursor-not-allowed transition-all hover:translate-y-[-1px]"
          >
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>
      </div>
    </main>

    <Footer />
  </div>
</template>
