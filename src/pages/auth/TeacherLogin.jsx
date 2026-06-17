import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';

export default function TeacherLogin() {
  const navigate = useNavigate();
  const { login, logout } = useAuth();
  const [email, setEmail] = useState('teacher@dunongai.ph');
  const [password, setPassword] = useState('dunong123');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const profile = await login(email, password);
      if (profile?.role !== 'teacher') {
        await logout();
        setErr('Hindi ito account ng guro. Mag-login sa "Mag-login bilang Estudyante".');
        return;
      }
      navigate('/teacher/dashboard');
    } catch (e2) {
      setErr(e2.message || 'Hindi tumugma ang email/password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 relative text-white overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0A1628 0%, #0D4A4A 100%)' }}
    >
      <div className="absolute inset-0 grid-lines opacity-50 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.16),transparent_60%)]" />

      <div className="relative z-10 w-full max-w-[480px] glass-card p-8 page-enter">
        <span className="inline-block px-3 py-1 rounded-full bg-gold/20 text-gold text-[11px] font-bold uppercase tracking-wide">
          Teacher Portal
        </span>
        <h1 className="mt-3 font-heading font-extrabold text-3xl">
          Magandang araw, Guro! 👩‍🏫
        </h1>
        <p className="mt-1.5 text-white/60 text-sm">
          I-monitor ang inyong klase at suportahan ang bawat estudyante.
        </p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <div>
            <label className="text-[11px] uppercase tracking-wide text-white/60 font-semibold">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="teacher-input mt-1 w-full h-12 px-4 rounded-xl bg-black/30 border border-white/20 text-white placeholder-white/40 focus:border-gold focus:bg-black/40 focus:outline-none transition"
            />
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-wide text-white/60 font-semibold">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="teacher-input mt-1 w-full h-12 px-4 rounded-xl bg-black/30 border border-white/20 text-white placeholder-white/40 focus:border-gold focus:bg-black/40 focus:outline-none transition"
            />
          </div>

          {err && (
            <div className="text-sm text-red-200 bg-red-500/20 border border-red-400/30 rounded-lg px-3 py-2">
              {err}
            </div>
          )}

          <Button type="submit" size="lg" variant="gold" loading={loading} className="w-full">
            Login →
          </Button>

          <div className="flex items-center justify-between text-xs">
            <a href="#" className="text-white/60 hover:text-white">
              Forgot password?
            </a>
            <span className="text-white/30">v0.1 · Demo</span>
          </div>

          <div className="text-center text-[11px] text-white/50 bg-white/5 border border-white/10 rounded-lg py-2 mt-2">
            Para sa demo: <span className="font-mono text-gold">teacher@dunongai.ph / dunong123</span>
          </div>

          <div className="text-center text-sm text-white/60">
            Wala pang account?{' '}
            <button
              type="button"
              onClick={() => navigate('/signup/teacher')}
              className="text-gold font-semibold hover:underline"
            >
              Gumawa ng account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
