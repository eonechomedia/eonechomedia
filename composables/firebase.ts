import { initializeApp, getApps } from 'firebase/app'
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc 
} from 'firebase/firestore'
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth'
import { useRuntimeConfig } from '#imports'
import { ref } from 'vue'

export interface Post {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt?: string;
  cover?: string;
  tags?: string[];
  status: string;
  isFeatured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

let dbInstance: any = null;
let authInstance: any = null;

// Reactive error state - tracks Firestore connection errors for UI display
export const firestoreError = ref<string | null>(null);

function getDb() {
  if (dbInstance) return dbInstance;

  const runtimeConfig = useRuntimeConfig();
  const config = runtimeConfig.public;

  if (!config.firebaseApiKey || !config.firebaseProjectId) {
    firestoreError.value = 'Firebase credentials are missing. Check your .env file has all PUBLIC_FIREBASE_* values set.';
    console.warn(firestoreError.value);
    return null;
  }

  const firebaseConfig = {
    apiKey: config.firebaseApiKey,
    authDomain: config.firebaseAuthDomain || '',
    projectId: config.firebaseProjectId,
    storageBucket: config.firebaseStorageBucket || '',
    messagingSenderId: config.firebaseMessagingSenderId || '',
    appId: config.firebaseAppId || ''
  };

  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  dbInstance = getFirestore(app);
  return dbInstance;
}

export function getFbAuth() {
  if (authInstance) return authInstance;

  const runtimeConfig = useRuntimeConfig();
  const config = runtimeConfig.public;

  if (!config.firebaseApiKey || !config.firebaseProjectId) {
    console.warn('Firebase credentials are missing or incomplete. Auth is disabled.');
    return null;
  }

  const firebaseConfig = {
    apiKey: config.firebaseApiKey,
    authDomain: config.firebaseAuthDomain || '',
    projectId: config.firebaseProjectId,
    storageBucket: config.firebaseStorageBucket || '',
    messagingSenderId: config.firebaseMessagingSenderId || '',
    appId: config.firebaseAppId || ''
  };

  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  authInstance = getAuth(app);
  return authInstance;
}

// Fetch all published posts — sorted client-side to avoid Firestore composite index requirement
export async function getAllPublishedPosts(): Promise<Post[]> {
  try {
    const db = getDb();
    if (!db) return [];
    
    // Only filter by status — no orderBy to avoid composite index requirement
    const q = query(
      collection(db, 'posts'),
      where('status', '==', 'published')
    );
    const snap = await getDocs(q);
    firestoreError.value = null;

    const posts = snap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        slug: data.slug,
        title: data.title,
        content: data.content,
        excerpt: data.excerpt,
        cover: data.cover,
        tags: data.tags,
        status: data.status,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt
      } as Post;
    });

    // Sort client-side by createdAt descending
    return posts.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  } catch (e: any) {
    const msg = e?.message || String(e);
    if (msg.includes('PERMISSION_DENIED') || msg.includes('permission-denied')) {
      firestoreError.value = 'Firestore is not enabled for this Firebase project. Go to Firebase Console → Firestore Database → Create database.';
    } else {
      firestoreError.value = msg;
    }
    console.error('Firebase getAllPublishedPosts error: ', e);
    return [];
  }
}

// Fetch single published post by slug — client-side filter to avoid composite index
export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const db = getDb();
    if (!db) return null;

    // Fetch all by slug, filter status client-side
    const q = query(
      collection(db, 'posts'),
      where('slug', '==', slug)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;

    const docSnap = snap.docs[0];
    const data = docSnap.data();

    // Only return published posts for public blog
    if (data.status !== 'published') return null;

    return {
      id: docSnap.id,
      slug: data.slug,
      title: data.title,
      content: data.content,
      excerpt: data.excerpt,
      cover: data.cover,
      tags: data.tags,
      status: data.status,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt
    } as Post;
  } catch (e: any) {
    console.error(`Firebase getPostBySlug error for slug "${slug}": `, e);
    return null;
  }
}

