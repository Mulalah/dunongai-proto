import Icon from '../ui/Icon';
import { weeklyRecap } from '../../utils/insights';

// Warm, shareable "here's the week" card for parents. Computed locally from the
// child's sessions, so it always renders (even in DEMO_MODE).
export default function WeeklyRecapCard({ sessions = [], progress = {}, childName = 'ang bata' }) {
  const { storiesThisWeek, avgScore, trendDelta, streak, nextGoal, narrative } = weeklyRecap(
    sessions,
    progress,
    childName
  );

  const trendUp = trendDelta > 0;
  const trendFlat = trendDelta === 0;

  return (
    <div
      className="rounded-2xl p-6 text-white shadow-card relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0D4A4A 0%, #0D9488 100%)' }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
          <Icon name="sparkles" size={18} />
        </span>
        <h3 className="font-heading font-bold text-lg">Lingguhang Ulat</h3>
      </div>

      <p className="text-sm text-white/90 leading-relaxed mb-4">{narrative}</p>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-white/10 p-3 text-center">
          <div className="font-heading font-extrabold text-2xl tabular-nums">{storiesThisWeek}</div>
          <div className="text-[11px] uppercase tracking-wide text-white/70">Kwento</div>
        </div>
        <div className="rounded-xl bg-white/10 p-3 text-center">
          <div className="font-heading font-extrabold text-2xl tabular-nums flex items-center justify-center gap-1">
            {avgScore}%
            {!trendFlat && (
              <Icon
                name="trendingUp"
                size={15}
                className={trendUp ? 'text-emerald-300' : 'text-rose-300 rotate-180'}
              />
            )}
          </div>
          <div className="text-[11px] uppercase tracking-wide text-white/70">Average</div>
        </div>
        <div className="rounded-xl bg-white/10 p-3 text-center">
          <div className="font-heading font-extrabold text-2xl tabular-nums flex items-center justify-center gap-1">
            {streak} <Icon name="flame" size={16} className="text-amber-300" />
          </div>
          <div className="text-[11px] uppercase tracking-wide text-white/70">Streak</div>
        </div>
      </div>

      <div className="mt-4 flex items-start gap-2 text-sm text-white/90">
        <Icon name="target" size={16} className="mt-0.5 shrink-0 text-amber-300" />
        <span>{nextGoal}</span>
      </div>
    </div>
  );
}
