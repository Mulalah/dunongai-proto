// Deterministic "intelligence" for the teacher + parent dashboards. Everything
// here is pure local computation (no Firebase / no AI), so it works live in
// DEMO_MODE and renders identically against real Firestore data.

const clampScore = (n) => Math.max(0, Math.min(100, Math.round(n)));

// Normalize the various completedAt shapes (Firestore Timestamp, the synthetic
// { seconds, toDate } stub, or nothing) into a real Date or null.
function toDate(completedAt) {
  if (!completedAt) return null;
  if (typeof completedAt.toDate === 'function') return completedAt.toDate();
  if (typeof completedAt.seconds === 'number') return new Date(completedAt.seconds * 1000);
  return null;
}

// ── Status ────────────────────────────────────────────────────────────────
// Honest, tunable heuristic from the fields every roster student already has.
export function deriveStatus(student = {}) {
  const score = student.lastScore ?? student.recentScore ?? 0;
  const streak = student.streakDays ?? student.streak ?? 0;

  if (score < 50 || (streak === 0 && score < 65)) {
    const reasons = [];
    if (score < 50) reasons.push('mababang score');
    if (streak === 0) reasons.push('walang streak');
    return { status: 'flagged', reason: reasons.join(' · ') || 'kailangan ng pagsubaybay' };
  }
  if (score >= 75) {
    return { status: 'on-track', reason: 'matatag na pagbasa' };
  }
  return {
    status: 'improving',
    reason: streak > 0 ? `${streak}-araw na streak` : 'paunti-unting umuusad'
  };
}

// Shared label/colour/icon per status so every surface renders it the same way.
// `variant` maps to existing Badge variants; `icon` to existing Icon names.
export const STATUS_META = {
  flagged: { label: 'Kailangan ng Tulong', short: 'Tulong', variant: 'danger', icon: 'alert', color: '#E11D48' },
  improving: { label: 'Umuusad', short: 'Improving', variant: 'warning', icon: 'trendingUp', color: '#F59E0B' },
  'on-track': { label: 'On Track', short: 'On Track', variant: 'success', icon: 'checkCircle', color: '#0D9488' }
};

// ── Class-level analytics ───────────────────────────────────────────────────
export function classInsights(students = []) {
  const statuses = students.map((s) => deriveStatus(s).status);

  const levelDistribution = [1, 2, 3, 4, 5, 6].map((level) => ({
    level,
    label: `A${level}`, // compact x-axis label ("Antas sa Pagbasa 1" is too long for a bar)
    count: students.filter((s) => (s.currentLevel || 0) === level).length
  }));

  const statusCounts = {
    flagged: statuses.filter((s) => s === 'flagged').length,
    improving: statuses.filter((s) => s === 'improving').length,
    'on-track': statuses.filter((s) => s === 'on-track').length
  };

  const n = students.length || 1;
  const avgScore = Math.round(students.reduce((a, s) => a + (s.lastScore || 0), 0) / n);
  const avgLevel = (students.reduce((a, s) => a + (s.currentLevel || 0), 0) / n).toFixed(1);
  const activeToday = students.filter((s) => (s.streakDays || 0) > 0).length;

  return { levelDistribution, statusCounts, avgScore, avgLevel, activeToday, total: students.length };
}

// ── Parent weekly recap ─────────────────────────────────────────────────────
// Splits sessions into "this week" vs the prior window. When sessions carry
// timestamps we use real 7-day windows; otherwise (demo data) we split the
// recent list in half so the recap still reads sensibly.
export function weeklyRecap(sessions = [], progress = {}, childName = 'ang bata') {
  const items = sessions.map((s) => ({
    score: s.score || 0,
    stars: s.stars || 0,
    title: s.storyTitle || s.title || 'Kwento',
    date: toDate(s.completedAt)
  }));

  const dated = items.filter((s) => s.date);
  let thisWeek;
  let prior;
  if (dated.length >= 2) {
    const now = Date.now();
    const WEEK = 7 * 864e5;
    thisWeek = dated.filter((s) => now - s.date.getTime() <= WEEK);
    prior = dated.filter((s) => {
      const d = now - s.date.getTime();
      return d > WEEK && d <= 2 * WEEK;
    });
    if (!thisWeek.length) thisWeek = dated.slice(0, Math.ceil(dated.length / 2));
  } else {
    const half = Math.max(1, Math.ceil(items.length / 2));
    thisWeek = items.slice(0, half);
    prior = items.slice(half);
  }

  const avg = (arr) => (arr.length ? Math.round(arr.reduce((a, s) => a + s.score, 0) / arr.length) : 0);
  const avgScore = avg(thisWeek);
  const trendDelta = prior.length ? avgScore - avg(prior) : 0;
  const streak = progress.streakDays ?? 0;
  const storiesThisWeek = thisWeek.length;

  const nextGoal =
    avgScore >= 80
      ? 'Handa nang subukan ang susunod na antas sa pagbasa!'
      : avgScore >= 60
      ? 'Markahan ang 80% para umangat sa susunod na antas.'
      : 'Magbasa araw-araw para mapabuti ang score.';

  const deltaText =
    trendDelta > 0
      ? ` — ${trendDelta}% na mas mataas kaysa nakaraang linggo`
      : trendDelta < 0
      ? ` — ${Math.abs(trendDelta)}% na mas mababa kaysa nakaraang linggo`
      : '';
  const streakText = streak > 0 ? `Patuloy ang ${streak}-araw na streak 🔥. ` : '';
  const narrative = storiesThisWeek
    ? `Ngayong linggo, nakabasa si ${childName} ng ${storiesThisWeek} kwento na may ${avgScore}% na average na score${deltaText}. ${streakText}${nextGoal}`
    : `Wala pang aktibidad si ${childName} ngayong linggo. ${nextGoal}`;

  return { storiesThisWeek, avgScore, trendDelta, streak, nextGoal, narrative };
}

// ── Trend synthesis ─────────────────────────────────────────────────────────
// Generalizes the old sampleTrend()/ts() in StudentProfile so any view can show
// a 4-week trend for a student that has no real session history yet.
function tsAgo(now, days) {
  const d = new Date(now);
  d.setDate(d.getDate() - days);
  return { seconds: Math.floor(d.getTime() / 1000), toDate: () => d };
}

export function synthTrend(student = {}) {
  const now = new Date();
  const base = student.lastScore || 60;
  return [
    { storyTitle: 'Linggo 1', score: clampScore(base - 12), stars: 2, completedAt: tsAgo(now, 21) },
    { storyTitle: 'Linggo 2', score: clampScore(base - 6), stars: 3, completedAt: tsAgo(now, 14) },
    { storyTitle: 'Linggo 3', score: clampScore(base - 2), stars: 3, completedAt: tsAgo(now, 7) },
    { storyTitle: 'Linggo 4', score: clampScore(base), stars: 4, completedAt: tsAgo(now, 0) }
  ];
}
