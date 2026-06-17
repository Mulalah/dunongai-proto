import {
  db,
  FIREBASE_ENABLED,
  collection,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  serverTimestamp
} from '../firebase';

// Sections let a teacher group students. Students join with a short code;
// teachers can own several sections and switch between them.

// Demo sections used when Firebase is not configured.
export const DEMO_SECTIONS = [
  { id: 'demo-section-rizal', name: 'Grade 3 - Rizal', code: 'RIZAL3', teacherId: 'demo-teacher-001' },
  { id: 'demo-section-bonifacio', name: 'Grade 3 - Bonifacio', code: 'BONI3', teacherId: 'demo-teacher-001' }
];

// Unambiguous alphabet (no 0/O/1/I) for easy reading aloud in class.
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateSectionCode(len = 6) {
  let out = '';
  for (let i = 0; i < len; i++) {
    out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return out;
}

export async function getSectionsForTeacher(teacherId) {
  if (!FIREBASE_ENABLED) return DEMO_SECTIONS;
  const snap = await getDocs(
    query(collection(db, 'sections'), where('teacherId', '==', teacherId))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function createSection(teacherId, name) {
  if (!FIREBASE_ENABLED) {
    return { id: `local-${Date.now()}`, name, code: generateSectionCode(), teacherId };
  }
  const code = generateSectionCode();
  const ref = await addDoc(collection(db, 'sections'), {
    teacherId,
    name,
    code,
    createdAt: serverTimestamp()
  });
  return { id: ref.id, teacherId, name, code };
}

export async function findSectionByCode(code) {
  const normalized = (code || '').trim().toUpperCase();
  if (!normalized) return null;
  if (!FIREBASE_ENABLED) {
    return DEMO_SECTIONS.find((s) => s.code === normalized) || null;
  }
  const snap = await getDocs(
    query(collection(db, 'sections'), where('code', '==', normalized))
  );
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() };
}

export async function getSectionById(sectionId) {
  if (!sectionId) return null;
  if (!FIREBASE_ENABLED) {
    const base = DEMO_SECTIONS.find((s) => s.id === sectionId) || { id: sectionId };
    const stored = localStorage.getItem(`dunong_section_stories_${sectionId}`);
    return { ...base, storyIds: stored ? JSON.parse(stored) : undefined };
  }
  const snap = await getDoc(doc(db, 'sections', sectionId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// Set which stories are available to a section.
// storyIds === undefined/null means "all stories" (no restriction yet).
export async function setSectionStories(sectionId, storyIds) {
  if (!FIREBASE_ENABLED) {
    localStorage.setItem(`dunong_section_stories_${sectionId}`, JSON.stringify(storyIds));
    return;
  }
  await updateDoc(doc(db, 'sections', sectionId), { storyIds });
}

// Attach an existing student to a section (sets sectionId + derived teacherId).
export async function joinSection(studentUid, code) {
  const section = await findSectionByCode(code);
  if (!section) {
    throw new Error('Walang nahanap na section para sa code na iyon. Pakisuri sa iyong guro.');
  }
  if (FIREBASE_ENABLED && studentUid) {
    await updateDoc(doc(db, 'users', studentUid), {
      sectionId: section.id,
      teacherId: section.teacherId
    });
  }
  return section;
}
