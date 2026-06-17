import { createContext, useContext, useEffect, useState } from 'react';
import {
  auth,
  db,
  FIREBASE_ENABLED,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  doc,
  getDoc,
  setDoc,
  updateDoc
} from '../firebase';

const AuthContext = createContext(null);

const DEMO_PROFILES = {
  'student@dunongai.ph': {
    uid: 'demo-student-001',
    role: 'student',
    displayName: 'Juan dela Cruz',
    email: 'student@dunongai.ph',
    teacherId: 'demo-teacher-001',
    sectionId: 'demo-section-rizal',
    gradeLevel: 3,
    currentLevel: 3,
    streakDays: 5,
    schoolName: 'Rizal Elementary School',
    hasCompletedDiagnostic: false
  },
  'teacher@dunongai.ph': {
    uid: 'demo-teacher-001',
    role: 'teacher',
    displayName: "Ma'am Ana Reyes",
    email: 'teacher@dunongai.ph',
    schoolName: 'Rizal Elementary School',
    className: 'Grade 3 - Rizal'
  },
  'parent@dunongai.ph': {
    uid: 'demo-parent-001',
    role: 'parent',
    displayName: 'Aling Rosa dela Cruz',
    email: 'parent@dunongai.ph',
    childId: 'demo-student-001',
    childName: 'Juan dela Cruz',
    schoolName: 'Rizal Elementary School'
  }
};

// Map Firebase auth error codes to warm Filipino messages
function friendlyAuthError(code) {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'May account na para sa email na ito. Subukang mag-login.';
    case 'auth/weak-password':
      return 'Masyadong maikli ang password — gumamit ng hindi bababa sa 6 na karakter.';
    case 'auth/invalid-email':
      return 'Hindi wasto ang email address.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Hindi tumugma ang email/password.';
    default:
      return 'May problema sa pag-access. Subukang muli.';
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to restore demo session from sessionStorage
    const stored = sessionStorage.getItem('dunong_demo_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser({ email: parsed.email, uid: parsed.uid });
        setProfile(parsed);
        setLoading(false);
        return;
      } catch {
        sessionStorage.removeItem('dunong_demo_user');
      }
    }

    if (!FIREBASE_ENABLED) {
      setLoading(false);
      return;
    }

    let unsub = () => {};
    try {
      unsub = onAuthStateChanged(auth, async (u) => {
        setUser(u);
        if (u) {
          try {
            const snap = await getDoc(doc(db, 'users', u.uid));
            if (snap.exists()) setProfile({ uid: u.uid, ...snap.data() });
            else setProfile(DEMO_PROFILES[u.email] || null);
          } catch {
            setProfile(DEMO_PROFILES[u.email] || null);
          }
        } else {
          setProfile(null);
        }
        setLoading(false);
      });
    } catch {
      setLoading(false);
    }
    return () => unsub();
  }, []);

  async function login(email, password) {
    // Demo accounts work without Firebase
    const demo = DEMO_PROFILES[email];
    if (demo && password === 'dunong123') {
      // Merge any locally-saved progress (e.g. completed diagnostic) so demo
      // accounts don't reset every login.
      let overrides = {};
      try {
        overrides = JSON.parse(localStorage.getItem(`dunong_demo_${demo.uid}`) || '{}');
      } catch {}
      const merged = { ...demo, ...overrides };
      sessionStorage.setItem('dunong_demo_user', JSON.stringify(merged));
      setUser({ email, uid: merged.uid });
      setProfile(merged);
      return merged;
    }
    // Try Firebase (only when configured)
    if (!FIREBASE_ENABLED) throw new Error('Hindi tumugma ang email/password.');
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      const snap = await getDoc(doc(db, 'users', res.user.uid));
      const p = snap.exists() ? { uid: res.user.uid, ...snap.data() } : null;
      setProfile(p);
      return p;
    } catch (e) {
      throw new Error(friendlyAuthError(e?.code));
    }
  }

  // Create a new account + Firestore profile. profileData carries role-specific fields.
  async function signup(email, password, profileData) {
    if (!FIREBASE_ENABLED) {
      throw new Error(
        'Kailangang ma-configure ang Firebase para makagawa ng bagong account. (Tingnan ang SETUP.md)'
      );
    }
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const uid = res.user.uid;
      const fullProfile = { uid, email, ...profileData };
      await setDoc(doc(db, 'users', uid), fullProfile);
      // Send a verification link (non-blocking — signup still succeeds if email fails)
      try {
        await sendEmailVerification(res.user);
      } catch {}
      setUser({ email, uid });
      setProfile(fullProfile);
      return fullProfile;
    } catch (e) {
      throw new Error(friendlyAuthError(e?.code));
    }
  }

  async function logout() {
    sessionStorage.removeItem('dunong_demo_user');
    sessionStorage.removeItem('dunong_session');
    try {
      await signOut(auth);
    } catch {}
    setUser(null);
    setProfile(null);
  }

  function updateProfile(patch) {
    setProfile((prev) => {
      const next = { ...prev, ...patch };
      const stored = sessionStorage.getItem('dunong_demo_user');
      if (stored) {
        // Demo session: persist to sessionStorage (current session) AND
        // localStorage (survives logout, so diagnostic isn't repeated).
        sessionStorage.setItem('dunong_demo_user', JSON.stringify(next));
        if (next.uid) localStorage.setItem(`dunong_demo_${next.uid}`, JSON.stringify(next));
      } else if (FIREBASE_ENABLED && next.uid) {
        // Real account: persist to Firestore (fire-and-forget)
        updateDoc(doc(db, 'users', next.uid), patch).catch(() => {});
      }
      return next;
    });
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role: profile?.role || null,
        loading,
        login,
        signup,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
