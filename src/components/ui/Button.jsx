import LoadingSpinner from './LoadingSpinner';

const VARIANTS = {
  primary:
    'bg-gradient-to-r from-teal to-teal-600 text-white shadow-glow-teal hover:from-teal-600 hover:to-teal-700',
  gold:
    'bg-gradient-to-r from-gold to-amber-500 text-navy shadow-glow-gold hover:from-amber-500 hover:to-amber-600',
  secondary:
    'bg-white text-navy border border-slate-200 hover:bg-slate-50 shadow-card',
  ghost: 'bg-transparent text-navy hover:bg-slate-100',
  danger: 'bg-gradient-to-r from-rose-500 to-red-500 text-white hover:from-red-500 hover:to-red-600'
};

const SIZES = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-13 px-6 text-base'
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
      className={`inline-flex items-center justify-center gap-2 font-heading font-semibold rounded-[10px] btn-press transition ${
        VARIANTS[variant] || VARIANTS.primary
      } ${SIZES[size] || SIZES.md} ${
        isDisabled ? 'opacity-60 cursor-not-allowed grayscale' : ''
      } ${size === 'lg' ? 'py-3' : ''} ${className}`}
      style={size === 'lg' ? { height: 52 } : undefined}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="inline-block w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          <span>{children}</span>
        </span>
      ) : (
        <>
          {icon && <span className="text-base">{icon}</span>}
          <span>{children}</span>
        </>
      )}
    </button>
  );
}
