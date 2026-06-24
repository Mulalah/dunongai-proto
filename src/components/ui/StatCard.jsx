import Icon from './Icon';

const COLORS = {
  navy: { border: 'border-t-navy', bg: 'bg-navy/10', text: 'text-navy' },
  teal: { border: 'border-t-teal', bg: 'bg-teal/10', text: 'text-teal' },
  gold: { border: 'border-t-gold', bg: 'bg-gold/10', text: 'text-gold-600' },
  green: { border: 'border-t-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-600' },
  red: { border: 'border-t-rose-500', bg: 'bg-rose-50', text: 'text-rose-600' },
  purple: { border: 'border-t-violet-500', bg: 'bg-violet-50', text: 'text-violet-600' }
};

export default function StatCard({ icon, label, value, trend, color = 'teal', loading = false, badge }) {
  const c = COLORS[color] || COLORS.teal;
  return (
    <div
      className={`bg-white border border-slate-200/70 rounded-2xl shadow-card p-5 border-t-4 ${c.border} relative`}
    >
      {badge !== undefined && badge > 0 && (
        <span className="absolute top-3 right-3 inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-rose-500 text-white text-[11px] font-bold">
          {badge}
        </span>
      )}
      <div className={`w-10 h-10 rounded-xl ${c.bg} ${c.text} flex items-center justify-center mb-3`}>
        <Icon name={icon} size={20} />
      </div>
      {loading ? (
        <>
          <div className="skeleton h-7 w-20 mb-2" />
          <div className="skeleton h-3 w-24" />
        </>
      ) : (
        <>
          <div className="font-heading font-extrabold text-3xl text-navy leading-none tabular-nums">
            {value}
          </div>
          <div className="mt-1.5 text-xs uppercase tracking-wide text-slate-500 font-semibold">
            {label}
          </div>
          {trend !== undefined && trend !== null && (
            <div
              className={`mt-2 text-xs font-semibold flex items-center gap-1 ${
                trend >= 0 ? 'text-emerald-600' : 'text-rose-500'
              }`}
            >
              <Icon name="trendingUp" size={14} className={trend >= 0 ? '' : 'rotate-180'} />
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
