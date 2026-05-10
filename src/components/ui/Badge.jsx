const VARIANTS = {
  level: 'bg-gradient-to-r from-teal to-teal-600 text-white',
  status: 'bg-slate-100 text-slate-700',
  language: 'bg-violet-100 text-violet-700',
  new: 'bg-gradient-to-r from-gold to-amber-500 text-navy -rotate-3 shadow-md',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-800',
  danger: 'bg-red-100 text-red-700'
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
