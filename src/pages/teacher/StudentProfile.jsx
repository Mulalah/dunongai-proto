import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import TopBar from '../../components/layout/TopBar';
import Badge from '../../components/ui/Badge';
import ScoreTrendChart from '../../components/teacher/ScoreTrendChart';
import AISummaryCard from '../../components/teacher/AISummaryCard';
import {
  db,
  FIREBASE_ENABLED,
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy
} from '../../firebase';
import { SEED_CLASS_STUDENTS } from '../../utils/seedData';

export default function StudentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);

      const buildFromSeed = (seed) => seed ? {
        uid: seed.id, displayName: seed.displayName, currentLevel: seed.level,
        lastScore: seed.lastScore, streakDays: seed.streak, status: seed.status,
        gradeLevel: 3,
        recentScores: [Math.max(20, seed.lastScore - 8), Math.max(20, seed.lastScore - 4), seed.lastScore]
      } : null;

      if (!FIREBASE_ENABLED) {
        const seed = SEED_CLASS_STUDENTS.find((s) => s.id === id);
        if (!cancelled) { setStudent(buildFromSeed(seed)); setLoading(false); }
        return;
      }

      try {
        const snap = await getDoc(doc(db, 'users', id));
        if (snap.exists()) {
          if (!cancelled) setStudent({ uid: snap.id, ...snap.data() });
        } else {
          const seed = SEED_CLASS_STUDENTS.find((s) => s.id === id);
          if (!cancelled) setStudent(buildFromSeed(seed));
        }
        const ssnap = await getDocs(
          query(collection(db, 'sessions'), where('studentId', '==', id))
        );
        const arr = ssnap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (a.completedAt?.seconds || 0) - (b.completedAt?.seconds || 0));
        if (!cancelled) setSessions(arr);
      } catch {}
      if (!cancelled) setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <PageWrapper role="teacher">
        <TopBar title="Loading…" />
        <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-card p-6 space-y-3">
            <div className="skeleton h-6 w-1/2" />
            <div className="skeleton h-3 w-1/3" />
            <div className="skeleton h-3 w-2/3" />
          </div>
          <div className="bg-white rounded-2xl shadow-card p-6 space-y-3">
            <div className="skeleton h-6 w-1/2" />
            <div className="skeleton h-32 w-full" />
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (!student) {
    return (
      <PageWrapper role="teacher">
        <TopBar title="Hindi nakita" />
        <div className="p-8">Walang estudyanteng tumutugma.</div>
      </PageWrapper>
    );
  }

  const initials = (student.displayName || '??')
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const flagged = student.status === 'flagged';
  const lastActiveDays = student.streakDays > 0 ? 1 : 14;

  const recommendations = flagged
    ? [
        'Mag-schedule ng one-on-one reading session ngayong linggo.',
        'Subukan munang Antas 2 stories para itaas ang confidence.',
        'I-pair sa peer reader para sa group sessions.'
      ]
    : student.lastScore >= 80
    ? [
        'Subukang i-advance sa susunod na antas (80%+ score).',
        'Bigyan ng challenge stories para sa higher-order inference.',
        'I-recognize sa class para sa motivation boost.'
      ]
    : [
        'Dagdag practice sa inference questions.',
        'Subukang mag-read aloud para sa fluency.',
        'Mag-focus sa vocabulary expansion sa Antas ' + (student.currentLevel || 3) + '.'
      ];

  return (
    <PageWrapper role="teacher">
      <TopBar
        title={
          <span className="flex items-center gap-2">
            <button
              onClick={() => navigate('/teacher/dashboard')}
              className="text-teal text-sm hover:underline mr-2"
            >
              ← Bumalik
            </button>
            {student.displayName}
          </span>
        }
        subtitle={`Grade ${student.gradeLevel || 3} · ${student.schoolName || 'Rizal Elementary School'}`}
      />

      <div className="p-8 grid grid-cols-1 lg:grid-cols-11 gap-6 page-enter">
        {/* Left */}
        <div className="lg:col-span-6 space-y-6">
          {/* Header card */}
          <div className="bg-white rounded-2xl shadow-card p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal to-emerald-400 flex items-center justify-center text-white text-lg font-heading font-extrabold">
                {initials}
              </div>
              <div className="flex-1">
                <div className="text-2xl font-heading font-extrabold text-navy">
                  {student.displayName}
                </div>
                <div className="text-sm text-slate-500">Grade {student.gradeLevel || 3}</div>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="level">Antas {student.currentLevel || 1}</Badge>
                  <span
                    className={`text-xs ${
                      lastActiveDays > 7 ? 'text-red-500' : 'text-slate-500'
                    }`}
                  >
                    Huling aktibo: {lastActiveDays > 7 ? '14+ na araw' : 'Kahapon'}
                  </span>
                  {flagged && <Badge variant="danger">⚠️ Needs Attention</Badge>}
                </div>
              </div>
            </div>
          </div>

          <AISummaryCard student={student} sessions={sessions} />

          {/* Recommendations */}
          <div className="bg-white rounded-2xl shadow-card p-6 border-l-4 border-teal">
            <h3 className="font-heading font-bold text-navy text-lg mb-3">Recommendations</h3>
            <ul className="space-y-2 text-sm text-slate-700">
              {recommendations.map((r, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-teal mt-0.5">▸</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl shadow-card p-6">
            <h3 className="font-heading font-bold text-navy text-lg">
              Comprehension Score Trend
            </h3>
            <p className="text-xs text-slate-500 mb-3">Huling 4 na linggo</p>
            <ScoreTrendChart sessions={sessions.length ? sessions : sampleTrend(student)} />
          </div>

          <div className="bg-white rounded-2xl shadow-card p-6">
            <h3 className="font-heading font-bold text-navy text-lg mb-3">Recent Sessions</h3>
            <div className="space-y-2">
              {(sessions.length ? sessions : sampleTrend(student))
                .slice(-5)
                .reverse()
                .map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100"
                  >
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal to-emerald-400 flex items-center justify-center text-white">
                      📖
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-heading font-semibold text-sm text-navy truncate">
                        {s.storyTitle || 'Reading Session'}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {s.completedAt?.toDate
                          ? s.completedAt.toDate().toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })
                          : '—'}
                      </div>
                    </div>
                    <div
                      className={`text-sm font-heading font-bold ${
                        s.score >= 75
                          ? 'text-emerald-600'
                          : s.score >= 50
                          ? 'text-amber-500'
                          : 'text-red-500'
                      }`}
                    >
                      {s.score}%
                    </div>
                    <div className="text-gold text-sm">{'★'.repeat(s.stars || 1)}</div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

function sampleTrend(student) {
  const now = new Date();
  const base = student.lastScore || 60;
  return [
    { storyTitle: 'Sample 1', score: Math.max(20, base - 12), stars: 2, completedAt: ts(now, 21) },
    { storyTitle: 'Sample 2', score: Math.max(20, base - 6), stars: 3, completedAt: ts(now, 14) },
    { storyTitle: 'Sample 3', score: Math.max(20, base - 2), stars: 3, completedAt: ts(now, 7) },
    { storyTitle: 'Sample 4', score: base, stars: 4, completedAt: ts(now, 0) }
  ];
}

function ts(now, daysAgo) {
  const d = new Date(now);
  d.setDate(d.getDate() - daysAgo);
  return { seconds: Math.floor(d.getTime() / 1000), toDate: () => d };
}
