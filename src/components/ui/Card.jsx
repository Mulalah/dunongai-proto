export default function Card({ children, className = '', hover = false, gradient = false, ...rest }) {
  const base = gradient
    ? 'bg-gradient-to-br from-teal to-teal-700 text-white'
    : 'bg-white text-navy';
  return (
    <div
      {...rest}
      className={`${base} rounded-2xl shadow-card p-6 ${hover ? 'card-hover' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
