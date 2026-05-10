export default function SkeletonCard({ lines = 3, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl shadow-card p-5 ${className}`}>
      <div className="skeleton h-6 w-2/3 mb-4" />
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton h-3 mb-2"
          style={{ width: `${100 - i * 10}%` }}
        />
      ))}
    </div>
  );
}
