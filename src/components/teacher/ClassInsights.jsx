import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell
} from 'recharts';
import Icon from '../ui/Icon';
import { classInsights, STATUS_META } from '../../utils/insights';

// At-a-glance class analytics: how readers are spread across reading levels, the
// on-track / improving / needs-help split, and the class average score. All of it
// is computed locally from the roster, so it works in DEMO_MODE and on real data.
export default function ClassInsights({ students = [], className = '' }) {
  const { levelDistribution, statusCounts, avgScore } = classInsights(students);
  const total = students.length || 1;

  const barColor = (level) =>
    level >= 5 ? '#F59E0B' : level >= 3 ? '#0D9488' : '#0A1628';

  const splits = ['on-track', 'improving', 'flagged'].map((key) => ({
    key,
    count: statusCounts[key] || 0,
    pct: Math.round(((statusCounts[key] || 0) / total) * 100),
    meta: STATUS_META[key]
  }));

  return (
    <div
      className={`bg-white border border-slate-200/70 rounded-2xl shadow-card p-6 ${className}`}
    >
      <div className="flex items-center gap-2 mb-5">
        <span className="w-8 h-8 rounded-lg bg-teal/10 text-teal flex items-center justify-center">
          <Icon name="chartBar" size={18} />
        </span>
        <h3 className="font-heading font-bold text-navy text-lg">Pangkalahatang Tanaw ng Klase</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Reading-level distribution */}
        <div className="lg:col-span-3">
          <div className="text-[11px] uppercase tracking-wide text-slate-500 font-bold mb-2">
            Dami kada antas sa pagbasa
          </div>
          <div style={{ width: '100%', height: 200 }}>
            <ResponsiveContainer>
              <BarChart data={levelDistribution} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748B' }} stroke="#CBD5E1" />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  stroke="#CBD5E1"
                />
                <Tooltip
                  cursor={{ fill: 'rgba(13,148,136,0.06)' }}
                  contentStyle={{
                    borderRadius: 10,
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 4px 12px rgba(10,22,40,0.08)',
                    fontSize: 12
                  }}
                  formatter={(value) => [`${value} estudyante`, 'Bilang']}
                  labelFormatter={(l) => `Antas sa Pagbasa ${String(l).replace('A', '')}`}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={48}>
                  {levelDistribution.map((d) => (
                    <Cell key={d.level} fill={barColor(d.level)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status split + avg score */}
        <div className="lg:col-span-2 flex flex-col">
          <div className="text-[11px] uppercase tracking-wide text-slate-500 font-bold mb-2">
            Kalagayan ng klase
          </div>

          {/* Proportional bar */}
          <div className="flex h-3 rounded-full overflow-hidden bg-slate-100">
            {splits.map((s) =>
              s.count > 0 ? (
                <div
                  key={s.key}
                  style={{ width: `${s.pct}%`, background: s.meta.color }}
                  title={`${s.meta.label}: ${s.count}`}
                />
              ) : null
            )}
          </div>

          {/* Legend */}
          <div className="mt-3 space-y-2">
            {splits.map((s) => (
              <div key={s.key} className="flex items-center gap-2 text-sm">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: s.meta.color }}
                />
                <span className="text-slate-600">{s.meta.label}</span>
                <span className="ml-auto font-heading font-bold text-navy tabular-nums">
                  {s.count}
                </span>
              </div>
            ))}
          </div>

          {/* Average score */}
          <div className="mt-auto pt-4 flex items-end justify-between border-t border-slate-100 mt-4">
            <span className="text-[11px] uppercase tracking-wide text-slate-500 font-bold">
              Average na score
            </span>
            <span className="font-heading font-extrabold text-2xl text-teal tabular-nums">
              {avgScore}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