// Fetch any post by Firestore document ID (includes drafts — for admin preview)
export async function getPostForPreview(id: string): Promise<Post | null> {
  try {
    const db = getDb();
    if (!db) return null;

    const docRef = doc(db, 'posts', id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    const data = docSnap.data();
    return {
      id: docSnap.id,
      slug: data.slug,
      title: data.title,
      content: data.content,
      excerpt: data.excerpt || '',
      cover: data.cover || '',
      tags: data.tags || [],
      status: data.status || 'draft',
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt
    } as Post;
  } catch (e) {
    console.error(`Firebase getPostForPreview error for ID ${id}: `, e);
    return null;
  }
}

// --- ADMIN API MODULES ---

// Login
export async function loginAdmin(email: string, pass: string) {
  const auth = getFbAuth();
  if (!auth) {
    throw new Error('Firebase configuration is missing on this server. Please add your credentials in the environment.');
  }
  return signInWithEmailAndPassword(auth, email, pass);
}

// Logout
export async function logoutAdmin() {
  const auth = getFbAuth();
  if (!auth) return;
  return signOut(auth);
}

// Auth state change listener
export function onAuthChange(callback: (user: any) => void) {
  const auth = getFbAuth();
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

// Fetch all posts (draft + published) for Admin dashboard — sorted client-side
export async function getAllPosts(): Promise<Post[]> {
  const db = getDb();
  if (!db) return [];

  try {
    const snap = await getDocs(collection(db, 'posts'));
    firestoreError.value = null;

    const posts = snap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        slug: data.slug,
        title: data.title,
        content: data.content,
        excerpt: data.excerpt || '',
        cover: data.cover || '',
        tags: data.tags || [],
        status: data.status || 'draft',
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt
      } as Post;
    });

    return posts.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  } catch (e: any) {
    const msg = e?.message || String(e);
    if (msg.includes('PERMISSION_DENIED') || msg.includes('permission-denied')) {
      firestoreError.value = 'PERMISSION_DENIED: Firestore is not enabled for this Firebase project. Visit the Firebase Console → Enable Cloud Firestore → Set security rules.';
    } else {
      firestoreError.value = msg;
    }
    console.error('Firebase getAllPosts error: ', e);
    return [];
  }
}

// Fetch a single post by ID (for editor — always by doc ID)
export async function getPostById(id: string): Promise<Post | null> {
  try {
    const db = getDb();
    if (!db) return null;

    const docRef = doc(db, 'posts', id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    const data = docSnap.data();
    return {
      id: docSnap.id,
      slug: data.slug,
      title: data.title,
      content: data.content,
      excerpt: data.excerpt || '',
      cover: data.cover || '',
      tags: data.tags || [],
      status: data.status || 'draft',
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt
    } as Post;
  } catch (e) {
    console.error(`Firebase getPostById error for ID ${id}: `, e);
    return null;
  }
}

// Create a new blog post
export async function createPost(postData: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const db = getDb();
  if (!db) {
    throw new Error('Firebase configuration is missing. Cannot write to database.');
  }
  const docRef = await addDoc(collection(db, 'posts'), {
    ...postData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  return docRef.id;
}

// Update existing blog post
export async function updatePost(id: string, postData: Partial<Omit<Post, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
  const db = getDb();
  if (!db) {
    throw new Error('Firebase configuration is missing. Cannot update database.');
  }
  const docRef = doc(db, 'posts', id);
  await updateDoc(docRef, {
    ...postData,
    updatedAt: new Date().toISOString()
  });
}

// Delete blog post
export async function deletePost(id: string): Promise<void> {
  const db = getDb();
  if (!db) {
    throw new Error('Firebase configuration is missing. Cannot delete from database.');
  }
  const docRef = doc(db, 'posts', id);
  await deleteDoc(docRef);
}
