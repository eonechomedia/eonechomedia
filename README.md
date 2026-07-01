# Eon Echo Media

This repository hosts the official website of Eon Echo Media, now integrated with a statically generated blog system powered by **Astro** and **Firebase Firestore**.

The main website sections are built with plain HTML, CSS, and JS, while the blog section is built with Astro and fetches content dynamically from Firestore at build time.

---

## Technical Stack
- **Static Site Generator:** Astro (Static Output mode)
- **Database:** Firebase Firestore
- **Deployment Platform:** GitHub Pages
- **Automation / CI:** GitHub Actions (Automatic push deployments + Nightly rebuilds)

---

## Directory Layout
The project maintains a dual structure to preserve the existing landing pages:
```
my-repo/
├── index.html                        ← Homepage (untouched in git)
├── styles.css                        ← Homepage styles (untouched in git)
├── script.js                         ← Homepage scripts (untouched in git)
├── admin.html                        ← Writing panel UI (if present, untouched in git)
├── eonechomedia.jpg                  ← Logo asset
├── astro.config.mjs                  ← Astro & sitemap config + auto file copier
├── package.json                      ← Build script and dependencies
├── tsconfig.json                     ← TypeScript configuration
├── .env.example                      ← Local environment variables template
├── .github/
│   └── workflows/
│       └── deploy.yml                ← CI/CD deploy pipeline
└── src/
    ├── lib/
    │   └── firebase.ts               ← Firestore fetch client (build time only)
    ├── layouts/
    │   ├── BaseLayout.astro          ← SEO & metadata HTML shell
    │   └── PostLayout.astro          ← Single post markup container
    ├── components/
    │   ├── Nav.astro                 ← Blog navigation (dark theme)
    │   ├── Footer.astro              ← Blog footer (dark theme)
    │   └── BlogCard.astro            ← Listing card for blog grid
    └── pages/
        └── blog/
            ├── index.astro           ← Listing page (/blog)
            └── [slug].astro          ← Individual post router (/blog/[slug])
```

---

## Firebase Firestore Setup

### 1. Database Structure
Create a collection named **`posts`** in your Cloud Firestore database. Each post document must follow this schema:

| Field | Type | Description |
|---|---|---|
| `title` | `string` | The title of the post (e.g. `"My First Post"`) |
| `slug` | `string` | URL-friendly slug (e.g. `"my-first-post"`) |
| `content` | `string` | Rich-text HTML content of the post |
| `excerpt` | `string` | Short summary for previews & meta description |
| `cover` | `string` | URL of the cover image (optional) |
| `tags` | `array of strings` | Categories/Tags (e.g. `["marketing", "seo"]`) |
| `status` | `string` | Must be `"published"` (or `"draft"` to hide) |
| `createdAt` | `timestamp` | Time of creation (used for sorting) |
| `updatedAt` | `timestamp` | Time of last modification |

### 2. Firestore Composite Index (CRITICAL)
To enable sorting posts by date, you **must** configure a composite index in the Firebase console.
Go to: **Firestore Database** ➔ **Indexes** ➔ **Composite** ➔ **Add Index**:
- **Collection ID:** `posts`
- **Fields to Index:**
  - `status` (Ascending)
  - `createdAt` (Descending)
- **Query Scope:** `Collection`

---

## Local Development

### 1. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your Firebase project configuration credentials:
```bash
cp .env.example .env
```

### 2. Run Locally
Install dependencies:
```bash
npm install
```

Start the Astro local development server:
```bash
npm run dev
```
Open [http://localhost:4321](http://localhost:4321) in your browser. Changes to posts in Firestore will be fetched dynamically on reload.

### 3. Build & Preview
To test a production-ready build locally:
```bash
npm run build
npm run preview
```
The build copies the plain HTML homepage (`index.html`) and assets from the root directory into `dist/` alongside the compiled blog pages.

---

## Production Deployment (GitHub Actions)

Deployments are fully automated using GitHub Actions. The workflow `.github/workflows/deploy.yml` takes care of compiling the Astro project and uploading it to GitHub Pages.

### 1. GitHub Repository Secrets
To allow GitHub Actions to query your Firestore database at build time, navigate to your repository on GitHub:
**Settings** ➔ **Secrets and variables** ➔ **Actions** ➔ **New repository secret**

Add the following secret keys matching your Firebase app:
- `PUBLIC_FIREBASE_API_KEY`
- `PUBLIC_FIREBASE_AUTH_DOMAIN`
- `PUBLIC_FIREBASE_PROJECT_ID`
- `PUBLIC_FIREBASE_STORAGE_BUCKET`
- `PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `PUBLIC_FIREBASE_APP_ID`

### 2. Triggering Deployments
The deployment pipeline runs automatically on:
- Any `push` to the `main` branch.
- **Nightly Schedule:** Runs automatically at **2:00 AM UTC** every day to pick up new posts published via Firestore (without needing code commits).
- **Manual Dispatch:** Can be triggered manually from the GitHub Actions tab by clicking "Run workflow".
