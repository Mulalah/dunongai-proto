// Soft, legible chips. "level" stays a confident solid teal because it's the
// primary signal on story cards; "new" keeps its playful tilted gold tag.
const VARIANTS = {
  level: 'bg-teal text-white',
  status: 'bg-slate-100 text-slate-600',
  language: 'bg-violet-100 text-violet-700',
  new: 'bg-gold text-navy -rotate-2 shadow-sm',
  success: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-700',
  danger: 'bg-rose-50 text-rose-700'
};

export default function Badge({ children, variant = 'status', className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-heading font-bold uppercase tracking-wide ${
        VARIANTS[variant] || VARIANTS.status
      } ${className}`}
    >
      {children}
    </span>
  );
}
