export default function BadgeCard({ badge, locked = false }) {
  return (
    <div
      className={`relative bg-white rounded-2xl p-5 shadow-card text-center transition ${
        locked
          ? 'border-2 border-dashed border-slate-200 grayscale opacity-60'
          : 'border border-gold/40 shadow-glow-gold'
      }`}
    >
      {locked && (
        <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-sm">
          🔒
        </div>
      )}
      <div
        className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center text-3xl mb-3 ${
          locked
            ? 'bg-slate-100'
            : 'bg-gradient-to-br from-gold to-amber-500 shadow-glow-gold'
        }`}
      >
        {badge.icon}
      </div>
      <div className="font-heading font-bold text-sm text-navy">{badge.name}</div>
      <div className="text-[11px] text-slate-500 mt-1">
        {locked ? 'Locked' : badge.description}
      </div>
    </div>
  );
}
