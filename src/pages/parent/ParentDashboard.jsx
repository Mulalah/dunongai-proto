import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../../components/ui/StatCard';
import BadgeCard from '../../components/student/BadgeCard';
import ScoreTrendChart from '../../components/teacher/ScoreTrendChart';
import { useAuth } from '../../context/AuthContext';
import { BADGES, LEVEL_NAMES } from '../../utils/levelUtils';
import {
  db,
  FIREBASE_ENABLED,
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where
} from '../../firebase';

// Demo snapshot mirrors seedData's demo-student-001 progress
const DEMO_PROGRESS = {
  currentLevel: 3,
  totalStars: 24,
  totalStoriesCompleted: 8,
  streakDays: 5,
  badges: [
    { badgeId: 'first-story' },
    { badgeId: 'streak-3' },
    { badgeId: 'level-3' }
  ]
};
const DEMO_SESSIONS = [
  { id: 'd1', storyTitle: 'Ang Taniman ni Lolo Pedro', score: 75, stars: 4 },
  { id: 'd2', storyTitle: 'The Lost Puppy', score: 68, stars: 3 },
  { id: 'd3', storyTitle: 'Si Inang at ang Bibingka', score: 80, stars: 4 },
  { id: 'd4', storyTitle: 'My Helpful Neighbor', score: 72, stars: 4 },
  { id: 'd5', storyTitle: 'Ang Lipad ng Saranggola', score: 85, stars: 5 },
  { id: 'd6', storyTitle: 'The River and the Fish', score: 70, stars: 3 }
];

export default function ParentDashboard() {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const childId = profile?.childId || 'demo-student-001';
  const childName = profile?.childName || 'Juan dela Cruz';

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      if (!FIREBASE_ENABLED) {
        if (!cancelled) {
          setProgress(DEMO_PROGRESS);
          setSessions(DEMO_SESSIONS);
          setLoading(false);
        }
        return;
      }
      try {
        const pSnap = await getDoc(doc(db, 'progress', childId));
        const sSnap = await getDocs(
          query(collection(db, 'sessions'), where('studentId', '==', childId))
        );
        const arr = sSnap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (b.completedAt?.seconds || 0) - (a.completedAt?.seconds || 0));
        if (!cancelled) {
          setProgress(pSnap.exists() ? pSnap.data() : DEMO_PROGRESS);
          setSessions(arr);
        }
      } catch {
        if (!cancelled) {
          setProgress(DEMO_PROGRESS);
          setSessions(DEMO_SESSIONS);
        }
      }
      if (!cancelled) setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [childId]);

  const p = progress || DEMO_PROGRESS;
  const unlockedIds = (p.badges || []).map((b) => b.badgeId);
  const recent = sessions.slice(0, 6);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div
        className="text-white px-8 py-6"
        style={{ background: 'linear-gradient(135deg, #0A1628 0%, #0D4A4A 100%)' }}
      >
        <div className="max-w-[1100px] mx-auto flex items-center justify-between">
          <div>
            <div className="font-heading font-extrabold text-2xl">DunongAI</div>
            <div className="text-white/60 text-sm mt-0.5">Dashboard ng Magulang</div>
          </div>
          <button
            onClick={async () => {
              await logout();
              navigate('/');
            }}
            className="text-sm text-white/70 hover:text-white border border-white/20 rounded-lg px-4 py-2 transition"
          >
            Mag-logout
          </button>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-8 py-8 page-enter">
        <h1 className="font-heading font-extrabold text-navy text-2xl">
          Pag-unlad ni {childName} 📚
        </h1>
        <p className="text-slate-500 mt-1">
          Kasalukuyang nasa {LEVEL_NAMES[p.currentLevel || 3]}
        </p>

        {/* Stat cards */}
        <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon="📖" label="Antas" value={p.currentLevel || 3} color="teal" loading={loading} />
          <StatCard icon="⭐" label="Bituin" value={p.totalStars ?? 0} color="gold" loading={loading} />
          <StatCard
            icon="📚"
            label="Kwentong Tapos"
            value={p.totalStoriesCompleted ?? sessions.length}
            color="navy"
            loading={loading}
          />
          <StatCard icon="🔥" label="Araw na Sunod" value={p.streakDays ?? 0} color="red" loading={loading} />
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Trend */}
          <div className="lg:col-span-3 bg-white rounded-2xl shadow-card p-6">
            <h3 className="font-heading font-bold text-navy text-lg mb-4">Takbo ng mga Score</h3>
            <ScoreTrendChart sessions={sessions} />
          </div>

          {/* Recent */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-card p-6">
            <h3 className="font-heading font-bold text-navy text-lg mb-4">Mga Kamakailang Aktibidad</h3>
            <div className="space-y-3">
              {recent.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100"
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal to-emerald-400 flex items-center justify-center text-white">
                    📖
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-heading font-semibold text-sm text-navy truncate">
                      {s.storyTitle}
                    </div>
                  </div>
                  <div className="text-sm font-heading font-bold text-teal">{s.score}%</div>
                  <div className="text-gold text-sm">{'★'.repeat(s.stars || 1)}</div>
                </div>
              ))}
              {!recent.length && !loading && (
                <div className="text-center text-sm text-slate-400 py-6">Walang aktibidad pa.</div>
              )}
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="mt-6 bg-white rounded-2xl shadow-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-heading font-bold text-navy text-lg">Mga Badge ni {childName} 🏆</h3>
            <span className="text-xs text-slate-500">
              {unlockedIds.length} ng {BADGES.length} na-unlock
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {BADGES.map((b) => (
              <BadgeCard key={b.badgeId} badge={b} locked={!unlockedIds.includes(b.badgeId)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
