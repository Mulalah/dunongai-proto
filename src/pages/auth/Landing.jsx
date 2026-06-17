import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Logo from '../../components/ui/Logo';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden text-white"
      style={{
        background: 'linear-gradient(135deg, #0A1628 0%, #0D4A4A 100%)'
      }}
    >
      {/* Animated grid */}
      <div className="absolute inset-0 grid-lines opacity-60 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(13,148,136,0.18),transparent_60%)]" />

      <div className="relative z-10 flex flex-col items-center text-center page-enter">
        <Logo variant="dark" className="h-20 md:h-24 w-auto" />
        <div
          className="mt-5 italic font-heading font-semibold text-gold"
          style={{ fontSize: 24 }}
        >
          Basahin Natin Ito!
        </div>
        <p className="mt-3 text-white/60 text-base max-w-md">
          An AI-Powered Reading Companion for Filipino Students
        </p>

        <div className="mt-10 flex flex-col gap-3 w-full max-w-[360px]">
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={() => navigate('/login/student')}
          >
            Mag-login bilang Estudyante
          </Button>
          <button
            onClick={() => navigate('/login/teacher')}
            className="w-full h-13 px-6 rounded-[10px] border-2 border-white/40 text-white font-heading font-semibold text-base hover:bg-white/5 hover:border-white/70 transition btn-press"
            style={{ height: 52 }}
          >
            Mag-login bilang Guro
          </button>

          <div className="mt-2 flex items-center justify-center gap-2 text-sm text-white/60">
            <span>Bago dito?</span>
            <button
              onClick={() => navigate('/signup/student')}
              className="text-gold font-semibold hover:underline"
            >
              Gumawa ng account
            </button>
          </div>
          <button
            onClick={() => navigate('/signup/parent')}
            className="text-xs text-white/50 hover:text-white/80 transition"
          >
            Magulang? Subaybayan ang anak →
          </button>
        </div>
      </div>

      {/* SDG badges */}
      <div className="absolute bottom-6 left-6 flex gap-2 z-10">
        {[
          { label: 'SDG 4', color: 'bg-rose-500/85' },
          { label: 'SDG 8', color: 'bg-purple-600/85' },
          { label: 'SDG 11', color: 'bg-amber-500/85' }
        ].map((s) => (
          <span
            key={s.label}
            className={`${s.color} px-3 py-1 rounded-full text-[11px] font-bold tracking-wide`}
          >
            {s.label}
          </span>
        ))}
      </div>
      <div className="absolute bottom-6 right-6 text-[11px] text-white/30 z-10">
        ISS170 · Technopreneurship
      </div>
    </div>
  );
}
