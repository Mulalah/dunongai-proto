import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import TopBar from '../../components/layout/TopBar';
import StoryCard from '../../components/student/StoryCard';
import Badge from '../../components/ui/Badge';
import { db, FIREBASE_ENABLED, collection, getDocs, query, where } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { findSectionByCode, getSectionById, getSectionsByIds, MAX_SECTIONS } from '../../utils/sections';
import { getAllStories } from '../../utils/stories';

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
  const { profile, updateProfile } = useAuth();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [completedMap, setCompletedMap] = useState({});
  const [joinCode, setJoinCode] = useState('');
  const [joinMsg, setJoinMsg] = useState(null); // { ok, text }
  const [joining, setJoining] = useState(false);
  const [joinedSections, setJoinedSections] = useState([]);

  // The sections this student belongs to (sectionIds[], with sectionId as active).
  const joinedIds = profile?.sectionIds?.length
    ? profile.sectionIds
    : profile?.sectionId
    ? [profile.sectionId]
    : [];

  // Load names/teacher for the switcher.
  useEffect(() => {
    let cancelled = false;
    getSectionsByIds(joinedIds).then((list) => {
      if (!cancelled) setJoinedSections(list);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [joinedIds.join(',')]);

  function switchSection(section) {
    if (section.id === profile?.sectionId) return;
    updateProfile({ sectionId: section.id, teacherId: section.teacherId });
    setJoinMsg(null);
  }

  function leaveSection(section) {
    if (!window.confirm(`Umalis sa "${section.name}"? Hindi mo na makikita ang mga kwento nito.`)) return;
    const remaining = joinedIds.filter((id) => id !== section.id);
    const patch = { sectionIds: remaining };
    if (profile?.sectionId === section.id) {
      const next = joinedSections.find((s) => s.id === remaining[0]);
      patch.sectionId = remaining[0] || null;
      patch.teacherId = next?.teacherId || null;
    }
    updateProfile(patch);
    setJoinMsg(null);
  }

  async function handleJoinSection(e) {
    e.preventDefault();
    if (!joinCode.trim()) return;
    setJoining(true);
    setJoinMsg(null);
    try {
      const section = await findSectionByCode(joinCode);
      if (!section) {
        throw new Error('Walang nahanap na section para sa code na iyon. Pakisuri sa iyong guro.');
      }
      setJoinCode('');

      // Already a member → just switch to it.
      if (joinedIds.includes(section.id)) {
        updateProfile({ sectionId: section.id, teacherId: section.teacherId });
        setJoinMsg({ ok: true, text: `Nasa "${section.name}" ka na — inilipat dito.` });
        return;
      }
      if (joinedIds.length >= MAX_SECTIONS) {
        throw new Error(`Hanggang ${MAX_SECTIONS} section lang muna ang puwedeng salihan.`);
      }

      const sectionIds = [...joinedIds, section.id];
      updateProfile({ sectionIds, sectionId: section.id, teacherId: section.teacherId });
      // First section ever → take the placement quiz once.
      if (!profile?.hasCompletedDiagnostic) {
        navigate('/student/quiz');
        return;
      }
      setJoinMsg({ ok: true, text: `Sumali ka na sa "${section.name}"! 🎉` });
    } catch (err) {
      setJoinMsg({ ok: false, text: err.message || 'Hindi makasali sa section.' });
    } finally {
      setJoining(false);
    }
  }

  // Keep only stories the student's section has been assigned.
  // No section, or a section without an explicit list → all stories.
  async function applySectionFilter(list) {
    if (!profile?.sectionId) return list;
    try {
      const section = await getSectionById(profile.sectionId);
      if (section && Array.isArray(section.storyIds)) {
        return list.filter((s) => section.storyIds.includes(s.id));
      }
    } catch {}
    return list;
  }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const full = await getAllStories();
        const list = await applySectionFilter(full);
        if (!cancelled) setStories(list);
      } catch {
        if (!cancelled) setStories([]);
      }

      if (!FIREBASE_ENABLED) {
        if (!cancelled) setLoading(false);
        return;
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
  }, [profile?.uid, profile?.sectionId]);

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

  // New students must join a section first — no stories shown until then.
  if (profile && joinedIds.length === 0) {
    return (
      <PageWrapper role="student">
        <TopBar title="Maligayang pagdating! 🎒" subtitle="Sumali muna sa iyong section" />
        <div className="p-8 page-enter flex justify-center">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-card p-8 text-center mt-6">
            <div className="text-5xl mb-3">🔑</div>
            <h2 className="font-heading font-extrabold text-navy text-2xl">Sumali sa iyong section</h2>
            <p className="text-slate-500 mt-2">
              Ipasok ang section code na ibinigay ng iyong guro para makita ang mga kwento.
            </p>
            <form onSubmit={handleJoinSection} className="mt-6 space-y-3">
              <input
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="SECTION CODE"
                className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-center text-lg font-mono tracking-[0.3em] focus:border-teal focus:bg-white focus:outline-none transition"
              />
              <button
                type="submit"
                disabled={joining}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-teal to-teal-600 text-white font-heading font-bold btn-press disabled:opacity-60"
              >
                {joining ? 'Sumasali…' : 'Sumali sa Section →'}
              </button>
            </form>
            {joinMsg && !joinMsg.ok && (
              <div className="mt-3 text-sm text-red-600">{joinMsg.text}</div>
            )}
          </div>
        </div>
      </PageWrapper>
    );
  }

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
        {/* My sections — switch active section (drives stories + leaderboard) */}
        <div className="mb-5 bg-white rounded-2xl shadow-card p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-navy font-heading font-semibold mr-1">Mga Section ko:</span>
            {joinedSections.map((s) => {
              const active = s.id === profile?.sectionId;
              return (
                <span key={s.id} className="inline-flex items-center rounded-full overflow-hidden">
                  <button
                    onClick={() => switchSection(s)}
                    className={`px-3 py-1.5 text-sm font-heading font-semibold transition ${
                      active
                        ? 'bg-gradient-to-r from-teal to-teal-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {s.name} {active && '✓'}
                  </button>
                  <button
                    onClick={() => leaveSection(s)}
                    title="Umalis sa section"
                    className={`px-2 py-1.5 text-sm transition ${
                      active
                        ? 'bg-teal-700 text-white/80 hover:text-white'
                        : 'bg-slate-200 text-slate-400 hover:text-red-500'
                    }`}
                  >
                    ✕
                  </button>
                </span>
              );
            })}
            <span className="text-xs text-slate-400">
              ({joinedIds.length}/{MAX_SECTIONS})
            </span>
          </div>

          {joinedIds.length < MAX_SECTIONS ? (
            <form onSubmit={handleJoinSection} className="mt-3 flex flex-wrap items-center gap-2">
              <input
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="SUMALI SA BAGONG SECTION (CODE)"
                className="h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-mono tracking-widest focus:border-teal focus:outline-none"
              />
              <button
                type="submit"
                disabled={joining}
                className="h-10 px-4 rounded-xl bg-gradient-to-r from-teal to-teal-600 text-white text-sm font-heading font-bold btn-press disabled:opacity-60"
              >
                {joining ? '…' : 'Sumali'}
              </button>
              {joinMsg && (
                <span className={`text-sm ${joinMsg.ok ? 'text-emerald-600' : 'text-red-600'}`}>
                  {joinMsg.text}
                </span>
              )}
            </form>
          ) : (
            <div className="mt-2 text-xs text-slate-400">
              Umabot ka na sa {MAX_SECTIONS} na section (ang pinakamarami sa ngayon).
            </div>
          )}
        </div>

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
