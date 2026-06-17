import {
  db,
  FIREBASE_ENABLED,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  Timestamp
} from '../firebase';
import { SEED_STORIES } from './seedData';

// Teacher-published stories. On Firebase they live in the `stories` collection
// (with a `createdBy` field). Without Firebase they persist in localStorage so
// the feature still works in demo mode.
const CUSTOM_KEY = 'dunong_custom_stories';

function getCustomLocal() {
  try {
    return JSON.parse(localStorage.getItem(CUSTOM_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveCustomLocal(list) {
  localStorage.setItem(CUSTOM_KEY, JSON.stringify(list));
}

// Merge seed stories with anything in Firestore/localStorage (custom wins by id).
export async function getAllStories() {
  if (!FIREBASE_ENABLED) {
    return [...SEED_STORIES, ...getCustomLocal()];
  }
  try {
    const snap = await getDocs(collection(db, 'stories'));
    const map = new Map();
    SEED_STORIES.forEach((s) => map.set(s.id, s));
    snap.docs.forEach((d) => map.set(d.id, { id: d.id, ...d.data() }));
    return [...map.values()];
  } catch {
    return [...SEED_STORIES];
  }
}

export async function getStoryById(id) {
  if (!id) return null;
  if (!FIREBASE_ENABLED) {
    return SEED_STORIES.find((s) => s.id === id) || getCustomLocal().find((s) => s.id === id) || null;
  }
  try {
    const snap = await getDoc(doc(db, 'stories', id));
    if (snap.exists()) return { id: snap.id, ...snap.data() };
  } catch {}
  return SEED_STORIES.find((s) => s.id === id) || null;
}

// Create a teacher-authored story. Returns the new story object.
export async function createStory(teacherId, { title, level, language, text, author, emoji, tapWords }) {
  const id = `custom-${Date.now().toString(36)}`;
  const story = {
    id,
    title: title.trim(),
    level: Number(level) || 1,
    language: language || 'Filipino',
    text: text.trim(),
    author: author || 'Guro',
    emoji: emoji || '📖',
    gradient: 'from-teal-400 to-teal-600',
    tapWords: Array.isArray(tapWords) ? tapWords : [],
    createdBy: teacherId || null
  };
  if (!FIREBASE_ENABLED) {
    saveCustomLocal([...getCustomLocal(), story]);
    return story;
  }
  await setDoc(doc(db, 'stories', id), { ...story, createdAt: Timestamp.now() });
  return story;
}

// Delete a story — only allowed for custom stories created by this teacher.
// Seed stories (no `createdBy`) can never be deleted.
export async function deleteStory(story, teacherId) {
  if (!story?.createdBy || story.createdBy !== teacherId) {
    throw new Error('Mga sarili mong kwento lang ang puwedeng burahin.');
  }
  if (!FIREBASE_ENABLED) {
    saveCustomLocal(getCustomLocal().filter((s) => s.id !== story.id));
    return;
  }
  await deleteDoc(doc(db, 'stories', story.id));
}
