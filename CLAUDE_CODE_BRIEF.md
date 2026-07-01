# Blog System — Claude Code Implementation Brief

## Project Goal
Build a complete blog system on top of an existing plain HTML/CSS/JS GitHub Pages site.
- Firebase Firestore as the database (posts stored there)
- `admin.html` — password-protected writing UI (already built, include as-is)
- Astro as the static site generator — fetches posts from Firestore at build time
- Each blog post gets its own static HTML page with full SEO
- Deployed to GitHub Pages via GitHub Actions

---

## Current Repo State
```
my-repo/
├── index.html         ← existing homepage (do NOT touch)
├── style.css          ← existing styles (do NOT touch)
├── script.js          ← existing scripts (do NOT touch)
└── admin.html         ← blog writing UI (already built, keep as-is)
```

---

## Target Repo State After Implementation
```
my-repo/
├── index.html                        ← untouched
├── style.css                         ← untouched
├── script.js                         ← untouched
├── admin.html                        ← untouched
├── astro.config.mjs                  ← Astro config with sitemap
├── package.json
├── tsconfig.json
├── .env.example                      ← Firebase env vars template
├── .github/
│   └── workflows/
│       └── deploy.yml                ← Auto build + deploy to GitHub Pages
└── src/
    ├── lib/
    │   └── firebase.ts               ← Firestore fetch at build time
    ├── layouts/
    │   ├── BaseLayout.astro          ← HTML shell with SEO meta tags
    │   └── PostLayout.astro          ← Single post layout
    ├── components/
    │   ├── BlogCard.astro            ← Post card for listing page
    │   ├── Nav.astro                 ← Site navigation
    │   └── Footer.astro              ← Site footer
    └── pages/
        ├── blog/
        │   ├── index.astro           ← /blog — post listing page
        │   └── [slug].astro          ← /blog/[slug] — individual post page
        └── sitemap.xml.ts            ← Dynamic sitemap (if not using plugin)
```

---

## Firebase Setup

### Firestore Collection Structure
Collection name: `posts`

Each document has these fields:
```typescript
interface Post {
  title: string;          // "My First Blog Post"
  slug: string;           // "my-first-blog-post"  (used as URL)
  content: string;        // HTML string from rich text editor
  excerpt: string;        // Short description for SEO + card preview
  cover: string;          // Cover image URL (optional)
  tags: string[];         // ["tech", "webdev"]
  status: "draft" | "published";
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Environment Variables
Create `.env.example`:
```
PUBLIC_FIREBASE_API_KEY=
PUBLIC_FIREBASE_AUTH_DOMAIN=
PUBLIC_FIREBASE_PROJECT_ID=
PUBLIC_FIREBASE_STORAGE_BUCKET=
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
PUBLIC_FIREBASE_APP_ID=
```

User will copy this to `.env` and fill in their Firebase config values.

---

## File Implementation Details

### 1. `astro.config.mjs`
```js
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://YOUR_USERNAME.github.io',   // user must update this
  base: '/',
  integrations: [sitemap()],
  output: 'static',
});
```
Install: `npm install @astrojs/sitemap`

---

### 2. `src/lib/firebase.ts`
Fetches posts from Firestore at **build time** (not client-side).
```typescript
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, orderBy, doc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY,
  authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.PUBLIC_FIREBASE_APP_ID,
};

function getApp() {
  return getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
}

export async function getAllPublishedPosts() {
  const db = getFirestore(getApp());
  const q = query(
    collection(db, 'posts'),
    where('status', '==', 'published'),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({
    id: d.id,
    ...d.data(),
    createdAt: d.data().createdAt?.toDate?.()?.toISOString() ?? null,
    updatedAt: d.data().updatedAt?.toDate?.()?.toISOString() ?? null,
  }));
}

export async function getPostBySlug(slug: string) {
  const posts = await getAllPublishedPosts();
  return posts.find(p => p.slug === slug) ?? null;
}
```

---

### 3. `src/layouts/BaseLayout.astro`
Full SEO meta tags — every page gets these, values injected per post:
```astro
---
interface Props {
  title: string;
  description?: string;
  ogImage?: string;
  ogType?: string;
  canonicalURL?: string;
  publishedDate?: string;
  author?: string;
  tags?: string[];
}

const {
  title,
  description = 'A personal blog',
  ogImage = '/og-default.png',
  ogType = 'website',
  canonicalURL = Astro.url.href,
  publishedDate,
  author = 'Your Name',        // UPDATE THIS
  tags = [],
} = Astro.props;

