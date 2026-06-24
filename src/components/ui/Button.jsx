// Confident, mostly-flat brand fills. The teal "primary" is the workhorse; the
// gold "gold" variant is reserved for the one celebratory action on a screen
// (finish reading, see progress) and keeps a soft glow.
const VARIANTS = {
  primary:
    'bg-teal text-white shadow-sm hover:bg-teal-600 active:bg-teal-700',
  gold:
    'bg-gold text-navy shadow-glow-gold hover:bg-gold-600 active:bg-amber-600',
  secondary:
    'bg-white text-navy border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-xs',
  ghost: 'bg-transparent text-navy hover:bg-slate-100',
  danger: 'bg-rose-500 text-white shadow-sm hover:bg-rose-600 active:bg-rose-700'
};

const SIZES = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-[52px] px-7 text-base'
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  className = '',
  children,
  ...rest
}) {
  const isDisabled = disabled || loading;
  return (
    <button
      {...rest}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={`inline-flex items-center justify-center gap-2 font-heading font-semibold rounded-xl btn-press transition ${
        VARIANTS[variant] || VARIANTS.primary
      } ${SIZES[size] || SIZES.md} ${
        isDisabled ? 'opacity-55 cursor-not-allowed saturate-50' : ''
      } ${className}`}
    >
      {loading ? (
        <>
          <span className="inline-block w-4 h-4 rounded-full border-2 border-current border-r-transparent border-b-transparent animate-spin" />
          <span>{children}</span>
        </>
      ) : (
        <>
          {icon && <span className="-ml-0.5 flex items-center">{icon}</span>}
          <span>{children}</span>
        </>
      )}
    </button>
  );
}
