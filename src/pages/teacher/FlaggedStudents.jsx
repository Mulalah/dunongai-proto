import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import TopBar from '../../components/layout/TopBar';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { db, FIREBASE_ENABLED, collection, getDocs, query, where } from '../../firebase';
import { SEED_CLASS_STUDENTS } from '../../utils/seedData';

export default function FlaggedStudents() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewed, setReviewed] = useState({});

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      if (!FIREBASE_ENABLED) {
        const fallback = SEED_CLASS_STUDENTS.filter((s) => s.status === 'flagged').map((s) => ({
          uid: s.id, displayName: s.displayName, currentLevel: s.level,
          lastScore: s.lastScore, streakDays: s.streak, status: s.status, gradeLevel: 3,
          recentScores: [Math.max(20, s.lastScore - 4), Math.max(20, s.lastScore - 2), s.lastScore]
        }));
        if (!cancelled) { setStudents(fallback); setLoading(false); }
        return;
      }
      try {
        const snap = await getDocs(
          query(
            collection(db, 'users'),
            where('teacherId', '==', profile?.uid || 'demo-teacher-001')
          )
        );
        const arr = snap.docs
          .map((d) => ({ uid: d.id, ...d.data() }))
          .filter((s) => s.status === 'flagged');
        const final = arr.length
          ? arr
          : SEED_CLASS_STUDENTS.filter((s) => s.status === 'flagged').map((s) => ({
              uid: s.id,
              displayName: s.displayName,
              currentLevel: s.level,
              lastScore: s.lastScore,
              streakDays: s.streak,
              status: s.status,
              gradeLevel: 3,
              recentScores: [
                Math.max(20, s.lastScore - 4),
                Math.max(20, s.lastScore - 2),
                s.lastScore
              ]
            }));
        if (!cancelled) setStudents(final);
      } catch {
        if (!cancelled)
          setStudents(
            SEED_CLASS_STUDENTS.filter((s) => s.status === 'flagged').map((s) => ({
              uid: s.id,
              displayName: s.displayName,
              currentLevel: s.level,
              lastScore: s.lastScore,
              streakDays: s.streak,
              status: s.status,
              gradeLevel: 3,
              recentScores: [
                Math.max(20, s.lastScore - 4),
                Math.max(20, s.lastScore - 2),
                s.lastScore
              ]
            }))
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [profile?.uid]);

  const count = students.length;

  return (
    <PageWrapper role="teacher">
      <TopBar
        title={
          <span className="flex items-center gap-2">
            ⚠️ Mga Nangangailangan ng Tulong
            {count > 0 && (
              <span className="inline-flex items-center justify-center min-w-[26px] h-[26px] px-2 rounded-full bg-red-500 text-white text-xs font-bold">
                {count}
              </span>
            )}
          </span>
        }
      />
      <div className="p-8 space-y-6 page-enter">
        {/* Alert banner */}
        <div className="rounded-2xl p-5 bg-gradient-to-r from-red-50 to-amber-50 border border-red-200 flex items-start gap-3">
          <div className="text-2xl">⚠️</div>
          <div>
            <div className="font-heading font-bold text-red-700">
              May {count} estudyante na walang pagbabago sa loob ng 14 na araw.
            </div>
            <div className="text-sm text-slate-600 mt-1">
              Subukan mong i-review ang kanilang profile at gumawa ng action plan ngayong linggo.
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-card p-5">
                <div className="skeleton h-6 w-1/3 mb-3" />
                <div className="skeleton h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {students.map((s) => {
              const initials = s.displayName
                .split(' ')
                .map((p) => p[0])
                .slice(0, 2)
                .join('')
                .toUpperCase();
              const recent = s.recentScores || [s.lastScore - 4, s.lastScore - 2, s.lastScore];
              return (
                <div
                  key={s.uid}
                  className="bg-white rounded-2xl shadow-card p-6 border-l-4 border-red-500 grid grid-cols-1 md:grid-cols-12 gap-4 items-center"
                >
                  <div className="md:col-span-3 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-500 to-pink-400 flex items-center justify-center text-white font-bold">
                      {initials}
                    </div>
                    <div>
                      <div className="font-heading font-bold text-navy">{s.displayName}</div>
                      <div className="text-xs text-slate-500">
                        Grade {s.gradeLevel || 3} · Antas {s.currentLevel}
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-5">
                    <div className="text-sm font-semibold text-amber-700">
                      Walang pagbabago sa 14 araw
                    </div>
                    <div className="text-xs text-slate-500 mb-2">
                      Score trend: {recent.join('% → ')}%{' '}
                      <span className="text-red-500">↓</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {recent.map((sc, i) => (
                        <div
                          key={i}
                          className="h-2 rounded-full bg-red-200"
                          style={{ width: 60 }}
                        >
                          <div
                            className="h-full rounded-full bg-red-500"
                            style={{ width: `${Math.min(100, sc)}%` }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <Badge variant="danger">Critical</Badge>
                  </div>

                  <div className="md:col-span-2 flex flex-col gap-2">
                    <Button
                      onClick={() => navigate(`/teacher/student/${s.uid}`)}
                      size="sm"
                    >
                      Tingnan ang Profile
                    </Button>
                    <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!reviewed[s.uid]}
                        onChange={() =>
                          setReviewed((r) => ({ ...r, [s.uid]: !r[s.uid] }))
                        }
                        className="accent-teal"
                      />
                      Mark as Reviewed ☑
                    </label>
                  </div>
                </div>
              );
            })}
            {students.length === 0 && (
              <div className="bg-white rounded-2xl shadow-card p-10 text-center text-slate-500">
                <div className="text-4xl mb-2">🎉</div>
                <div className="font-heading font-bold text-navy">
                  Walang flagged students sa ngayon!
                </div>
                <div className="text-sm">Nasa magandang track ang buong klase.</div>
              </div>
            )}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
