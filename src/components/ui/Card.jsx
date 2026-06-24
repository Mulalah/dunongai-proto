export default function Card({ children, className = '', hover = false, gradient = false, ...rest }) {
  const base = gradient
    ? 'bg-gradient-to-br from-teal to-teal-700 text-white border-transparent'
    : 'bg-white text-navy border-slate-200/70';
  return (
    <div
      {...rest}
      className={`${base} border rounded-2xl shadow-card p-6 ${hover ? 'card-hover' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
