import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import { db, FIREBASE_ENABLED, collection, query, where, getDocs } from '../../firebase';
import { findSectionByCode } from '../../utils/sections';

const ROLE_CONFIG = {
  student: {
    title: 'Gumawa ng Account 🎒',
    subtitle: 'Magsimula ng iyong reading adventure!',
    loginPath: '/login/student',
    redirect: '/student/quiz'
  },
  teacher: {
    title: 'Account ng Guro 👩‍🏫',
    subtitle: 'I-monitor at suportahan ang inyong klase.',
    loginPath: '/login/teacher',
    redirect: '/teacher/dashboard'
  },
  parent: {
    title: 'Account ng Magulang 👨‍👩‍👧',
    subtitle: 'Subaybayan ang pag-unlad ng inyong anak.',
    loginPath: '/login/student',
    redirect: '/parent/dashboard'
  }
};

export default function Signup() {
  const { role: rawRole } = useParams();
  const role = ROLE_CONFIG[rawRole] ? rawRole : 'student';
  const cfg = ROLE_CONFIG[role];
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [form, setForm] = useState({
    displayName: '',
    email: '',
    password: '',
    schoolName: '',
    gradeLevel: 1,
    className: '',
    sectionCode: '',
    childEmail: ''
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function findStudentByEmail(email) {
    const snap = await getDocs(
      query(
        collection(db, 'users'),
        where('email', '==', email.trim().toLowerCase()),
        where('role', '==', 'student')
      )
    );
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { uid: d.id, ...d.data() };
  }

  function buildProfile(child, section) {
    if (role === 'student') {
      const level = Number(form.gradeLevel) || 1;
      return {
        role: 'student',
        displayName: form.displayName.trim(),
        schoolName: form.schoolName.trim(),
        gradeLevel: level,
        currentLevel: level,
        sectionId: section?.id || null,
        teacherId: section?.teacherId || null,
        hasCompletedDiagnostic: false
      };
    }
    if (role === 'teacher') {
      return {
        role: 'teacher',
        displayName: form.displayName.trim(),
        schoolName: form.schoolName.trim(),
        className: form.className.trim()
      };
    }
    // parent
    return {
      role: 'parent',
      displayName: form.displayName.trim(),
      childId: child.uid,
      childName: child.displayName || 'Anak'
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      let child = null;
      let section = null;
      if (role === 'parent') {
        if (!FIREBASE_ENABLED) {
          throw new Error('Kailangan ng Firebase para i-link ang account ng anak. (Tingnan ang SETUP.md)');
        }
        child = await findStudentByEmail(form.childEmail);
        if (!child) {
          throw new Error('Walang nahanap na estudyante para sa email na iyon. Pakitiyak na rehistrado na ang anak.');
        }
      }
      if (role === 'student' && form.sectionCode.trim()) {
        section = await findSectionByCode(form.sectionCode);
        if (!section) {
          throw new Error('Walang nahanap na section para sa code na iyon. Pakisuri sa iyong guro.');
        }
      }
      await signup(form.email.trim().toLowerCase(), form.password, buildProfile(child, section));
      navigate(cfg.redirect);
    } catch (e2) {
      setErr(e2.message || 'May problema sa pagrehistro.');
    } finally {
      setLoading(false);
    }
  }

  const inputCls =
    'w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:border-teal focus:bg-white focus:outline-none transition';

  return (
    <div className="min-h-screen flex">
      {/* LEFT brand panel */}
      <div
        className="hidden md:flex w-2/5 flex-col justify-between p-12 text-white"
        style={{ background: 'linear-gradient(135deg, #0A1628 0%, #0D4A4A 100%)' }}
      >
        <div>
          <div className="font-heading font-extrabold text-3xl">DunongAI</div>
          <div className="mt-2 h-1 w-10 rounded bg-gold" />
          <div className="mt-3 italic text-gold font-heading font-semibold">Basahin Natin Ito!</div>
        </div>
        <p className="text-white/70 leading-relaxed text-sm max-w-xs">
          Sumali sa libu-libong Pilipinong mag-aaral na natututong magbasa nang may saya at tiwala.
        </p>
        <div className="text-xs text-white/40">© DunongAI 2025 · ISS170</div>
      </div>

      {/* RIGHT form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md page-enter">
          <h1 className="font-heading font-extrabold text-navy text-3xl">{cfg.title}</h1>
          <p className="text-slate-500 mt-1.5">{cfg.subtitle}</p>

          {!FIREBASE_ENABLED && (
            <div className="mt-4 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
              Demo mode: kailangang ma-configure ang Firebase para gumana ang pag-sign up.
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-3.5">
            <input
              type="text"
              required
              value={form.displayName}
              onChange={(e) => set('displayName', e.target.value)}
              placeholder="Buong pangalan"
              className={inputCls}
            />
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder="Email"
              className={inputCls}
            />
            <input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              placeholder="Password (6+ na karakter)"
              className={inputCls}
            />

            {role === 'student' && (
              <>
                <select
                  value={form.gradeLevel}
                  onChange={(e) => set('gradeLevel', e.target.value)}
                  className={inputCls}
                >
                  {[1, 2, 3, 4, 5, 6].map((g) => (
                    <option key={g} value={g}>
                      Grade {g}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={form.schoolName}
                  onChange={(e) => set('schoolName', e.target.value)}
                  placeholder="Pangalan ng paaralan"
                  className={inputCls}
                />
                <input
                  type="text"
                  value={form.sectionCode}
                  onChange={(e) => set('sectionCode', e.target.value)}
                  placeholder="Section code (opsyonal)"
                  className={`${inputCls} uppercase placeholder:normal-case`}
                />
              </>
            )}

            {role === 'teacher' && (
              <>
                <input
                  type="text"
                  value={form.schoolName}
                  onChange={(e) => set('schoolName', e.target.value)}
                  placeholder="Pangalan ng paaralan"
                  className={inputCls}
                />
                <input
                  type="text"
                  value={form.className}
                  onChange={(e) => set('className', e.target.value)}
                  placeholder="Pangalan ng klase (hal. Grade 3 - Rizal)"
                  className={inputCls}
                />
              </>
            )}

            {role === 'parent' && (
              <input
                type="email"
                required
                value={form.childEmail}
                onChange={(e) => set('childEmail', e.target.value)}
                placeholder="Email ng anak na rehistrado"
                className={inputCls}
              />
            )}

            {err && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {err}
              </div>
            )}

            <Button type="submit" size="lg" loading={loading} className="w-full">
              Mag-sign up →
            </Button>

            <div className="text-center text-sm text-slate-500">
              May account na?{' '}
              <Link to={cfg.loginPath} className="text-teal font-semibold hover:underline">
                Mag-login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
