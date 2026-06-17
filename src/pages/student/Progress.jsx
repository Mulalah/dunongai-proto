import { useEffect, useState } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import TopBar from '../../components/layout/TopBar';
import BadgeCard from '../../components/student/BadgeCard';
import LeaderboardRow from '../../components/student/LeaderboardRow';
import { useAuth } from '../../context/AuthContext';
import { BADGES, LEVEL_NAMES } from '../../utils/levelUtils';
import { db, FIREBASE_ENABLED, collection, getDocs, query, where, orderBy, limit } from '../../firebase';
import { SEED_CLASS_STUDENTS } from '../../utils/seedData';

export default function Progress() {
  const { profile } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [unlockedIds, setUnlockedIds] = useState(['first-story', 'streak-3', 'level-3']);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!FIREBASE_ENABLED) {
        // Use seed leaderboard in demo mode
        const list = SEED_CLASS_STUDENTS.map((s) => ({
          uid: s.id,
          name: s.displayName,
          stars: Math.round(s.lastScore / 4) + s.streak
        }));
        list.push({ uid: 'demo-student-001', name: 'Juan dela Cruz', stars: 24 });
        list.sort((a, b) => b.stars - a.stars);
        if (!cancelled) setLeaderboard(list.slice(0, 5));
        return;
      }

      try {
        const sSnap = await getDocs(
          query(
            collection(db, 'sessions'),
            where('studentId', '==', profile?.uid || 'demo-student-001')
          )
        );
        const arr = sSnap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (b.completedAt?.seconds || 0) - (a.completedAt?.seconds || 0));
        if (!cancelled) setSessions(arr);
      } catch {
        if (!cancelled) setSessions([]);
      }

      // Leaderboard scoped to the student's own section (no cross-section overlap).
      // Falls back to the whole class only if the student has no section yet.
      try {
        const scope = profile?.sectionId
          ? where('sectionId', '==', profile.sectionId)
          : where('teacherId', '==', profile?.teacherId || 'demo-teacher-001');
        const tSnap = await getDocs(query(collection(db, 'users'), scope));
        const all = tSnap.docs.map((d) => ({ uid: d.id, ...d.data() }));
        // Add current student
        all.push({
          uid: profile?.uid || 'demo-student-001',
          displayName: profile?.displayName || 'Juan dela Cruz',
          stars: 24
        });
        // Use seed if empty
        const list = all.length
          ? all.map((s) => ({
              uid: s.uid,
              name: s.displayName,
              stars:
                s.uid === (profile?.uid || 'demo-student-001')
                  ? 24
                  : Math.round((s.lastScore || 60) / 4) + (s.streakDays || 0)
            }))
          : SEED_CLASS_STUDENTS.map((s) => ({
              uid: s.id,
              name: s.displayName,
              stars: Math.round(s.lastScore / 4) + s.streak
            }));

        list.sort((a, b) => b.stars - a.stars);
        if (!cancelled) setLeaderboard(list.slice(0, 5));
      } catch {
        const list = SEED_CLASS_STUDENTS.map((s) => ({
          uid: s.id,
          name: s.displayName,
          stars: Math.round(s.lastScore / 4) + s.streak
        }));
        list.sort((a, b) => b.stars - a.stars);
        if (!cancelled) setLeaderboard(list.slice(0, 5));
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [profile]);

  const level = profile?.currentLevel || 3;
  const initials = (profile?.displayName || 'JC')
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <PageWrapper role="student">
      <TopBar title="Ang Aking Progreso ⭐" />
      <div className="p-8 page-enter">
        {/* Hero */}
        <div
          className="rounded-3xl p-7 text-white relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #0A1628 0%, #096B65 100%)'
          }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(245,158,11,0.18),transparent_60%)]" />
          <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal to-emerald-300 flex items-center justify-center text-3xl font-heading font-extrabold shadow-lg">
              {initials}
            </div>
            <div className="flex-1">
              <div className="text-2xl font-heading font-extrabold">
                {profile?.displayName || 'Juan dela Cruz'}
              </div>
              <div className="text-white/60 text-sm">
                {profile?.schoolName || 'Rizal Elementary School'}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-sm">
                  🔥 5 Araw
                </span>
                <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-sm">
                  ⭐ 24 Bituin
                </span>
                <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-sm">
                  📖 {sessions.length || 8} Kwento
                </span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="inline-flex flex-col items-center px-4 py-3 rounded-2xl bg-gradient-to-br from-gold to-amber-500 text-navy shadow-glow-gold">
                <div className="text-[10px] uppercase tracking-wide font-bold">Antas</div>
                <div className="text-3xl font-heading font-extrabold leading-none">{level}</div>
              </div>
              <div className="mt-2 text-xs text-white/60">
                3 sessions papunta sa {LEVEL_NAMES[Math.min(level + 1, 6)]}
              </div>
              <div className="mt-2 w-44 h-1.5 rounded-full bg-white/10 overflow-hidden ml-auto">
                <div className="h-full rounded-full bg-gradient-to-r from-teal to-emerald-300 w-3/5" />
              </div>
            </div>
          </div>
        </div>

        {/* Two columns */}
        <div className="mt-7 grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left */}
          <div className="lg:col-span-3 space-y-6">
            {/* Badges */}
            <div className="bg-white rounded-2xl shadow-card p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-heading font-bold text-navy text-lg">Mga Badge Ko 🏆</h3>
                <span className="text-xs text-slate-500">
                  {unlockedIds.length} ng {BADGES.length} unlocked
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {BADGES.map((b) => (
                  <BadgeCard
                    key={b.badgeId}
                    badge={b}
                    locked={!unlockedIds.includes(b.badgeId)}
                  />
                ))}
              </div>
            </div>

            {/* Level history */}
            <div className="bg-white rounded-2xl shadow-card p-6">
              <h3 className="font-heading font-bold text-navy text-lg mb-5">
                Reading Level History
              </h3>
              <div className="flex items-center gap-2">
                {[1, 2, 3].map((lvl, i, arr) => (
                  <div key={lvl} className="flex-1 flex items-center">
                    <div className="text-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-heading font-bold ${
                          lvl <= level
                            ? 'bg-gradient-to-br from-teal to-teal-600 text-white shadow-glow-teal'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {lvl}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-2">
                        {lvl === 1 && 'Ene 2025'}
                        {lvl === 2 && 'Peb 2025'}
                        {lvl === 3 && 'Mar 2025'}
                      </div>
                    </div>
                    {i < arr.length - 1 && (
                      <div className="flex-1 h-1 mx-2 rounded-full bg-gradient-to-r from-teal to-emerald-300 -mt-5" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-card p-6">
              <h3 className="font-heading font-bold text-navy text-lg mb-4">🏆 Sa Aming Klase</h3>
              <div className="space-y-2">
                {leaderboard.map((row, i) => (
                  <LeaderboardRow
                    key={row.uid}
                    rank={i + 1}
                    name={row.name}
                    stars={row.stars}
                    isCurrentUser={row.uid === (profile?.uid || 'demo-student-001')}
                  />
                ))}
              </div>
              <button className="mt-3 text-xs text-teal font-semibold hover:underline">
                Tingnan ang buong leaderboard →
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-card p-6">
              <h3 className="font-heading font-bold text-navy text-lg mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {(sessions.length ? sessions : []).slice(0, 3).map((s) => (
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
                      <div className="text-[11px] text-slate-500">
                        {s.completedAt?.toDate
                          ? s.completedAt.toDate().toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })
                          : 'Recent'}
                      </div>
                    </div>
                    <div className="text-sm font-heading font-bold text-teal">{s.score}%</div>
                    <div className="text-gold text-sm">{'★'.repeat(s.stars || 1)}</div>
                  </div>
                ))}
                {!sessions.length && (
                  <div className="text-center text-sm text-slate-400 py-6">
                    Walang aktibidad pa.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
