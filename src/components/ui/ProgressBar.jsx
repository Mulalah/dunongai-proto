import { useEffect, useState } from 'react';

const COLORS = {
  teal: 'from-teal to-emerald-400',
  gold: 'from-gold to-amber-400',
  green: 'from-emerald-500 to-emerald-300',
  red: 'from-red-500 to-orange-400',
  navy: 'from-navy to-slate-700'
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
  useEffect(() => {
    const t = setTimeout(() => setW(Math.min(100, Math.max(0, value))), 60);
    return () => clearTimeout(t);
  }, [value]);

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercent) && (
        <div className="flex items-center justify-between mb-1.5 text-xs font-semibold">
          {label && <span className="text-slate-600">{label}</span>}
          {showPercent && <span className="text-slate-500">{Math.round(value)}%</span>}
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${SIZES[size]}`}>
        <div
          className={`h-full rounded-full bg-gradient-to-r ${COLORS[color] || COLORS.teal} transition-all duration-700`}
          style={{ width: `${w}%` }}
        />
      </div>
    </div>
  );
}
