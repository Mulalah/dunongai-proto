import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Logo from '../../components/ui/Logo';

export default function StudentLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('student@dunongai.ph');
  const [password, setPassword] = useState('dunong123');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const profile = await login(email, password);
      const hasDiagnostic = profile?.hasCompletedDiagnostic;
      navigate(hasDiagnostic ? '/student/library' : '/student/quiz');
    } catch (e2) {
      setErr(e2.message || 'Hindi tumugma ang email/password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* LEFT */}
      <div
        className="hidden md:flex w-2/5 flex-col justify-between p-12 text-white"
        style={{ background: 'linear-gradient(135deg, #0A1628 0%, #0D4A4A 100%)' }}
      >
        <div>
          <Logo variant="dark" className="h-10 w-auto" />
          <div className="mt-3 italic text-gold font-heading font-semibold">
            Basahin Natin Ito!
          </div>
        </div>
        <div>
          <div className="text-5xl font-heading font-extrabold text-gold leading-none">77%</div>
          <p className="mt-2 text-white/70 leading-relaxed text-sm max-w-xs">
            ng mga Pilipinong bata sa Grade 5 ay hindi pa nakakabasa ng angkop sa kanilang antas.
            Tulungan natin sila — mag-aral, basahin, lumakas.
          </p>
        </div>
        <div className="text-xs text-white/40">© DunongAI 2025 · ISS170</div>
      </div>

      {/* RIGHT */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md page-enter">
          <h1 className="font-heading font-extrabold text-navy text-3xl">Kamusta! 👋</h1>
          <p className="text-slate-500 mt-1.5">
            I-login ang iyong account para magsimula
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">👤</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="LRN o Email"
                className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 focus:border-teal focus:bg-white focus:outline-none transition"
              />
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔒</span>
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full h-12 pl-10 pr-12 rounded-xl border border-slate-200 bg-slate-50 focus:border-teal focus:bg-white focus:outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-teal"
              >
                {showPw ? 'Itago' : 'Ipakita'}
              </button>
            </div>

            {err && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {err}
              </div>
            )}

            <Button type="submit" size="lg" loading={loading} className="w-full">
              Pumasok na! →
            </Button>

            <div className="text-center text-xs text-slate-400 bg-slate-50 rounded-lg py-2 border border-slate-100">
              Para sa demo: <span className="font-mono">student@dunongai.ph / dunong123</span>
            </div>

            <div className="text-center text-sm text-slate-500">
              Wala pang account?{' '}
              <button
                type="button"
                onClick={() => navigate('/signup/student')}
                className="text-teal font-semibold hover:underline"
              >
                Gumawa ng account
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
