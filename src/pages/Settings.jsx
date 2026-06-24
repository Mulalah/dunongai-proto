import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PageWrapper from '../components/layout/PageWrapper';
import TopBar from '../components/layout/TopBar';
import Button from '../components/ui/Button';
import Logo from '../components/ui/Logo';
import Icon from '../components/ui/Icon';
import { auth, FIREBASE_ENABLED, updatePassword } from '../firebase';

export default function Settings() {
  const { profile, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const role = profile?.role;

  const [form, setForm] = useState({
    displayName: profile?.displayName || '',
    schoolName: profile?.schoolName || '',
    gradeLevel: profile?.gradeLevel || 1,
    className: profile?.className || ''
  });
  const [saved, setSaved] = useState(false);

  const [newPw, setNewPw] = useState('');
  const [pwMsg, setPwMsg] = useState(null); // { ok, text }
  const [pwBusy, setPwBusy] = useState(false);

  const inputCls =
    'w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:border-teal focus:ring-2 focus:ring-teal/20 focus:bg-white focus:outline-none transition';

  function saveProfile(e) {
    e.preventDefault();
    const patch = {
      displayName: form.displayName.trim(),
      schoolName: form.schoolName.trim()
    };
    if (role === 'student') patch.gradeLevel = Number(form.gradeLevel);
    if (role === 'teacher') patch.className = form.className.trim();
    updateProfile(patch);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  async function changePassword(e) {
    e.preventDefault();
    setPwMsg(null);
    if (!FIREBASE_ENABLED || !auth?.currentUser) {
      setPwMsg({ ok: false, text: 'Available lang ang pagpapalit ng password sa totoong account.' });
      return;
    }
    if (newPw.length < 8) {
      setPwMsg({ ok: false, text: 'Hindi bababa sa 8 karakter ang password.' });
      return;
    }
    setPwBusy(true);
    try {
      await updatePassword(auth.currentUser, newPw);
      setNewPw('');
      setPwMsg({ ok: true, text: 'Napalitan na ang password! ✓' });
    } catch (err) {
      const text =
        err?.code === 'auth/requires-recent-login'
          ? 'Mag-login muli bago palitan ang password (security).'
          : 'Hindi mapalitan ang password. Subukang muli.';
      setPwMsg({ ok: false, text });
    } finally {
      setPwBusy(false);
    }
  }

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  const content = (
    <div className="max-w-xl mx-auto p-4 sm:p-6 lg:p-8 page-enter space-y-6">
      {/* Profile */}
      <div className="bg-white border border-slate-200/70 rounded-2xl shadow-card p-6">
        <h2 className="font-heading font-bold text-navy text-lg">Profile</h2>
        <form onSubmit={saveProfile} className="mt-4 space-y-4">
          <div>
            <label className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Email</label>
            <input value={profile?.email || '—'} disabled className={`${inputCls} mt-1 opacity-60`} />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Pangalan</label>
            <input
              value={form.displayName}
              onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
              className={`${inputCls} mt-1`}
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Paaralan</label>
            <input
              value={form.schoolName}
              onChange={(e) => setForm((f) => ({ ...f, schoolName: e.target.value }))}
              className={`${inputCls} mt-1`}
            />
          </div>
          {role === 'student' && (
            <div>
              <label className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Grade Level</label>
              <select
                value={form.gradeLevel}
                onChange={(e) => setForm((f) => ({ ...f, gradeLevel: e.target.value }))}
                className={`${inputCls} mt-1`}
              >
                {[1, 2, 3, 4, 5, 6].map((g) => (
                  <option key={g} value={g}>
                    Grade {g}
                  </option>
                ))}
              </select>
            </div>
          )}
          {role === 'teacher' && (
            <div>
              <label className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Pangalan ng Klase</label>
              <input
                value={form.className}
                onChange={(e) => setForm((f) => ({ ...f, className: e.target.value }))}
                className={`${inputCls} mt-1`}
              />
            </div>
          )}
          <div className="flex items-center gap-3">
            <Button type="submit">I-save</Button>
            {saved && <span className="text-sm text-emerald-600 font-semibold">Na-save! ✓</span>}
          </div>
        </form>
      </div>

      {/* Password */}
      <div className="bg-white border border-slate-200/70 rounded-2xl shadow-card p-6">
        <h2 className="font-heading font-bold text-navy text-lg">Palitan ang Password</h2>
        <form onSubmit={changePassword} className="mt-4 space-y-3">
          <input
            type="password"
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
            placeholder="Bagong password (8+ na karakter)"
            className={inputCls}
          />
          <div className="flex items-center gap-3">
            <Button type="submit" variant="secondary" loading={pwBusy}>
              I-update
            </Button>
            {pwMsg && (
              <span className={`text-sm ${pwMsg.ok ? 'text-emerald-600' : 'text-red-600'}`}>
                {pwMsg.text}
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Logout */}
      <div className="bg-white border border-slate-200/70 rounded-2xl shadow-card p-6 flex items-center justify-between">
        <div>
          <div className="font-heading font-bold text-navy">Mag-logout</div>
          <div className="text-sm text-slate-500">Lalabas ka sa iyong account.</div>
        </div>
        <Button variant="danger" onClick={handleLogout}>
          Mag-logout
        </Button>
      </div>
    </div>
  );

  if (role === 'teacher') {
    return (
      <PageWrapper role="teacher">
        <TopBar title="Mga Setting ⚙️" />
        {content}
      </PageWrapper>
    );
  }
  if (role === 'student') {
    return (
      <PageWrapper role="student">
        <TopBar title="Mga Setting ⚙️" />
        {content}
      </PageWrapper>
    );
  }

  // Parent (or any other) — standalone layout with a back link.
  return (
    <div className="min-h-screen bg-[#f4f6f9]">
      <div
        className="on-dark text-white px-5 sm:px-8 py-6"
        style={{ background: 'linear-gradient(135deg, #0A1628 0%, #0D4A4A 100%)' }}
      >
        <div className="max-w-[1100px] mx-auto flex items-center justify-between">
          <Logo variant="dark" className="h-8 w-auto" />
          <button
            onClick={() => navigate('/parent/dashboard')}
            className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white border border-white/20 rounded-lg px-4 py-2 transition"
          >
            <Icon name="arrowLeft" size={16} /> Dashboard
          </button>
        </div>
      </div>
      {content}
    </div>
  );
}
