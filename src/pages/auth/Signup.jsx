import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Logo from '../../components/ui/Logo';
import Icon from '../../components/ui/Icon';
import { db, FIREBASE_ENABLED, collection, query, where, getDocs } from '../../firebase';
import { findSectionByCode } from '../../utils/sections';

const ROLE_CONFIG = {
  student: {
    title: 'Gumawa ng Account 🎒',
    subtitle: 'Magsimula ng iyong reading adventure!',
    loginPath: '/login/student',
    redirect: '/student/library'
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

// Password requirements, checked live as the user types.
const PW_RULES = [
  { test: (p) => p.length >= 8, label: 'Hindi bababa sa 8 karakter' },
  { test: (p) => /[A-Z]/.test(p), label: 'May malaking titik (A–Z)' },
  { test: (p) => /[a-z]/.test(p), label: 'May maliit na titik (a–z)' },
  { test: (p) => /[0-9]/.test(p), label: 'May numero (0–9)' },
  { test: (p) => /[^A-Za-z0-9]/.test(p), label: 'May espesyal na karakter (!@#$…)' }
];

export default function Signup() {
  const { role: rawRole } = useParams();
  const role = ROLE_CONFIG[rawRole] ? rawRole : 'student';
  const cfg = ROLE_CONFIG[role];
  const navigate = useNavigate();
  const { signup, updateProfile } = useAuth();

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
  const [done, setDone] = useState(null); // email address after a successful signup

  const passwordValid = PW_RULES.every((r) => r.test(form.password));

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  // Single-field query (email only) so no Firestore composite index is required;
  // the role is filtered in JS.
  async function findStudentByEmail(email) {
    const snap = await getDocs(
      query(collection(db, 'users'), where('email', '==', email.trim().toLowerCase()))
    );
    const match = snap.docs.find((d) => d.data().role === 'student');
    return match ? { uid: match.id, ...match.data() } : null;
  }

  // Base profile written at account creation. Linkage fields (the parent's
  // childId, the student's section) are applied afterwards via updateProfile,
  // because resolving them needs an authenticated read that only works once the
  // account exists.
  function buildBaseProfile() {
    if (role === 'student') {
      const level = Number(form.gradeLevel) || 1;
      return {
        role: 'student',
        displayName: form.displayName.trim(),
        schoolName: form.schoolName.trim(),
        gradeLevel: level,
        currentLevel: level,
        sectionId: null,
        sectionIds: [],
        teacherId: null,
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
    // parent — childId/childName are linked after signup
    return {
      role: 'parent',
      displayName: form.displayName.trim()
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErr('');
    if (!passwordValid) {
      setErr('Hindi pa naaabot ng password ang lahat ng kinakailangan sa ibaba.');
      return;
    }
    if (role === 'parent' && !FIREBASE_ENABLED) {
      setErr('Kailangan ng Firebase para i-link ang account ng anak. (Tingnan ang SETUP.md)');
      return;
    }
    setLoading(true);
    try {
      const email = form.email.trim().toLowerCase();
      // Create the account FIRST. Firestore rules require a signed-in user, so
      // any lookup must happen after this — querying earlier fails with
      // "Missing or insufficient permissions".
      await signup(email, form.password, buildBaseProfile());

      // Now authenticated: resolve and link the section (student) or child (parent).
      if (role === 'student' && form.sectionCode.trim()) {
        const section = await findSectionByCode(form.sectionCode);
        if (!section) {
          throw new Error(
            'Nagawa na ang iyong account, ngunit walang section para sa code na iyon. Maaari kang sumali mamaya mula sa iyong dashboard.'
          );
        }
        updateProfile({
          sectionId: section.id,
          sectionIds: [section.id],
          teacherId: section.teacherId || null
        });
      }
      if (role === 'parent') {
        const child = await findStudentByEmail(form.childEmail);
        if (!child) {
          throw new Error(
            'Nagawa na ang iyong account, ngunit walang nahanap na estudyante para sa email na iyon. Pakitiyak na rehistrado na ang anak.'
          );
        }
        updateProfile({ childId: child.uid, childName: child.displayName || 'Anak' });
      }
      setDone(email);
    } catch (e2) {
      setErr(e2.message || 'May problema sa pagrehistro.');
    } finally {
      setLoading(false);
    }
  }

  const inputCls =
    'w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:border-teal focus:ring-2 focus:ring-teal/20 focus:bg-white focus:outline-none transition';

  return (
    <div className="min-h-screen flex">
      {/* LEFT brand panel */}
      <div
        className="hidden md:flex w-2/5 flex-col justify-between p-12 text-white"
        style={{ background: 'linear-gradient(135deg, #0A1628 0%, #0D4A4A 100%)' }}
      >
        <div>
          <Logo variant="dark" className="h-10 w-auto" />
          <div className="mt-3 italic text-gold font-heading font-semibold">Basahin Natin Ito!</div>
        </div>
        <p className="text-white/70 leading-relaxed text-sm max-w-xs">
          Sumali sa libu-libong Pilipinong mag-aaral na natututong magbasa nang may saya at tiwala.
        </p>
        <div className="text-xs text-white/40">© DunongAI 2025 · ISS170</div>
      </div>

      {/* RIGHT form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        {done ? (
          <div className="w-full max-w-md text-center page-enter">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-teal/10 text-teal flex items-center justify-center">
              <Icon name="mail" size={30} />
            </div>
            <h1 className="font-heading font-extrabold text-navy text-3xl">Halos tapos na!</h1>
            <p className="text-slate-600 mt-3">
              Nagpadala kami ng verification link sa{' '}
              <span className="font-semibold text-navy">{done}</span>. Pakibuksan ito para
              kumpirmahin ang iyong account.
            </p>
            <Button size="lg" className="w-full mt-6" onClick={() => navigate(cfg.redirect)}>
              Magpatuloy →
            </Button>
            <p className="text-xs text-slate-400 mt-3">
              Hindi mo nakita? Tingnan ang iyong spam o junk folder.
            </p>
          </div>
        ) : (
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
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              placeholder="Password"
              className={inputCls}
              aria-invalid={form.password.length > 0 && !passwordValid}
            />

            {form.password.length > 0 && (
              <ul className="-mt-1 grid grid-cols-1 gap-1 text-xs">
                {PW_RULES.map((r) => {
                  const ok = r.test(form.password);
                  return (
                    <li
                      key={r.label}
                      className={`flex items-center gap-1.5 ${ok ? 'text-emerald-600' : 'text-slate-400'}`}
                    >
                      <Icon name={ok ? 'checkCircle' : 'circle'} size={14} strokeWidth={ok ? 2 : 1.75} />
                      {r.label}
                    </li>
                  );
                })}
              </ul>
            )}

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

            <Button
              type="submit"
              size="lg"
              loading={loading}
              disabled={!passwordValid}
              className="w-full"
            >
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
        )}
      </div>
    </div>
  );
}
