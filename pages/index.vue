<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useHead, useAsyncData } from '#imports'
import Nav from '~/components/Nav.vue'
import Footer from '~/components/Footer.vue'
import BlogCard from '~/components/BlogCard.vue'
import { getAllPublishedPosts } from '~/composables/firebase'

// SEO Meta Tags
const siteUrl = 'https://eonechomedia.com'
const ogImage = `${siteUrl}/eonechomedia.jpg`

useHead({
  title: 'Eon Echo Media | Content Marketing Agency India — Digital & Print',
  link: [{ rel: 'canonical', href: siteUrl }],
  meta: [
    { name: 'description', content: "Eon Echo Media is India's full-spectrum content studio — digital and print marketing across 10+ industries. SEO blogs, magazine production, brand storytelling, social content & more. Mumbai-based, serving brands across India." },
    { name: 'keywords', content: 'content marketing agency India, content writing agency Mumbai, digital content studio India, print media agency Mumbai, SEO content writing India, brand storytelling agency, magazine production India, social media content agency, content strategy India, B2B content marketing India' },
    { name: 'robots', content: 'index, follow' },
    { name: 'author', content: 'Eon Echo Media' },
    // Open Graph
    { property: 'og:title', content: 'Eon Echo Media | Content Marketing Agency India' },
    { property: 'og:description', content: "India's full-spectrum content studio — digital and print marketing across 10+ industries. Mumbai-based, serving brands across India." },
    { property: 'og:url', content: siteUrl },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: 'Eon Echo Media' },
    { property: 'og:locale', content: 'en_IN' },
    { property: 'og:image', content: ogImage },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { property: 'og:image:alt', content: 'Eon Echo Media — Content Marketing Agency India' },
    // Twitter Card
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:site', content: '@eonechomedia' },
    { name: 'twitter:title', content: 'Eon Echo Media | Content Marketing Agency India' },
    { name: 'twitter:description', content: "India's full-spectrum content studio for digital and print marketing." },
    { name: 'twitter:image', content: ogImage },
  ],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Eon Echo Media',
        url: siteUrl,
        logo: { '@type': 'ImageObject', url: ogImage },
        description: "India's full-spectrum content studio — digital and print marketing across 10+ industries.",
        address: { '@type': 'PostalAddress', addressLocality: 'Mumbai', addressCountry: 'IN' },
        sameAs: ['https://instagram.com/eonechomedia'],
        contactPoint: { '@type': 'ContactPoint', email: 'jd@eonechomedia.com', contactType: 'customer service' },
        offers: {
          '@type': 'Offer',
          description: 'Content marketing, brand storytelling, magazine production, SEO blogs, social media content',
          areaServed: 'IN'
        }
      })
    }
  ]
})

// Image cycling for 3D Hero stack
const imageSets = [
  {
    mid: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=520&q=80&auto=format&fit=crop",
    midLabel: "Print editorial",
    front: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=520&q=80&auto=format&fit=crop",
    frontLabel: "Digital content"
  },
  {
    mid: "https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?w=520&q=80&auto=format&fit=crop",
    midLabel: "Brand campaigns",
    front: "https://images.unsplash.com/photo-1542744094-24638eff58bb?w=520&q=80&auto=format&fit=crop",
    frontLabel: "Content strategy"
  },
  {
    mid: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=520&q=80&auto=format&fit=crop",
    midLabel: "Magazine production",
    front: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=520&q=80&auto=format&fit=crop",
    frontLabel: "Editorial writing"
  }
]

const imgIdx = ref(0)
const cardOpacity = ref(1)
let cycleInterval: any = null

function cycleImages() {
  cardOpacity.value = 0
  setTimeout(() => {
    imgIdx.value = (imgIdx.value + 1) % imageSets.length
    cardOpacity.value = 1
  }, 500)
}

// 3D Parallax Rotation
const cardsWrapTransform = ref('')
const cardsWrapTransition = ref('')

function onHeroMousemove(e: MouseEvent) {
  const container = e.currentTarget as HTMLElement
  if (!container) return
  const rect = container.getBoundingClientRect()
  const cx = (e.clientX - rect.left) / rect.width - 0.5
  const cy = (e.clientY - rect.top) / rect.height - 0.5
  cardsWrapTransform.value = `rotateX(${6 - cy * 8}deg) rotateY(${-10 + cx * 12}deg)`
  cardsWrapTransition.value = 'transform 0.1s ease'
}

