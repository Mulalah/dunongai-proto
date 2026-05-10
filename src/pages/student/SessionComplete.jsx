import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Confetti from '../../components/Confetti';
import {
  formatTime,
  getStarsFromScore,
  shouldAdvance,
  shouldStepBack,
  LEVEL_NAMES
} from '../../utils/levelUtils';
import { useAuth } from '../../context/AuthContext';
import { db, FIREBASE_ENABLED, addDoc, collection, Timestamp } from '../../firebase';

function LevelBanner({ adjustment, currentLevel }) {
  if (adjustment === 'advance') {
    return (
      <div
        className="rounded-2xl p-6 text-white bg-gradient-to-r from-emerald-500 to-teal-500 shadow-glow-teal"
        style={{ animation: 'levelUp 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) both' }}
      >
        <div className="font-heading font-extrabold text-2xl">LEVEL UP! 🎉</div>
        <div className="mt-1 text-white/90">
          Papunta ka na sa {LEVEL_NAMES[Math.min(currentLevel + 1, 6)]}!
        </div>
      </div>
    );
  }
  if (adjustment === 'stepback') {
    return (
      <div className="rounded-2xl p-6 bg-gradient-to-r from-amber-50 to-orange-100 border border-amber-200">
        <div className="font-heading font-extrabold text-amber-700 text-xl">Mag-practice pa tayo 💪</div>
        <div className="mt-1 text-amber-800">
          Bumalik muna sa {LEVEL_NAMES[Math.max(currentLevel - 1, 1)]}. Kaya mo ito!
        </div>
      </div>
    );
  }
  return (
    <div className="rounded-2xl p-6 bg-gradient-to-r from-sky-50 to-blue-100 border border-sky-200">
      <div className="font-heading font-extrabold text-sky-700 text-xl">Magaling! ✨</div>
      <div className="mt-1 text-sky-800">
        Magpatuloy sa {LEVEL_NAMES[currentLevel]}. Patuloy na magpraktis at lalo ka pang gagaling.
      </div>
    </div>
  );
}

export default function SessionComplete() {
  const navigate = useNavigate();
  const { profile, updateProfile } = useAuth();
  const [results, setResults] = useState(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('session_results');
    if (!stored) {
      navigate('/student/library');
      return;
    }
    const data = JSON.parse(stored);
    setResults(data);
    setTimeout(() => setRevealed(true), 80);

    // Persist session (only when Firebase is configured)
    if (FIREBASE_ENABLED) {
      (async () => {
        try {
          await addDoc(collection(db, 'sessions'), {
            studentId: profile?.uid || 'demo-student-001',
            studentName: profile?.displayName || 'Juan dela Cruz',
            storyId: data.storyId,
            storyTitle: data.storyTitle,
            level: data.level,
            score: data.score,
            stars: getStarsFromScore(data.score),
            durationSec: data.durationSec || 0,
            completedAt: Timestamp.now()
          });
        } catch {}
      })();
    }
  }, [navigate, profile]);

  const score = results?.score ?? 0;
  const stars = getStarsFromScore(score);
  const adjustment = useMemo(() => {
    if (shouldAdvance(score)) return 'advance';
    if (shouldStepBack(score)) return 'stepback';
    return 'maintain';
  }, [score]);

  const currentLevel = profile?.currentLevel || 3;
  const newBadgeUnlocked = adjustment === 'advance';

  useEffect(() => {
    if (!results) return;
    if (adjustment === 'advance') {
      updateProfile({ currentLevel: Math.min(currentLevel + 1, 6) });
    } else if (adjustment === 'stepback') {
      updateProfile({ currentLevel: Math.max(currentLevel - 1, 1) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results, adjustment]);

  if (!results) return null;

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-white via-slate-50 to-white px-6 py-10 overflow-hidden">
      <Confetti count={36} />
      <div className="relative z-10 max-w-3xl mx-auto page-enter">
        <div className="text-center">
          <h1 className="font-heading font-extrabold text-navy text-4xl">Natapos mo na! 🎊</h1>
          <p className="text-slate-500 mt-1">{results.storyTitle}</p>
        </div>

        {/* Score card */}
        <div className="mt-8 bg-white rounded-2xl shadow-card p-8 text-center">
          <div className="text-xs uppercase tracking-wide text-teal font-bold">Comprehension</div>
          <div
            className="font-heading font-extrabold text-teal mt-2"
            style={{
              fontSize: 80,
              animation: revealed ? 'scoreReveal 1.4s cubic-bezier(0.22,1,0.36,1) both' : 'none'
            }}
          >
            {score}%
          </div>
          <div className="mt-4 flex items-center justify-center gap-1 text-2xl">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className={i < stars ? 'text-gold' : 'text-slate-200'}>★</span>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
            <div className="bg-slate-50 rounded-xl p-3">
              <div className="text-[11px] text-slate-500 uppercase">Tama</div>
              <div className="font-heading font-bold text-navy">
                {results.correct} ng {results.total}
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <div className="text-[11px] text-slate-500 uppercase">Bituin</div>
              <div className="font-heading font-bold text-gold">{stars} ⭐</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <div className="text-[11px] text-slate-500 uppercase">Tagal</div>
              <div className="font-heading font-bold text-navy">
                {formatTime(results.durationSec || 0)}
              </div>
            </div>
          </div>
        </div>

        {/* Level adjustment */}
        <div className="mt-6">
          <LevelBanner adjustment={adjustment} currentLevel={currentLevel} />
        </div>

        {/* Per-question feedback */}
        <div className="mt-6 bg-white rounded-2xl shadow-card p-6">
          <h3 className="font-heading font-bold text-navy mb-4">Feedback sa bawat tanong</h3>
          <div className="space-y-3">
            {results.results.map((r, i) => {
              const isCorrect = r.result === 'correct';
              return (
                <div
                  key={i}
                  className={`p-4 rounded-xl border ${
                    isCorrect
                      ? 'bg-emerald-50 border-emerald-100'
                      : 'bg-amber-50 border-amber-100'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${
                        isCorrect ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                    >
                      {isCorrect ? '✓' : '◯'}
                    </span>
                    <div className="flex-1">
                      <div className="font-heading font-semibold text-navy text-sm">
                        {r.question}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Sagot mo: <span className="font-semibold text-navy">{r.userAnswer || '—'}</span>
                      </div>
                      <div className="text-sm text-slate-700 mt-2">{r.feedback}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Badge unlock */}
        {newBadgeUnlocked && (
          <div
            className="mt-6 rounded-2xl p-6 bg-gradient-to-r from-amber-50 to-yellow-100 border-2 border-gold/40 shadow-glow-gold"
            style={{ animation: 'levelUp 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) both' }}
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold to-amber-500 flex items-center justify-center text-3xl shadow-glow-gold">
                🏆
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-gold font-bold">
                  Bagong Badge!
                </div>
                <div className="font-heading font-extrabold text-navy text-xl">
                  {LEVEL_NAMES[Math.min(currentLevel + 1, 6)]} Reader
                </div>
                <div className="text-sm text-slate-600">
                  Naabot mo ang susunod na antas. Patuloy mong galingan!
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="gold"
            size="lg"
            onClick={() => navigate('/student/progress')}
          >
            Tingnan ang Progreso →
          </Button>
          <Button variant="ghost" size="lg" onClick={() => navigate('/student/library')}>
            Bumalik sa Mga Kwento
          </Button>
        </div>
      </div>
    </div>
  );
}
