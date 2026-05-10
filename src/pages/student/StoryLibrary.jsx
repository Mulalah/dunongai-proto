import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import TopBar from '../../components/layout/TopBar';
import StoryCard from '../../components/student/StoryCard';
import Badge from '../../components/ui/Badge';
import { db, FIREBASE_ENABLED, collection, getDocs, query, where } from '../../firebase';
import { SEED_STORIES } from '../../utils/seedData';
import { useAuth } from '../../context/AuthContext';

const FILTERS = [
  'ALL',
  'ENGLISH',
  'FILIPINO',
  'ANTAS 1',
  'ANTAS 2',
  'ANTAS 3',
  'ANTAS 4',
  'ANTAS 5',
  'ANTAS 6'
];

export default function StoryLibrary() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [completedMap, setCompletedMap] = useState({});

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      if (!FIREBASE_ENABLED) {
        if (!cancelled) { setStories(SEED_STORIES); setLoading(false); }
        return;
      }
      try {
        const snap = await getDocs(collection(db, 'stories'));
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        // Fall back to seed data if Firestore returned a partial result
        if (!cancelled) setStories(list.length >= SEED_STORIES.length ? list : SEED_STORIES);
      } catch {
        if (!cancelled) setStories(SEED_STORIES);
      }

      // Load completed stories from sessions
      try {
        const sessSnap = await getDocs(
          query(
            collection(db, 'sessions'),
            where('studentId', '==', profile?.uid || 'demo-student-001')
          )
        );
        const map = {};
        sessSnap.docs.forEach((d) => {
          const s = d.data();
          if (!map[s.storyId] || s.score > map[s.storyId].score) {
            map[s.storyId] = { score: s.score, stars: s.stars };
          }
        });
        if (!cancelled) setCompletedMap(map);
      } catch {}

      if (!cancelled) setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [profile?.uid]);

  const filtered = useMemo(() => {
    let arr = stories;
    if (filter !== 'ALL') {
      if (filter === 'ENGLISH' || filter === 'FILIPINO') {
        arr = arr.filter((s) => s.language?.toUpperCase() === filter);
      } else {
        const lvl = parseInt(filter.replace('ANTAS ', ''), 10);
        arr = arr.filter((s) => s.level === lvl);
      }
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          (s.text || '').toLowerCase().includes(q)
      );
    }
    return arr;
  }, [stories, filter, search]);

  const level = profile?.currentLevel || 3;
  const streak = profile?.streakDays ?? 5;

  return (
    <PageWrapper role="student">
      <TopBar
        title="Mga Kwento 📚"
        subtitle="Pumili ng kwento para basahin"
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="level">Antas {level}</Badge>
            <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold">
              🔥 {streak}
            </span>
          </div>
        }
      />

      <div className="p-8 page-enter">
        {/* Search */}
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔎</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Hanapin ang kwento…"
            className="w-full h-13 pl-12 pr-4 rounded-2xl border border-slate-200 bg-white shadow-card focus:border-teal focus:outline-none transition"
            style={{ height: 52 }}
          />
        </div>

        {/* Filters */}
        <div className="mt-4 flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const active = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-full text-xs font-heading font-bold uppercase tracking-wide transition ${
                  active
                    ? 'bg-gradient-to-r from-teal to-teal-600 text-white shadow-glow-teal'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-teal'
                }`}
              >
                {f}
              </button>
            );
          })}
        </div>

        {/* Grid */}
        <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-card overflow-hidden">
                  <div className="skeleton h-[160px]" />
                  <div className="p-4 space-y-2">
                    <div className="skeleton h-4 w-3/4" />
                    <div className="skeleton h-3 w-1/2" />
                  </div>
                </div>
              ))
            : filtered.map((s, i) => (
                <StoryCard
                  key={s.id}
                  story={s}
                  index={i}
                  completed={!!completedMap[s.id]}
                  stars={completedMap[s.id]?.stars || 0}
                  onSelect={(story) => navigate(`/student/read/${story.id}`)}
                />
              ))}
        </div>

        {!loading && filtered.length === 0 && (
          <div className="text-center text-slate-500 py-14">
            <div className="text-3xl mb-2">📭</div>
            Walang nakitang kwento. Subukang ibang filter.
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
