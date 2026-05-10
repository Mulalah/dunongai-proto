import Badge from '../ui/Badge';
import ProgressBar from '../ui/ProgressBar';

const AVATAR_COLORS = [
  'from-teal to-emerald-400',
  'from-violet-500 to-fuchsia-400',
  'from-amber-500 to-orange-400',
  'from-rose-500 to-pink-400',
  'from-sky-500 to-cyan-400',
  'from-indigo-500 to-blue-400'
];

function colorFromName(name = '') {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function statusPill(status) {
  if (status === 'flagged') return <Badge variant="danger">⚠️ Tulong</Badge>;
  if (status === 'improving') return <Badge variant="warning">📈 Improving</Badge>;
  return <Badge variant="success">✅ On Track</Badge>;
}

function scoreColor(score) {
  if (score >= 75) return 'green';
  if (score >= 60) return 'gold';
  if (score >= 45) return 'red';
  return 'red';
}

export default function StudentRow({ student, onView }) {
  const initials = (student.displayName || '??')
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const flagged = student.status === 'flagged';

  return (
    <tr
      className={`border-b border-slate-100 hover:bg-slate-50/60 transition ${
        flagged ? 'bg-red-50/30 border-l-4 border-l-red-500' : ''
      }`}
    >
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full bg-gradient-to-br ${colorFromName(
              student.displayName
            )} flex items-center justify-center text-white text-sm font-bold`}
          >
            {initials}
          </div>
          <div>
            <div className="font-heading font-semibold text-navy text-sm">
              {student.displayName}
            </div>
            <div className="text-xs text-slate-500">Grade {student.gradeLevel || 3}</div>
          </div>
        </div>
      </td>
      <td className="p-4">
        <Badge variant="level">Antas {student.currentLevel || 1}</Badge>
      </td>
      <td className="p-4 text-sm text-slate-600">
        {student.streakDays > 0 ? 'Kahapon' : '14+ araw'}
      </td>
      <td className="p-4 w-[180px]">
        <div className="flex items-center gap-3">
          <div className="font-heading font-bold text-navy text-sm w-10">
            {student.lastScore ?? '—'}%
          </div>
          <ProgressBar
            value={student.lastScore || 0}
            color={scoreColor(student.lastScore || 0)}
            size="sm"
            className="flex-1"
          />
        </div>
      </td>
      <td className="p-4 text-sm">
        <span className="text-amber-500">🔥</span>
        <span className="ml-1 font-semibold">{student.streakDays || 0}</span>
      </td>
      <td className="p-4">{statusPill(student.status)}</td>
      <td className="p-4 text-right">
        <button
          onClick={() => onView?.(student)}
          className="text-teal text-sm font-heading font-semibold hover:underline"
        >
          Tingnan →
        </button>
      </td>
    </tr>
  );
}
