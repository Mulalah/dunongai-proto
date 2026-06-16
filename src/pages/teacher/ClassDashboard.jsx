import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import TopBar from '../../components/layout/TopBar';
import StatCard from '../../components/ui/StatCard';
import StudentRow from '../../components/teacher/StudentRow';
import { useAuth } from '../../context/AuthContext';
import { db, FIREBASE_ENABLED, collection, getDocs, query, where } from '../../firebase';
import { SEED_CLASS_STUDENTS } from '../../utils/seedData';
import { getSectionsForTeacher, createSection } from '../../utils/sections';

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
  const [sections, setSections] = useState([]);
  const [activeSectionId, setActiveSectionId] = useState('');
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [copied, setCopied] = useState(false);

  const activeSection = sections.find((s) => s.id === activeSectionId) || null;

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
        if (!cancelled) setStudents(arr.length ? arr : seedFallback());
      } catch {
        if (!cancelled) setStudents(seedFallback());
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [teacherId, activeSectionId]);

  function switchSection(id) {
    setActiveSectionId(id);
    localStorage.setItem(`dunong_active_section_${teacherId}`, id);
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
        title={`${profile?.className || 'Grade 3 - Rizal'} Dashboard`}
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
