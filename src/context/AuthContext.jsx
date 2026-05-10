import { createContext, useContext, useEffect, useState } from 'react';
import {
  auth,
  db,
  FIREBASE_ENABLED,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  doc,
  getDoc
} from '../firebase';

const AuthContext = createContext(null);

const DEMO_PROFILES = {
  'student@dunongai.ph': {
    uid: 'demo-student-001',
    role: 'student',
    displayName: 'Juan dela Cruz',
    email: 'student@dunongai.ph',
    teacherId: 'demo-teacher-001',
    gradeLevel: 3,
    currentLevel: 3,
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
  }
};

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
      sessionStorage.setItem('dunong_demo_user', JSON.stringify(demo));
      setUser({ email, uid: demo.uid });
      setProfile(demo);
      return demo;
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
      throw new Error('Hindi tumugma ang email/password.');
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
      if (stored) sessionStorage.setItem('dunong_demo_user', JSON.stringify(next));
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
