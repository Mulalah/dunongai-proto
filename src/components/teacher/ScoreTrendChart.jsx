import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid
} from 'recharts';
import Icon from '../ui/Icon';

export default function ScoreTrendChart({ sessions = [] }) {
  if (!sessions || sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
        <div className="w-14 h-14 mb-3 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
          <Icon name="chartBar" size={26} />
        </div>
        <div className="font-heading font-semibold text-navy">Wala pang sapat na data</div>
        <div className="text-xs mt-1">Magpapakita kapag may 2+ sessions ang estudyante.</div>
      </div>
    );
  }

  const data = sessions
    .slice()
    .sort((a, b) => (a.completedAt?.seconds || 0) - (b.completedAt?.seconds || 0))
    .map((s, i) => ({
      week: s.completedAt
        ? `W${i + 1}`
        : `W${i + 1}`,
      label:
        s.completedAt && s.completedAt.toDate
          ? s.completedAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : `Week ${i + 1}`,
      score: s.score || 0
    }));

  return (
    <div style={{ width: '100%', height: 240 }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 10, right: 10, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: '#64748B' }}
            stroke="#CBD5E1"
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: '#64748B' }}
            stroke="#CBD5E1"
          />
          <Tooltip
            contentStyle={{
              borderRadius: 10,
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 12px rgba(10,22,40,0.08)',
              fontSize: 12
            }}
            formatter={(value) => [`${value}%`, 'Score']}
          />
          <ReferenceLine
            y={75}
            stroke="#F59E0B"
            strokeDasharray="6 4"
            label={{ value: '75% Passing', fill: '#D08509', fontSize: 10, position: 'right' }}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#0D9488"
            strokeWidth={3}
            dot={{ r: 5, fill: '#0D9488', strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
