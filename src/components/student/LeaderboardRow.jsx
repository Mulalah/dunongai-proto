const MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉' };

export default function LeaderboardRow({ rank, name, stars, isCurrentUser = false }) {
  const medal = MEDALS[rank];
  const top3Bg =
    rank === 1
      ? 'bg-gradient-to-r from-amber-50 to-yellow-100 border-amber-200'
      : rank === 2
      ? 'bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200'
      : rank === 3
      ? 'bg-gradient-to-r from-orange-50 to-rose-50 border-orange-200'
      : 'bg-white border-slate-100';

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${top3Bg} ${
        isCurrentUser ? 'border-l-4 border-l-teal !bg-teal-50/60' : ''
      }`}
    >
      <div className="w-8 text-center">
        {medal ? (
          <span className="text-xl">{medal}</span>
        ) : (
          <span className="text-sm font-heading font-bold text-slate-500">#{rank}</span>
        )}
      </div>
      <div className="flex-1 font-heading font-semibold text-sm text-navy truncate">
        {name}
        {isCurrentUser && (
          <span className="ml-2 text-[10px] uppercase font-bold text-teal">Ikaw</span>
        )}
      </div>
      <div className="flex items-center gap-1 text-sm font-heading font-bold text-gold">
        <span>{stars}</span>
        <span>⭐</span>
      </div>
    </div>
  );
}
