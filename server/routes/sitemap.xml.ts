import { defineEventHandler } from 'h3'
import { initializeApp, getApps } from 'firebase/app'
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore'

function getDb() {
  const firebaseConfig = {
    apiKey: process.env.PUBLIC_FIREBASE_API_KEY || '',
    authDomain: process.env.PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.PUBLIC_FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.PUBLIC_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.PUBLIC_FIREBASE_APP_ID || ''
  };

  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) return null;
  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  return getFirestore(app);
}

export default defineEventHandler(async (event) => {
  interface PostEntry { slug: string; updatedAt?: string; createdAt?: string }
  let posts: PostEntry[] = [];

  try {
    const db = getDb();
    if (db) {
      // Only filter by status — no orderBy to avoid composite index requirement
      const q = query(collection(db, 'posts'), where('status', '==', 'published'));
      const snap = await getDocs(q);
      posts = snap.docs.map(doc => {
        const data = doc.data();
        return {
          slug: data.slug,
          updatedAt: data.updatedAt || data.createdAt,
          createdAt: data.createdAt
        };
      });
      // Sort by createdAt descending client-side
      posts.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
    }
  } catch (e) {
    console.error('Sitemap Firebase fetch error: ', e);
  }

  const today = new Date().toISOString().split('T')[0];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>https://eonechomedia.com/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://eonechomedia.com/blog</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>${posts.length ? '\n' + posts.map(post => {
    const lastmod = post.updatedAt ? post.updatedAt.split('T')[0] : today;
    return `  <url>
    <loc>https://eonechomedia.com/blog/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
  }).join('\n') : ''}
</urlset>`;

  event.node.res.setHeader('content-type', 'application/xml');
  return sitemap;
})