function onHeroMouseleave() {
  cardsWrapTransform.value = ''
  cardsWrapTransition.value = 'transform 0.8s ease'
}

// Niches expansion
const isNichesExpanded = ref(false)
const extraNiches = [
  {
    bg: 'var(--sky-light)',
    stroke: '#2A6B8A',
    iconPath: 'M5 12h14',
    name: 'Sports & Fitness',
    sub: 'Campaigns, athlete stories'
  },
  {
    bg: 'var(--rose-light)',
    stroke: '#8A3A4A',
    iconPath: 'M12 2l3 7h7l-5.5 4 2 7L12 18l-6.5 5 2-7L2 9h7z',
    name: 'Beauty & Wellness',
    sub: 'Product storytelling, features'
  },
  {
    bg: 'var(--lavender-light)',
    stroke: '#5A3A8A',
    iconPath: 'M3 3h18v12H3z', // simple rect
    name: 'Enterprise & B2B',
    sub: 'Research, whitepapers, GTM'
  },
  {
    bg: 'var(--peach-light)',
    stroke: 'var(--accent)',
    iconPath: 'M3 12h18',
    name: 'Automotive',
    sub: 'Product launches, reviews'
  }
]

// Toasts
const toasts = ref<{ id: number; message: string }[]>([])
let toastIdCounter = 0

function showToast(message: string) {
  const id = ++toastIdCounter
  toasts.value.push({ id, message })
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }, 1800)
}

// Mail/Instagram helper
function sendPrompt(promptText: string) {
  try {
    const email = 'jd@eonechomedia.com'
    const subject = encodeURIComponent(promptText)
    const body = encodeURIComponent(promptText + '\n\nPlease get back to me.')
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`
    
    // Smooth scroll to contact
    scrollTo('contact')
    showToast('Opening email client...')
  } catch (e) {
    console.error('sendPrompt error', e)
  }
}

function connectInstagram(instaId: string) {
  try {
    const url = `https://instagram.com/${encodeURIComponent(instaId)}`
    window.open(url, '_blank', 'noopener')
    showToast('Opening Instagram...')
  } catch (e) {
    console.error('connectInstagram error', e)
  }
}

// Contact Modal
const isContactModalOpen = ref(false)
function openContactModal() {
  isContactModalOpen.value = true
}
function closeContactModal() {
  isContactModalOpen.value = false
}

function modalViewContact() {
  closeContactModal()
  scrollTo('contact')
}

function modalEmail() {
  closeContactModal()
  sendPrompt('I want to work with Eon Echo Media — how do we start?')
}

function modalInsta() {
  closeContactModal()
  connectInstagram('eonechomedia')
}

// Scroll utils
function scrollTo(id: string) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

// Blog Carousel Logic
const { data: posts } = await useAsyncData('home-published-posts', () => getAllPublishedPosts())
const carouselRef = ref<HTMLElement | null>(null)

function scrollPrev() {
  if (carouselRef.value) {
    carouselRef.value.scrollBy({ left: -380, behavior: 'smooth' })
  }
}

function scrollNext() {
  if (carouselRef.value) {
    carouselRef.value.scrollBy({ left: 380, behavior: 'smooth' })
  }
}

onMounted(() => {
  cycleInterval = setInterval(cycleImages, 4000)
})

onUnmounted(() => {
  if (cycleInterval) clearInterval(cycleInterval)
})
</script>

