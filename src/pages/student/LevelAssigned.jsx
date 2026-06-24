import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Confetti from '../../components/Confetti';
import { LEVEL_NAMES } from '../../utils/levelUtils';

export default function LevelAssigned() {
  const navigate = useNavigate();
  const stored = sessionStorage.getItem('diagnostic_result');
  const result = stored ? JSON.parse(stored) : { level: 3, rationale: 'Demo mode' };
  const level = result.level || 3;

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-white px-6 overflow-hidden">
      <Confetti count={30} />
      <div className="relative z-10 text-center max-w-xl page-enter">
        <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-teal to-teal-600 flex items-center justify-center text-5xl shadow-glow-teal animate-bounce">
          🤖
        </div>

        <div
          className="mt-8 mx-auto w-32 h-32 rounded-full bg-gradient-to-br from-gold to-amber-500 flex items-center justify-center shadow-glow-gold"
          style={{ animation: 'levelUp 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) both' }}
        >
          <div className="text-center">
            <div className="text-[10px] uppercase tracking-wider text-navy/60 font-bold">
              Pagbasa
            </div>
            <div className="font-heading font-extrabold text-5xl text-navy leading-none">
              {level}
            </div>
          </div>
        </div>

        <h1
          className="mt-6 font-heading font-extrabold text-navy"
          style={{ fontSize: 36, lineHeight: 1.1 }}
        >
          Ikaw ay nasa {LEVEL_NAMES[level]}! 🎉
        </h1>
        <div className="mt-2 text-teal font-heading font-semibold">
          Antas sa Pagbasa {level} · Napakagaling!
        </div>
        <p className="mt-4 text-slate-600 max-w-md mx-auto leading-relaxed">
          Magsimula na tayong magbasa ng mga kwento para sa iyong antas sa pagbasa. Aalisin natin ang
          paghihirap at gagawin nating masaya ang pagbabasa.
        </p>

        <div className="mt-8">
          <Button
            variant="gold"
            size="lg"
            onClick={() => navigate('/student/library')}
          >
            Simulan na natin! →
          </Button>
        </div>
      </div>
    </div>
  );
}