const siteName = 'Your Blog Name';   // UPDATE THIS
const siteUrl  = 'https://YOUR_USERNAME.github.io';  // UPDATE THIS
const fullTitle = `${title} | ${siteName}`;
---
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <!-- Primary SEO -->
  <title>{fullTitle}</title>
  <meta name="description" content={description} />
  <meta name="author" content={author} />
  {tags.length > 0 && <meta name="keywords" content={tags.join(', ')} />}
  <link rel="canonical" href={canonicalURL} />

  <!-- Open Graph (Facebook, LinkedIn, WhatsApp previews) -->
  <meta property="og:type" content={ogType} />
  <meta property="og:title" content={fullTitle} />
  <meta property="og:description" content={description} />
  <meta property="og:image" content={ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`} />
  <meta property="og:url" content={canonicalURL} />
  <meta property="og:site_name" content={siteName} />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={fullTitle} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content={ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`} />

  <!-- JSON-LD Structured Data (Google Rich Results) -->
  {ogType === 'article' && publishedDate && (
    <script type="application/ld+json" set:html={JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": title,
      "description": description,
      "image": ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`,
      "author": { "@type": "Person", "name": author },
      "publisher": { "@type": "Person", "name": author },
      "datePublished": publishedDate,
      "url": canonicalURL,
      "keywords": tags.join(', '),
    })} />
  )}

  <!-- Fonts (update to match your existing site fonts) -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />

  <slot name="head" />
</head>
<body>
  <slot />
</body>
</html>
```

---

### 4. `src/pages/blog/[slug].astro`
**This is the key file** — generates one static HTML page per post:
```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import { getAllPublishedPosts } from '../../lib/firebase';

export async function getStaticPaths() {
  const posts = await getAllPublishedPosts();
  return posts.map(post => ({
    params: { slug: post.slug },
    props: { post },
  }));
}

const { post } = Astro.props;
const publishedDate = post.createdAt ? new Date(post.createdAt).toISOString() : undefined;
---

<BaseLayout
  title={post.title}
  description={post.excerpt || ''}
  ogImage={post.cover || '/og-default.png'}
  ogType="article"
  publishedDate={publishedDate}
  tags={post.tags || []}
>
  <nav><!-- your Nav component here --></nav>

  <main>
    <article>
      {post.cover && <img src={post.cover} alt={post.title} />}

      <header>
        {post.tags?.length > 0 && (
          <div class="tags">
            {post.tags.map(tag => <span class="tag">{tag}</span>)}
          </div>
        )}
        <h1>{post.title}</h1>
        <time datetime={publishedDate}>
          {post.createdAt
            ? new Date(post.createdAt).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
              })
            : ''}
        </time>
      </header>

      <!-- Render the HTML content from Firestore -->
      <div class="post-body" set:html={post.content} />
    </article>
  </main>

  <footer><!-- your Footer component here --></footer>
</BaseLayout>
```

---

### 5. `src/pages/blog/index.astro`
Blog listing page — shows all published posts as cards:
```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import BlogCard from '../../components/BlogCard.astro';
import { getAllPublishedPosts } from '../../lib/firebase';

const posts = await getAllPublishedPosts();
---

<BaseLayout title="Blog" description="All posts">
  <nav><!-- Nav component --></nav>

  <main>
    <header>
      <h1>Blog</h1>
      <p>Thoughts, ideas, and things I've learned.</p>
    </header>

    <div class="post-grid">
      {posts.map(post => <BlogCard post={post} />)}
    </div>
  </main>

  <footer><!-- Footer component --></footer>
</BaseLayout>
```

---

### 6. `src/components/BlogCard.astro`
Reusable post card for listing page:
```astro
---
interface Props {
  post: {
    slug: string;
    title: string;
    excerpt?: string;
    cover?: string;
    tags?: string[];
    createdAt?: string;
  };
}
const { post } = Astro.props;
const date = post.createdAt
  ? new Date(post.createdAt).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    })
  : '';
---

<a href={`/blog/${post.slug}`} class="blog-card">
  {post.cover && <img src={post.cover} alt={post.title} loading="lazy" />}
  <div class="card-body">
    {post.tags?.length > 0 && (
      <div class="tags">
        {post.tags.map(t => <span class="tag">{t}</span>)}
      </div>
    )}
    <h2>{post.title}</h2>
    {post.excerpt && <p>{post.excerpt}</p>}
    <span class="date">{date}</span>
  </div>
</a>
```

---

### 7. `.github/workflows/deploy.yml`
Auto-deploys to GitHub Pages on every push to main, AND on a nightly schedule so new posts published in Firebase appear automatically:
```yaml
name: Deploy Blog to GitHub Pages

on:
  push:
    branches: [main]
  schedule:
    - cron: '0 2 * * *'   # Nightly at 2am UTC — picks up newly published posts
  workflow_dispatch:        # Manual trigger from GitHub UI

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci

      - name: Build Astro site
        run: npm run build
        env:
          PUBLIC_FIREBASE_API_KEY: ${{ secrets.PUBLIC_FIREBASE_API_KEY }}
          PUBLIC_FIREBASE_AUTH_DOMAIN: ${{ secrets.PUBLIC_FIREBASE_AUTH_DOMAIN }}
          PUBLIC_FIREBASE_PROJECT_ID: ${{ secrets.PUBLIC_FIREBASE_PROJECT_ID }}
          PUBLIC_FIREBASE_STORAGE_BUCKET: ${{ secrets.PUBLIC_FIREBASE_STORAGE_BUCKET }}
          PUBLIC_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.PUBLIC_FIREBASE_MESSAGING_SENDER_ID }}
          PUBLIC_FIREBASE_APP_ID: ${{ secrets.PUBLIC_FIREBASE_APP_ID }}

      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/deploy-pages@v4
        id: deployment
```

---

### 8. Firestore Composite Index (REQUIRED)
In Firebase Console → Firestore → Indexes → Add index:
```
Collection: posts
Fields:
  - status    (Ascending)
  - createdAt (Descending)
Query scope: Collection
```
Without this index, the Firestore query will throw an error.

---

## GitHub Secrets to Add
Go to: GitHub Repo → Settings → Secrets and variables → Actions → New repository secret

Add each of these:
```
PUBLIC_FIREBASE_API_KEY
PUBLIC_FIREBASE_AUTH_DOMAIN
PUBLIC_FIREBASE_PROJECT_ID
PUBLIC_FIREBASE_STORAGE_BUCKET
PUBLIC_FIREBASE_MESSAGING_SENDER_ID
PUBLIC_FIREBASE_APP_ID
```

---

## npm Packages to Install
```bash
npm create astro@latest . -- --template minimal --install --no-git
npm install firebase
npm install @astrojs/sitemap
```

---

## SEO Checklist (all handled automatically by the code above)
- [x] Unique `<title>` per post (from Firestore `title` field)
- [x] `<meta name="description">` per post (from Firestore `excerpt` field)
- [x] Open Graph tags (`og:title`, `og:description`, `og:image`, `og:url`)
- [x] Twitter Card tags
- [x] JSON-LD `BlogPosting` schema (Google rich results)
- [x] `<link rel="canonical">` per post
- [x] `<meta name="keywords">` from tags array
- [x] Auto-generated `sitemap.xml` via `@astrojs/sitemap`
- [x] Static HTML (no JavaScript needed for Google to read content)
- [x] Human-readable slug URLs (`/blog/my-post-title`)
- [x] `<time datetime="...">` for semantic date markup

---

## Things Claude Code Must Do

1. Scaffold the Astro project inside the existing repo without touching `index.html`, `style.css`, `script.js`, or `admin.html`
2. Install all npm dependencies
3. Create every file listed in the Target Repo State above
4. Use the exact Firestore field names: `title`, `slug`, `content`, `excerpt`, `cover`, `tags`, `status`, `createdAt`, `updatedAt`
5. Design the blog listing and post pages to look clean and modern — dark theme preferred (dark bg, light text, gold/amber accent color) — matching the feel of the existing admin.html
6. Make `BlogCard.astro` and post pages fully responsive (mobile-first)
7. Add a `<Nav>` component that links back to the main `index.html` homepage AND to `/blog`
8. The `[slug].astro` page must use `set:html={post.content}` to render the HTML from Firestore (content comes from a rich text editor)
9. Add sensible CSS — either scoped in each `.astro` file or a global `src/styles/global.css` imported in `BaseLayout.astro`
10. Ensure `astro.config.mjs` has `output: 'static'` (not server or hybrid)
11. The `deploy.yml` must reference GitHub secrets (not hardcoded values) for all Firebase config
12. Create a `README.md` with setup steps: Firebase config, adding GitHub secrets, running locally, and how the nightly rebuild works

---

## Design Reference (for blog pages)

Color palette to use (matches admin.html):
```css
--bg:      #0e0e0e;
--surface: #181818;
--border:  #2a2a2a;
--accent:  #e8c97e;   /* gold */
--text:    #f0ede6;
--muted:   #888888;
```

Typography:
- Headings: `Playfair Display` serif (Google Fonts)
- Body: `DM Sans` sans-serif (Google Fonts)
- Code: `DM Mono` monospace (Google Fonts)

Post body content styles (apply to `.post-body` which renders raw HTML from Firestore):
```css
.post-body h1, .post-body h2, .post-body h3 { color: var(--accent); font-family: 'Playfair Display', serif; }
.post-body a { color: var(--accent); }
.post-body blockquote { border-left: 3px solid var(--accent); padding-left: 1rem; color: var(--muted); font-style: italic; }
.post-body code { background: var(--surface); padding: 2px 6px; border-radius: 4px; font-family: 'DM Mono', monospace; }
.post-body pre { background: var(--surface); padding: 1.2rem; border-radius: 8px; overflow-x: auto; border: 1px solid var(--border); }
```

---

## Local Dev Command
```bash
npm run dev
```
This starts Astro at `http://localhost:4321`. It will fetch live data from Firebase during development too.

---

## Notes for Claude Code
- Do NOT modify `index.html`, `style.css`, `script.js`, or `admin.html` — these are the existing site files
- All Astro pages go under `src/pages/` — Astro's file-based routing handles the URLs automatically
- Firebase is only used at **build time** (server-side in `getStaticPaths`) — no Firebase SDK is shipped to the browser for the blog pages (only `admin.html` uses Firebase client-side)
- The `admin.html` file already handles writing posts to Firestore — Claude Code does not need to touch it
- If the user has not yet set up Firebase, remind them to create a `.env` file from `.env.example` before running `npm run dev`