<template>
  <div>
    <Nav @show-contact="openContactModal" />

    <!-- HERO -->
    <section class="hero">
      <div class="hero-left">
        <div class="eyebrow"><span class="eyebrow-dot"></span> India's content studio for every story</div>
        <h1 class="hero-h1">
          Content that <em>moves</em><br>people, across<br>every <span class="ruled">medium</span>
        </h1>
        <p class="hero-sub">
          Eon Echo is a full-spectrum content studio producing <strong>digital and print marketing</strong> across more
          than 10 industries. From long-form editorial to social-first campaigns, we make content that earns attention.
        </p>
        <div class="hero-btns">
          <button class="btn-dark" @click="scrollTo('services')">Explore our work</button>
          <button class="btn-line" @click="scrollTo('niches')">See our niches</button>
        </div>
        <div class="hero-stats">
          <div class="stat">
            <div class="stat-n">10+</div>
            <div class="stat-l">Industries served</div>
          </div>
          <div class="stat">
            <div class="stat-n">Print &amp; Digital</div>
            <div class="stat-l">Both mediums, one studio</div>
          </div>
          <div class="stat">
            <div class="stat-n">End-to-end</div>
            <div class="stat-l">Strategy to production</div>
          </div>
        </div>
      </div>

      <!-- 3D HERO RIGHT -->
      <div class="hero-right" @mousemove="onHeroMousemove" @mouseleave="onHeroMouseleave">
        <div class="hero-blob hb1"></div>
        <div class="hero-blob hb2"></div>
        <div class="hero-blob hb3"></div>

        <div class="scene-3d">
          <div class="cards-wrap" :style="{ transform: cardsWrapTransform, transition: cardsWrapTransition }">
            <!-- back placeholder card -->
            <div class="img-card card-back"></div>

            <!-- mid card: magazine / print -->
            <div class="img-card card-mid" :style="{ opacity: cardOpacity, transition: 'opacity 0.5s ease' }">
              <img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=520&q=80&auto=format&fit=crop"
                alt="Eon Echo Media print editorial magazine production India"
                onerror="this.parentElement.style.background='var(--rose-light)';this.style.display='none'" fetchpriority="high"/>
              <div class="card-label">Print editorial</div>
            </div>

            <!-- front card: lifestyle / digital content -->
            <div class="img-card card-front" :style="{ opacity: cardOpacity, transition: 'opacity 0.5s ease' }">
              <img src="https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=520&q=80&auto=format&fit=crop"
                alt="Eon Echo Media content studio workspace Mumbai"
                onerror="this.parentElement.style.background='var(--sky-light)';this.style.display='none'" fetchpriority="high"/>
              <div class="card-label">Digital content</div>
            </div>
          </div>

          <!-- floating chips -->
          <div class="float-chip chip1">
            <span class="chip-dot" style="background:var(--accent2)"></span>
            10+ niches covered
          </div>
          <div class="float-chip chip2">
            <span class="chip-dot" style="background:var(--accent)"></span>
            Print and digital
          </div>
          <div class="float-chip chip3">
            <span class="chip-dot" style="background:var(--lavender)"></span>
            End-to-end studio
          </div>
        </div>
      </div>
    </section>

    <!-- MARQUEE -->
    <div class="marquee-strip">
      <div class="marquee-inner">
        <span class="marquee-item"><span class="marquee-dot"></span>Blog writing</span>
        <span class="marquee-item"><span class="marquee-dot"></span>Magazine production</span>
        <span class="marquee-item"><span class="marquee-dot"></span>Social media content</span>
        <span class="marquee-item"><span class="marquee-dot"></span>Email marketing</span>
        <span class="marquee-item"><span class="marquee-dot"></span>Brand storytelling</span>
        <span class="marquee-item"><span class="marquee-dot"></span>Print advertising</span>
        <span class="marquee-item"><span class="marquee-dot"></span>Video scripts</span>
        <span class="marquee-item"><span class="marquee-dot"></span>SEO content</span>
        <span class="marquee-item"><span class="marquee-dot"></span>Whitepapers</span>
        <span class="marquee-item"><span class="marquee-dot"></span>Campaign strategy</span>
        <span class="marquee-item"><span class="marquee-dot"></span>Catalogue design</span>
        <span class="marquee-item"><span class="marquee-dot"></span>Newsletter production</span>
        <span class="marquee-item"><span class="marquee-dot"></span>Blog writing</span>
        <span class="marquee-item"><span class="marquee-dot"></span>Magazine production</span>
        <span class="marquee-item"><span class="marquee-dot"></span>Social media content</span>
        <span class="marquee-item"><span class="marquee-dot"></span>Email marketing</span>
        <span class="marquee-item"><span class="marquee-dot"></span>Brand storytelling</span>
        <span class="marquee-item"><span class="marquee-dot"></span>Print advertising</span>
        <span class="marquee-item"><span class="marquee-dot"></span>Video scripts</span>
        <span class="marquee-item"><span class="marquee-dot"></span>SEO content</span>
        <span class="marquee-item"><span class="marquee-dot"></span>Whitepapers</span>
        <span class="marquee-item"><span class="marquee-dot"></span>Campaign strategy</span>
        <span class="marquee-item"><span class="marquee-dot"></span>Catalogue design</span>
        <span class="marquee-item"><span class="marquee-dot"></span>Newsletter production</span>
      </div>
    </div>

    <!-- NICHES -->
    <section class="niches" id="niches">
      <div class="niches-top">
        <div class="niches-intro">
          <div class="sec-tag">Industries we cover</div>
          <h2 class="sec-h2">Deep expertise<br>across every <em>sector</em></h2>
        </div>
        <p class="niches-note">We don't generalise. Every niche gets a writer, strategist, and editor who lives and
          breathes that world.</p>
      </div>
      <div class="niche-grid">
        <div class="niche-tile" style="background:var(--sage-light)">
          <div class="niche-icon"><svg viewBox="0 0 24 24" fill="none" stroke="var(--accent2)" stroke-width="1.8">
              <path
                d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg></div>
          <div class="niche-name">Fashion &amp; Lifestyle</div>
          <div class="niche-sub">Editorial, trend reports, brand stories</div>
        </div>
        <div class="niche-tile" style="background:var(--sky-light)">
          <div class="niche-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#2A6B8A" stroke-width="1.8">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
            </svg></div>
          <div class="niche-name">Finance &amp; Fintech</div>
          <div class="niche-sub">Thought leadership, investor comms</div>
        </div>
        <div class="niche-tile" style="background:var(--rose-light)">
          <div class="niche-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#8A3A4A" stroke-width="1.8">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg></div>
          <div class="niche-name">Healthcare</div>
          <div class="niche-sub">Patient education, clinical brands</div>
        </div>
        <div class="niche-tile" style="background:var(--peach-light)">
          <div class="niche-icon"><svg viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.8">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg></div>
          <div class="niche-name">Real Estate</div>
          <div class="niche-sub">Property, architecture, development</div>
        </div>
        <div class="niche-tile" style="background:var(--lavender-light)">
          <div class="niche-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#5A3A8A" stroke-width="1.8">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg></div>
          <div class="niche-name">Technology &amp; SaaS</div>
          <div class="niche-sub">Product content, dev marketing</div>
        </div>
        <div class="niche-tile" style="background:var(--lemon-light)">
          <div class="niche-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#8A6A00" stroke-width="1.8">
              <path d="M18 8h1a4 4 0 010 8h-1" />
              <path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
              <line x1="6" y1="1" x2="6" y2="4" />
              <line x1="10" y1="1" x2="10" y2="4" />
              <line x1="14" y1="1" x2="14" y2="4" />
            </svg></div>
          <div class="niche-name">Food &amp; Hospitality</div>
          <div class="niche-sub">Menus, campaigns, restaurant PR</div>
        </div>
        <div class="niche-tile" style="background:var(--sage-light)">
          <div class="niche-icon"><svg viewBox="0 0 24 24" fill="none" stroke="var(--accent2)" stroke-width="1.8">
              <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
              <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
            </svg></div>
          <div class="niche-name">Education &amp; EdTech</div>
          <div class="niche-sub">Course content, institution branding</div>
        </div>
        <div class="niche-tile" style="background:var(--sky-light)">
          <div class="niche-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#2A6B8A" stroke-width="1.8">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
            </svg></div>
          <div class="niche-name">Travel &amp; Tourism</div>
          <div class="niche-sub">Destination guides, travel PR</div>
        </div>
        <div class="niche-tile" style="background:var(--rose-light)">
          <div class="niche-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#8A3A4A" stroke-width="1.8">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
            </svg></div>
          <div class="niche-name">D2C &amp; E-commerce</div>
          <div class="niche-sub">Product copy, conversion content</div>
        </div>

        <!-- Extra Niches (Rendered Reactively) -->
        <template v-if="isNichesExpanded">
          <div 
            v-for="n in extraNiches" 
            :key="n.name" 
            class="niche-tile"
            :style="{ background: n.bg }"
          >
            <div class="niche-icon">
              <svg viewBox="0 0 24 24" fill="none" :stroke="n.stroke" stroke-width="1.8">
                <path :d="n.iconPath" />
              </svg>
            </div>
            <div class="niche-name">{{ n.name }}</div>
            <div class="niche-sub">{{ n.sub }}</div>
          </div>
        </template>

        <div class="niche-more" @click="isNichesExpanded = !isNichesExpanded" style="cursor: pointer;">
          <div class="niche-more-num">{{ isNichesExpanded ? '−' : '+4' }}</div>
          <div class="niche-more-label">{{ isNichesExpanded ? 'show fewer' : 'more niches' }}</div>
        </div>
      </div>
    </section>

    <!-- SERVICES -->
    <section class="services" id="services">
      <div class="sec-tag">What we produce</div>
      <h2 class="sec-h2">Content for every<br><em>channel</em> and medium</h2>
      <div class="services-layout">
        <div class="services-sticky">
          <h3
            style="font-family:'Cormorant Garamond',serif;font-size:24px;font-weight:600;color:var(--ink);line-height:1.3">
            From a single article to an entire editorial universe.</h3>
          <p>We work as a natural extension of your team, handling strategy, writing, design, and distribution across
            digital and print.</p>
          <button class="btn-dark" style="margin-top:24px"
            @click="sendPrompt('I want to discuss a content project with Eon Echo Media')">Start a conversation</button>
        </div>
        <div class="svc-list">
          <div class="svc-row">
            <div class="svc-row-top"><span class="svc-row-title">Digital content marketing</span><span class="svc-pill"
                style="background:var(--sky-light);color:#2A6B8A">Digital</span></div>
            <div class="svc-row-desc">SEO-driven blogs, campaign copy, landing pages, email sequences, and social content
              built to drive measurable results across every digital touchpoint.</div>
            <div class="svc-types"><span class="svc-type">Blog and SEO</span><span class="svc-type">Email</span><span
                class="svc-type">Social</span><span class="svc-type">Ad copy</span><span class="svc-type">Landing
                pages</span></div>
          </div>
          <div class="svc-row">
            <div class="svc-row-top"><span class="svc-row-title">Print media and publishing</span><span class="svc-pill"
                style="background:var(--peach-light);color:var(--accent)">Print</span></div>
            <div class="svc-row-desc">End-to-end production of magazines, brand catalogues, annual reports, brochures, and
              direct mailers, from editorial strategy through to print-ready files.</div>
            <div class="svc-types"><span class="svc-type">Magazines</span><span class="svc-type">Catalogues</span><span
                class="svc-type">Brochures</span><span class="svc-type">Annual reports</span><span
                class="svc-type">Mailers</span></div>
          </div>
          <div class="svc-row">
            <div class="svc-row-top"><span class="svc-row-title">Brand storytelling</span><span class="svc-pill"
                style="background:var(--lavender-light);color:#5A3A8A">Strategy</span></div>
            <div class="svc-row-desc">We define your voice, narrative architecture, and content pillars, then build the
              content machine that tells your story consistently across every format.</div>
            <div class="svc-types"><span class="svc-type">Brand voice</span><span class="svc-type">Messaging</span><span
                class="svc-type">Content strategy</span><span class="svc-type">Tone guides</span></div>
          </div>
          <div class="svc-row">
            <div class="svc-row-top"><span class="svc-row-title">Long-form and editorial</span><span class="svc-pill"
                style="background:var(--sage-light);color:var(--accent2)">Editorial</span></div>
            <div class="svc-row-desc">Whitepapers, thought leadership pieces, case studies, research reports, and in-depth
              industry guides that establish your authority and earn trust.</div>
            <div class="svc-types"><span class="svc-type">Whitepapers</span><span class="svc-type">Case
                studies</span><span class="svc-type">Reports</span><span class="svc-type">Thought leadership</span></div>
          </div>
          <div class="svc-row">
            <div class="svc-row-top"><span class="svc-row-title">Video and multimedia scripts</span><span class="svc-pill"
                style="background:var(--lemon-light);color:#8A6A00">Multimedia</span></div>
            <div class="svc-row-desc">Scriptwriting for explainers, brand films, social video, podcasts, and
              documentary-style content, crafted to translate complex ideas into compelling watch-time.</div>
            <div class="svc-types"><span class="svc-type">Explainers</span><span class="svc-type">Brand films</span><span
                class="svc-type">Podcast scripts</span><span class="svc-type">Reels</span></div>
          </div>
        </div>
      </div>
    </section>

    <!-- CONTENT TYPES -->
    <section class="content-types" id="content-types">
      <div style="text-align:center;max-width:520px;margin:0 auto;">
        <div class="sec-tag" style="text-align:center">Every format, covered</div>
        <h2 class="sec-h2">One studio.<br>Every <em>content format.</em></h2>
      </div>
      <div class="ct-grid">
        <div class="ct-card">
          <div class="ct-icon">✍️</div>
          <div class="ct-name">Written content</div>
          <div class="ct-desc">Crafted with SEO, readability, and brand tone at the core.</div>
          <div class="ct-formats"><span class="ct-fmt" style="background:var(--sage-light)">Blogs</span><span
              class="ct-fmt" style="background:var(--sage-light)">Articles</span><span class="ct-fmt"
              style="background:var(--sage-light)">Newsletters</span><span class="ct-fmt"
              style="background:var(--sage-light)">Guides</span></div>
        </div>
        <div class="ct-card">
          <div class="ct-icon">🎨</div>
          <div class="ct-name">Visual and design</div>
          <div class="ct-desc">Print layouts, infographics, and visual editorial direction.</div>
          <div class="ct-formats"><span class="ct-fmt" style="background:var(--peach-light)">Magazines</span><span
              class="ct-fmt" style="background:var(--peach-light)">Infographics</span><span class="ct-fmt"
              style="background:var(--peach-light)">Print ads</span></div>
        </div>
        <div class="ct-card">
          <div class="ct-icon">📱</div>
          <div class="ct-name">Social and short-form</div>
          <div class="ct-desc">Platform-native content that earns engagement, not just impressions.</div>
          <div class="ct-formats"><span class="ct-fmt" style="background:var(--sky-light)">Reels scripts</span><span
              class="ct-fmt" style="background:var(--sky-light)">Threads</span><span class="ct-fmt"
              style="background:var(--sky-light)">Captions</span></div>
        </div>
        <div class="ct-card">
          <div class="ct-icon">🎙️</div>
          <div class="ct-name">Multimedia</div>
          <div class="ct-desc">Scripts and show notes for every audio and video format.</div>
          <div class="ct-formats"><span class="ct-fmt" style="background:var(--lavender-light)">Podcasts</span><span
              class="ct-fmt" style="background:var(--lavender-light)">Explainers</span><span class="ct-fmt"
              style="background:var(--lavender-light)">Brand films</span></div>
        </div>
        <div class="ct-card">
          <div class="ct-icon">📊</div>
          <div class="ct-name">Authority content</div>
          <div class="ct-desc">Research-backed content that positions your brand as the expert.</div>
          <div class="ct-formats"><span class="ct-fmt" style="background:var(--lemon-light)">Whitepapers</span><span
              class="ct-fmt" style="background:var(--lemon-light)">Case studies</span><span class="ct-fmt"
              style="background:var(--lemon-light)">Reports</span></div>
        </div>
        <div class="ct-card">
          <div class="ct-icon">📧</div>
          <div class="ct-name">Email and CRM</div>
          <div class="ct-desc">Sequences and campaigns built for open rates and conversions.</div>
          <div class="ct-formats"><span class="ct-fmt" style="background:var(--rose-light)">Drip campaigns</span><span
              class="ct-fmt" style="background:var(--rose-light)">Newsletters</span><span class="ct-fmt"
              style="background:var(--rose-light)">Nurture</span></div>
        </div>
        <div class="ct-card">
          <div class="ct-icon">🛍️</div>
          <div class="ct-name">Commerce content</div>
          <div class="ct-desc">Product descriptions, category pages, and conversion-led copy.</div>
          <div class="ct-formats"><span class="ct-fmt" style="background:var(--peach-light)">Product copy</span><span
              class="ct-fmt" style="background:var(--peach-light)">Landing pages</span><span class="ct-fmt"
              style="background:var(--peach-light)">Ad copy</span></div>
        </div>
        <div class="ct-card">
          <div class="ct-icon">🗞️</div>
          <div class="ct-name">PR and comms</div>
          <div class="ct-desc">Press releases, media pitches, and crisis communication drafts.</div>
          <div class="ct-formats"><span class="ct-fmt" style="background:var(--sky-light)">Press releases</span><span
              class="ct-fmt" style="background:var(--sky-light)">Media kits</span><span class="ct-fmt"
              style="background:var(--sky-light)">Pitches</span></div>
        </div>
      </div>
    </section>

    <!-- HOW WE WORK -->
    <section class="how" id="how">
      <div class="sec-tag">Our process</div>
      <h2 class="sec-h2">How we turn a brief<br>into <em>content that works</em></h2>
      <div class="how-grid">
        <div class="how-steps">
          <div class="how-step">
            <div class="step-n">01</div>
            <div class="step-body">
              <div class="step-t">Understand your world</div>
              <div class="step-d">A deep-dive into your brand, audience, competitors, and the story you need to tell. No
                templates, no shortcuts.</div>
            </div>
          </div>
          <div class="how-step">
            <div class="step-n">02</div>
            <div class="step-body">
              <div class="step-t">Build your content strategy</div>
              <div class="step-d">We map content pillars, formats, channels, and a publishing cadence that is ambitious
                but sustainable.</div>
            </div>
          </div>
          <div class="how-step">
            <div class="step-n">03</div>
            <div class="step-body">
              <div class="step-t">Create and produce</div>
              <div class="step-d">Your dedicated team of writers, editors, and designers produce content that is reviewed,
                refined, and ready.</div>
            </div>
          </div>
          <div class="how-step">
            <div class="step-n">04</div>
            <div class="step-body">
              <div class="step-t">Measure and evolve</div>
              <div class="step-d">We track what is working, report transparently, and continuously improve the content mix
                as your brand grows.</div>
            </div>
          </div>
        </div>
        <div class="how-right">
          <div class="how-quote">"The best content does not interrupt people. It is what they were looking for."</div>
          <div class="how-attr">The Eon Echo editorial philosophy</div>
          <div class="how-tags">
            <span class="how-tag" style="background:var(--sage-light);color:var(--accent2)">Human-written</span>
            <span class="how-tag" style="background:var(--sky-light);color:#2A6B8A">Research-backed</span>
            <span class="how-tag" style="background:var(--peach-light);color:var(--accent)">Brand-true</span>
            <span class="how-tag" style="background:var(--lavender-light);color:#5A3A8A">Strategy-led</span>
          </div>
        </div>
      </div>
    </section>

    <!-- WHY -->
    <section class="why" id="why">
      <div class="sec-tag">Why Eon Echo</div>
      <h2 class="sec-h2">The studio built for<br><em>modern media</em></h2>
      <div class="why-bento">
        <div class="wb wb-big">
          <div class="wb-h">The only studio covering <em>digital and print</em> with equal depth.</div>
          <div class="wb-p">Most agencies chose a side. We believe the best brands live in both worlds, and we are built
            to produce for both, from one studio, under one strategy.</div>
        </div>
        <div class="wb wb-right">
          <div class="wb-num" style="color:var(--lavender)">10+</div>
          <div class="wb-label">Industry verticals</div>
          <div class="wb-sub">Specialists in every niche, not generalists guessing.</div>
        </div>
        <div class="wb wb-sage">
          <div class="wb-num" style="color:var(--accent2)">End-to-end</div>
          <div class="wb-label">Strategy to production</div>
          <div class="wb-sub">Brief to published. We handle the full content lifecycle.</div>
        </div>
        <div class="wb wb-peach">
          <div class="wb-num" style="color:var(--accent)">India-first</div>
          <div class="wb-label">Built for Indian brands</div>
          <div class="wb-sub">Understanding Indian audiences, languages, and market nuances from day one.</div>
        </div>
        <div class="wb wb-lemon">
          <div class="wb-inner">
            <div>
              <div class="wb-num" style="color:var(--accent2)">Human</div>
              <div class="wb-label">Every word, written by people</div>
              <div class="wb-sub" style="max-width:280px">Real writers, real editors, real strategists. Content that
                sounds like your brand, not a template.</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- JOURNAL CAROUSEL SECTION -->
    <section v-if="posts && posts.length" class="py-20 md:py-28 bg-[#FAFAF7] border-t border-black/[0.04] overflow-hidden">
      <div class="max-w-6xl mx-auto px-6">
        <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div>
            <div class="text-[10px] font-bold uppercase tracking-widest text-[#D4622A] mb-3">Our Journal</div>
            <h2 class="font-playfair text-3xl md:text-5xl font-bold tracking-tight text-[#1C1C1E]">
              The <span class="italic text-[#D4622A]">Echo</span> Chronicles
            </h2>
            <p class="text-xs md:text-sm text-[#3A3A3C] mt-2 max-w-[400px]">
              Latest insights, industry updates, and field reports from our content strategy editors.
            </p>
          </div>
          <!-- Scroll controls -->
          <div class="flex gap-2">
            <button @click="scrollPrev" class="w-10 h-10 rounded-full border border-black/[0.08] bg-white flex items-center justify-center text-ink hover:border-[#D4622A] hover:text-[#D4622A] transition-all" aria-label="Previous posts">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="w-4 h-4">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button @click="scrollNext" class="w-10 h-10 rounded-full border border-black/[0.08] bg-white flex items-center justify-center text-ink hover:border-[#D4622A] hover:text-[#D4622A] transition-all" aria-label="Next posts">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="w-4 h-4">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Carousel Container -->
        <div ref="carouselRef" class="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-none pb-4 -mx-6 px-6">
          <div v-for="post in posts" :key="post.id" class="snap-start shrink-0 w-[280px] sm:w-[320px] md:w-[360px] h-full">
            <BlogCard :post="post" />
          </div>
        </div>
        
        <!-- Link to Journal -->
        <div class="text-center mt-12">
          <NuxtLink to="/blog" class="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#D4622A] hover:text-[#1C1C1E] transition-colors duration-300">
            View all editorial stories
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="w-4 h-4">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta" id="contact">
      <h2>Let us tell your<br><em>story together</em></h2>
      <p>Whether you need a single campaign or an entire content operation, Eon Echo is ready to build it with you.</p>
      <div class="cta-row">
        <button class="btn-dark" @click="sendPrompt('I want to work with Eon Echo Media — how do we start?')">Start a
          project</button>
        <button class="btn-line" @click="sendPrompt('What does working with Eon Echo Media look like?')">How we
          work</button>
        <button class="btn-dark instagram-btn" @click="connectInstagram('eonechomedia')"
          title="Follow us on Instagram">Follow on Instagram</button>
      </div>
    </section>

    <Footer />

    <!-- Toast Notifications -->
    <div class="fixed right-5 bottom-5 z-[9999] flex flex-col gap-2">
      <TransitionGroup 
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="transform translate-y-2 opacity-0"
        enter-to-class="transform translate-y-0 opacity-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="transform opacity-100"
        leave-to-class="transform opacity-0"
      >
        <div 
          v-for="toast in toasts" 
          :key="toast.id" 
          class="bg-black/90 text-white px-4 py-2.5 rounded-lg text-xs shadow-lg flex items-center gap-2"
        >
          {{ toast.message }}
        </div>
      </TransitionGroup>
    </div>

    <!-- Contact Modal -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div 
        v-if="isContactModalOpen" 
        @click.self="closeContactModal"
        class="fixed inset-0 bg-black/40 z-[10000] flex items-center justify-center p-4"
      >
        <Transition
          enter-active-class="transition duration-300 ease-out delay-75"
          enter-from-class="transform scale-95 opacity-0"
          enter-to-class="transform scale-100 opacity-100"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="transform scale-100 opacity-100"
          leave-to-class="transform scale-95 opacity-0"
        >
          <div class="bg-white text-ink w-full max-w-[500px] rounded-2xl p-6 shadow-2xl flex flex-col gap-6 relative">
            <div class="flex justify-between items-start">
              <div>
                <h3 class="font-cormorant text-2xl font-semibold text-ink">Get in touch</h3>
                <p class="text-xs text-muted mt-1 leading-relaxed">
                  Prefer Instagram? Tap the big button or email us directly.
                </p>
              </div>
              <button 
                @click="closeContactModal" 
                class="text-2xl text-muted hover:text-ink cursor-pointer focus:outline-none"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div class="flex flex-col gap-3">
              <button 
                @click="modalInsta"
                class="instagram-btn w-full border-none py-3.5 px-5 rounded-xl font-semibold cursor-pointer text-sm transition-transform hover:-translate-y-0.5 shadow-md"
              >
                Follow @eonechomedia on Instagram
              </button>

              <button 
                @click="modalEmail"
                class="bg-ink text-white w-full border-none py-3.5 px-5 rounded-xl font-semibold cursor-pointer text-sm hover:bg-accent transition-colors shadow-md"
              >
                Email us — start a project
              </button>

              <button 
                @click="modalViewContact"
                class="bg-transparent border border-black/10 hover:border-accent w-full py-3 px-5 rounded-xl text-xs text-muted hover:text-accent transition-colors cursor-pointer"
              >
                View contact section
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
.scrollbar-none {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
</style>

