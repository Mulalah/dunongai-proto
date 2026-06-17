import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import TopBar from '../../components/layout/TopBar';
import StatCard from '../../components/ui/StatCard';
import Button from '../../components/ui/Button';
import StudentRow from '../../components/teacher/StudentRow';
import { useAuth } from '../../context/AuthContext';
import { db, FIREBASE_ENABLED, collection, getDocs, query, where } from '../../firebase';
import { SEED_CLASS_STUDENTS } from '../../utils/seedData';
import {
  getSectionsForTeacher,
  createSection,
  getSectionById,
  setSectionStories
} from '../../utils/sections';
import { getAllStories, createStory, deleteStory } from '../../utils/stories';

const TABS = [
  { id: 'all', label: 'Lahat' },
  { id: 'flagged', label: '⚠️ Kailangan ng Tulong' },
  { id: 'on-track', label: '✅ On Track' },
  { id: 'improving', label: '📈 Improving' }
];

export default function ClassDashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('flagged');
  const [sortKey, setSortKey] = useState('status');
  const [sortDir, setSortDir] = useState('asc');

  const teacherId = profile?.uid || 'demo-teacher-001';
  const isDemoTeacher = teacherId === 'demo-teacher-001';
  const [sections, setSections] = useState([]);
  const [activeSectionId, setActiveSectionId] = useState('');
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [copied, setCopied] = useState(false);

  // Story assignment per section
  const [catalog, setCatalog] = useState([]); // all stories the teacher can assign
  const [storyMgrOpen, setStoryMgrOpen] = useState(false);
  const [assignedIds, setAssignedIds] = useState(null); // null = all stories (no restriction)
  const [selected, setSelected] = useState(new Set());
  const [savingStories, setSavingStories] = useState(false);
  const [storiesSaved, setStoriesSaved] = useState(false);

  // Publish a new story
  const [composeOpen, setComposeOpen] = useState(false);
  const [draft, setDraft] = useState({ title: '', level: 1, language: 'Filipino', text: '', tapWords: '' });
  const [publishing, setPublishing] = useState(false);

  // Story-list filters (teacher manager)
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterLang, setFilterLang] = useState('all');

  const visibleStories = catalog.filter(
    (s) =>
      (filterLevel === 'all' || s.level === Number(filterLevel)) &&
      (filterLang === 'all' || s.language === filterLang)
  );

  // Load the story catalog (seed + teacher-published) once.
  useEffect(() => {
    let cancelled = false;
    getAllStories()
      .then((list) => {
        if (!cancelled) setCatalog(list);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const activeSection = sections.find((s) => s.id === activeSectionId) || null;

  // Broadcast the active section name so the sidebar's "Aking Klase" matches.
  useEffect(() => {
    if (!activeSection) return;
    localStorage.setItem(`dunong_active_section_name_${teacherId}`, activeSection.name);
    window.dispatchEvent(new CustomEvent('dunong:activesection', { detail: activeSection.name }));
  }, [activeSection, teacherId]);

  // Load this teacher's sections; restore last-selected from localStorage.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await getSectionsForTeacher(teacherId);
        if (cancelled) return;
        setSections(list);
        const saved = localStorage.getItem(`dunong_active_section_${teacherId}`);
        const initial = list.find((s) => s.id === saved) || list[0];
        if (initial) setActiveSectionId(initial.id);
      } catch {
        if (!cancelled) setSections([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [teacherId]);

  // Load students for the active section.
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      if (!FIREBASE_ENABLED) {
        if (!cancelled) { setStudents(seedFallback()); setLoading(false); }
        return;
      }
      try {
        const constraints = activeSectionId
          ? where('sectionId', '==', activeSectionId)
          : where('teacherId', '==', teacherId);
        const snap = await getDocs(query(collection(db, 'users'), constraints));
        const arr = snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
        // Real teachers see exactly their real students (even if 0). Only the
        // demo teacher falls back to the sample roster so the demo looks alive.
        if (!cancelled) setStudents(arr.length ? arr : isDemoTeacher ? seedFallback() : []);
      } catch {
        if (!cancelled) setStudents(isDemoTeacher ? seedFallback() : []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [teacherId, activeSectionId]);

  // Load the active section's assigned stories whenever it changes.
  useEffect(() => {
    let cancelled = false;
    setStoryMgrOpen(false);
    setStoriesSaved(false);
    if (!activeSectionId) {
      setAssignedIds(null);
      return;
    }
    (async () => {
      try {
        const section = await getSectionById(activeSectionId);
        if (!cancelled) setAssignedIds(Array.isArray(section?.storyIds) ? section.storyIds : null);
      } catch {
        if (!cancelled) setAssignedIds(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeSectionId]);

  function switchSection(id) {
    setActiveSectionId(id);
    localStorage.setItem(`dunong_active_section_${teacherId}`, id);
  }

  function openStoryManager() {
    // null (all) → start with everything selected
    setSelected(new Set(assignedIds ?? catalog.map((s) => s.id)));
    setStoriesSaved(false);
    setStoryMgrOpen(true);
  }

  async function handlePublishStory(e) {
    e.preventDefault();
    if (!draft.title.trim() || !draft.text.trim()) return;
    setPublishing(true);
    try {
      const tapWords = draft.tapWords
        .split(',')
        .map((w) => w.trim())
        .filter(Boolean);
      const story = await createStory(teacherId, { ...draft, tapWords, author: profile?.displayName });
      setCatalog((prev) => [...prev, story]);
      setSelected((prev) => new Set(prev).add(story.id)); // auto-include in current selection
      setDraft({ title: '', level: 1, language: 'Filipino', text: '', tapWords: '' });
      setComposeOpen(false);
    } finally {
      setPublishing(false);
    }
  }

  async function handleDeleteStory(story) {
    if (!window.confirm(`Burahin ang "${story.title}"? Hindi na ito maibabalik.`)) return;
    try {
      await deleteStory(story, teacherId);
      setCatalog((prev) => prev.filter((s) => s.id !== story.id));
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(story.id);
        return next;
      });
    } catch (e) {
      window.alert(e.message || 'Hindi mabura ang kwento.');
    }
  }

  function toggleStory(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function saveStoryAssignment() {
    if (!activeSectionId) return;
    setSavingStories(true);
    const ids = [...selected];
    try {
      await setSectionStories(activeSectionId, ids);
      setAssignedIds(ids);
      setStoriesSaved(true);
    } finally {
      setSavingStories(false);
    }
  }

  async function handleCreateSection(e) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    const section = await createSection(teacherId, name);
    setSections((prev) => [...prev, section]);
    switchSection(section.id);
    setNewName('');
    setCreating(false);
  }

  function copyCode() {
    if (!activeSection?.code) return;
    navigator.clipboard?.writeText(activeSection.code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function seedFallback() {
    return SEED_CLASS_STUDENTS.map((s) => ({
      uid: s.id,
      displayName: s.displayName,
      currentLevel: s.level,
      lastScore: s.lastScore,
      streakDays: s.streak,
      status: s.status,
      gradeLevel: 3
    }));
  }

  const flaggedCount = students.filter((s) => s.status === 'flagged').length;
  const avgLevel =
    students.length > 0
      ? (
          students.reduce((acc, s) => acc + (s.currentLevel || 0), 0) / students.length
        ).toFixed(1)
      : '—';
  const activeToday = students.filter((s) => (s.streakDays || 0) > 0).length;

  const filtered = useMemo(() => {
    let arr = students;
    if (tab !== 'all') arr = arr.filter((s) => s.status === tab);
    return [...arr].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'status') {
        const order = { flagged: 0, improving: 1, 'on-track': 2 };
        cmp = (order[a.status] ?? 3) - (order[b.status] ?? 3);
      } else if (sortKey === 'name') {
        cmp = (a.displayName || '').localeCompare(b.displayName || '');
      } else if (sortKey === 'score') {
        cmp = (a.lastScore || 0) - (b.lastScore || 0);
      } else if (sortKey === 'level') {
        cmp = (a.currentLevel || 0) - (b.currentLevel || 0);
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [students, tab, sortKey, sortDir]);

  function header(label, key) {
    const active = sortKey === key;
    return (
      <th
        onClick={() => {
          if (active) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
          else {
            setSortKey(key);
            setSortDir('asc');
          }
        }}
        className="text-left px-4 py-3 text-[11px] uppercase tracking-wide text-slate-500 font-bold cursor-pointer select-none"
      >
        {label} {active ? (sortDir === 'asc' ? '↑' : '↓') : ''}
      </th>
    );
  }

  return (
    <PageWrapper role="teacher">
      <TopBar
        title={`${activeSection?.name || profile?.className || 'Klase'} Dashboard`}
        subtitle={profile?.displayName || "Ma'am Ana Reyes"}
      />
      <div className="p-8 page-enter">
        {/* Section bar */}
        <div className="mb-6 bg-white rounded-2xl shadow-card p-4 flex flex-wrap items-center gap-3">
          <span className="text-[11px] uppercase tracking-wide text-slate-500 font-bold">Section</span>

          {sections.length > 0 ? (
            <select
              value={activeSectionId}
              onChange={(e) => switchSection(e.target.value)}
              className="h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 font-heading font-semibold text-navy text-sm focus:border-teal focus:outline-none"
            >
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          ) : (
            <span className="text-sm text-slate-400">Wala pang section.</span>
          )}

          {activeSection && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Join code:</span>
              <button
                onClick={copyCode}
                title="I-kopya"
                className="font-mono font-bold tracking-widest text-teal bg-teal/10 px-3 py-1.5 rounded-lg hover:bg-teal/20 transition"
              >
                {activeSection.code} {copied ? '✓' : '⧉'}
              </button>
            </div>
          )}

          {activeSection && (
            <button
              onClick={() => (storyMgrOpen ? setStoryMgrOpen(false) : openStoryManager())}
              className="text-sm font-heading font-semibold text-navy bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition"
            >
              📖 Mga Kwento ({assignedIds ? assignedIds.length : catalog.length})
            </button>
          )}

          <div className="ml-auto">
            {creating ? (
              <form onSubmit={handleCreateSection} className="flex items-center gap-2">
                <input
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Pangalan ng section"
                  className="h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:border-teal focus:outline-none"
                />
                <button
                  type="submit"
                  className="h-10 px-4 rounded-xl bg-gradient-to-r from-teal to-teal-600 text-white text-sm font-heading font-bold btn-press"
                >
                  Gawin
                </button>
                <button
                  type="button"
                  onClick={() => { setCreating(false); setNewName(''); }}
                  className="h-10 px-3 rounded-xl text-slate-500 text-sm hover:bg-slate-100"
                >
                  Kanselahin
                </button>
              </form>
            ) : (
              <button
                onClick={() => setCreating(true)}
                className="h-10 px-4 rounded-xl border-2 border-teal/40 text-teal text-sm font-heading font-bold hover:bg-teal/5 transition btn-press"
              >
                + Bagong Section
              </button>
            )}
          </div>
        </div>

        {/* Story assignment manager */}
        {storyMgrOpen && activeSection && (
          <div className="mb-6 bg-white rounded-2xl shadow-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-heading font-bold text-navy">
                  Mga Kwento para sa {activeSection.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Piliin kung aling kwento ang makikita ng mga estudyante sa section na ito.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setComposeOpen((v) => !v)}
                  className="text-xs font-semibold text-white bg-gradient-to-r from-teal to-teal-600 px-3 py-1.5 rounded-lg btn-press"
                >
                  ➕ Gumawa ng Kwento
                </button>
                <button
                  onClick={() => setSelected(new Set(catalog.map((s) => s.id)))}
                  className="text-xs text-teal font-semibold hover:underline"
                >
                  Piliin lahat
                </button>
                <span className="text-slate-300">·</span>
                <button
                  onClick={() => setSelected(new Set())}
                  className="text-xs text-slate-500 font-semibold hover:underline"
                >
                  Alisin lahat
                </button>
              </div>
            </div>

            {/* Compose a new story */}
            {composeOpen && (
              <form
                onSubmit={handlePublishStory}
                className="mb-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3"
              >
                <div className="flex flex-wrap gap-3">
                  <input
                    required
                    value={draft.title}
                    onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                    placeholder="Pamagat ng kwento"
                    className="flex-1 min-w-[200px] h-10 px-3 rounded-lg border border-slate-200 text-sm focus:border-teal focus:outline-none"
                  />
                  <select
                    value={draft.level}
                    onChange={(e) => setDraft((d) => ({ ...d, level: e.target.value }))}
                    className="h-10 px-3 rounded-lg border border-slate-200 text-sm focus:border-teal focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6].map((g) => (
                      <option key={g} value={g}>
                        Antas {g}
                      </option>
                    ))}
                  </select>
                  <select
                    value={draft.language}
                    onChange={(e) => setDraft((d) => ({ ...d, language: e.target.value }))}
                    className="h-10 px-3 rounded-lg border border-slate-200 text-sm focus:border-teal focus:outline-none"
                  >
                    <option>Filipino</option>
                    <option>English</option>
                  </select>
                </div>
                <textarea
                  required
                  value={draft.text}
                  onChange={(e) => setDraft((d) => ({ ...d, text: e.target.value }))}
                  placeholder="Isulat dito ang buong kwento…"
                  rows={6}
                  className="w-full p-3 rounded-lg border border-slate-200 text-sm focus:border-teal focus:outline-none reading-text"
                />
                <div>
                  <input
                    value={draft.tapWords}
                    onChange={(e) => setDraft((d) => ({ ...d, tapWords: e.target.value }))}
                    placeholder="Mga salitang ie-highlight (hal. taniman, kamatis, pag-aalaga)"
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:border-teal focus:outline-none"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">
                    Paghiwalayin ng kuwit. Ito ang mga salitang puwedeng i-tap ng estudyante para
                    ipaliwanag ni Basa Bot. Dapat tumugma ang spelling sa kwento.
                  </p>

                  {draft.tapWords.trim() && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {draft.tapWords
                        .split(',')
                        .map((w) => w.trim())
                        .filter(Boolean)
                        .map((w, i) => {
                          const found = draft.text.toLowerCase().includes(w.toLowerCase());
                          return (
                            <span
                              key={`${w}-${i}`}
                              className={`text-xs px-2 py-1 rounded-full font-semibold ${
                                found
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {found ? '✓' : '⚠'} {w}
                            </span>
                          );
                        })}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Button size="md" loading={publishing} onClick={handlePublishStory}>
                    I-publish ang Kwento
                  </Button>
                  <button
                    type="button"
                    onClick={() => setComposeOpen(false)}
                    className="text-sm text-slate-500 hover:underline"
                  >
                    Kanselahin
                  </button>
                </div>
              </form>
            )}

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-[11px] uppercase tracking-wide text-slate-500 font-bold">Filter</span>
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:border-teal focus:outline-none"
              >
                <option value="all">Lahat ng antas</option>
                {[1, 2, 3, 4, 5, 6].map((g) => (
                  <option key={g} value={g}>
                    Antas {g}
                  </option>
                ))}
              </select>
              <select
                value={filterLang}
                onChange={(e) => setFilterLang(e.target.value)}
                className="h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:border-teal focus:outline-none"
              >
                <option value="all">Lahat ng wika</option>
                <option value="Filipino">Filipino</option>
                <option value="English">English</option>
              </select>
              <span className="text-xs text-slate-400">
                {visibleStories.length} ng {catalog.length} kwento
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-1">
              {visibleStories.map((s) => {
                const on = selected.has(s.id);
                const mine = s.createdBy && s.createdBy === teacherId;
                return (
                  <div
                    key={s.id}
                    className={`flex items-center gap-2 p-3 rounded-xl border transition ${
                      on ? 'border-teal bg-teal/5' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <label className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() => toggleStory(s.id)}
                        className="accent-teal w-4 h-4"
                      />
                      <span className="text-xl">{s.emoji}</span>
                      <span className="flex-1 min-w-0">
                        <span className="block font-heading font-semibold text-sm text-navy truncate">
                          {s.title}
                          {mine && (
                            <span className="ml-1 text-[10px] text-teal font-bold uppercase">· akin</span>
                          )}
                        </span>
                        <span className="block text-[11px] text-slate-500">
                          Antas {s.level} · {s.language}
                        </span>
                      </span>
                    </label>
                    {mine && (
                      <button
                        type="button"
                        onClick={() => handleDeleteStory(s)}
                        title="Burahin ang kwento"
                        className="shrink-0 text-slate-400 hover:text-red-500 transition px-1"
                      >
                        🗑
                      </button>
                    )}
                  </div>
                );
              })}
              {visibleStories.length === 0 && (
                <div className="col-span-full text-center text-sm text-slate-400 py-6">
                  Walang kwentong tumutugma sa filter.
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center gap-3">
              <Button size="md" loading={savingStories} onClick={saveStoryAssignment}>
                I-save ({selected.size})
              </Button>
              {storiesSaved && (
                <span className="text-sm text-emerald-600 font-semibold">Na-save! ✓</span>
              )}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            icon="👥"
            label="Total Students"
            value={loading ? '—' : students.length}
            color="navy"
            loading={loading}
          />
          <StatCard
            icon="📊"
            label="Average Level"
            value={loading ? '—' : avgLevel}
            color="purple"
            loading={loading}
          />
          <StatCard
            icon="✅"
            label="Active Today"
            value={loading ? '—' : activeToday}
            color="green"
            loading={loading}
          />
          <StatCard
            icon="⚠️"
            label="Needs Attention"
            value={loading ? '—' : flaggedCount}
            color="red"
            badge={flaggedCount}
            loading={loading}
          />
        </div>

        {/* Tabs */}
        <div className="mt-7 flex flex-wrap gap-2">
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-2 rounded-full text-xs font-heading font-bold uppercase tracking-wide transition ${
                  active
                    ? 'bg-gradient-to-r from-teal to-teal-600 text-white shadow-glow-teal'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-teal'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Table */}
        <div className="mt-5 bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  {header('Name', 'name')}
                  {header('Antas', 'level')}
                  <th className="text-left px-4 py-3 text-[11px] uppercase tracking-wide text-slate-500 font-bold">
                    Huling Session
                  </th>
                  {header('Score', 'score')}
                  <th className="text-left px-4 py-3 text-[11px] uppercase tracking-wide text-slate-500 font-bold">
                    Streak
                  </th>
                  {header('Status', 'status')}
                  <th className="text-right px-4 py-3 text-[11px] uppercase tracking-wide text-slate-500 font-bold">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-slate-100">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full skeleton" />
                          <div>
                            <div className="skeleton h-3 w-32 mb-1" />
                            <div className="skeleton h-2 w-16" />
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="skeleton h-5 w-16" />
                      </td>
                      <td className="p-4">
                        <div className="skeleton h-3 w-20" />
                      </td>
                      <td className="p-4">
                        <div className="skeleton h-3 w-24" />
                      </td>
                      <td className="p-4">
                        <div className="skeleton h-3 w-12" />
                      </td>
                      <td className="p-4">
                        <div className="skeleton h-5 w-20" />
                      </td>
                      <td className="p-4 text-right">
                        <div className="skeleton h-3 w-16 ml-auto" />
                      </td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">
                      Walang estudyante sa kategoryang ito.
                    </td>
                  </tr>
                ) : (
                  filtered.map((s) => (
                    <StudentRow
                      key={s.uid}
                      student={s}
                      onView={(stu) => navigate(`/teacher/student/${stu.uid}`)}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
