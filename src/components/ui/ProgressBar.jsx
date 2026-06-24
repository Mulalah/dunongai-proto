import { useEffect, useState } from 'react';

const COLORS = {
  teal: 'bg-teal',
  gold: 'bg-gold',
  green: 'bg-emerald-500',
  red: 'bg-rose-500',
  navy: 'bg-navy'
};

const SIZES = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-3.5' };

export default function ProgressBar({
  value = 0,
  label,
  showPercent = false,
  color = 'teal',
  size = 'md',
  className = ''
}) {
  const [w, setW] = useState(0);
  const pct = Math.min(100, Math.max(0, value));
  useEffect(() => {
    const t = setTimeout(() => setW(pct), 60);
    return () => clearTimeout(t);
  }, [pct]);

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercent) && (
        <div className="flex items-center justify-between mb-1.5 text-xs font-semibold">
          {label && <span className="text-slate-600">{label}</span>}
          {showPercent && <span className="text-slate-500 tabular-nums">{Math.round(pct)}%</span>}
        </div>
      )}
      <div
        className={`w-full bg-slate-100 rounded-full overflow-hidden ${SIZES[size]}`}
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full rounded-full ${COLORS[color] || COLORS.teal} transition-all duration-700 ease-out`}
          style={{ width: `${w}%` }}
        />
      </div>
    </div>
  );
}
