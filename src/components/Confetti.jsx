const COLORS = ['#0D9488', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#3B82F6'];

export default function Confetti({ count = 24 }) {
  const dots = Array.from({ length: count }).map((_, i) => {
    const left = Math.random() * 100;
    const delay = Math.random() * 4;
    const duration = 4 + Math.random() * 4;
    const size = 8 + Math.random() * 8;
    const color = COLORS[i % COLORS.length];
    return { left, delay, duration, size, color, key: i };
  });
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {dots.map((d) => (
        <span
          key={d.key}
          className="confetti-dot"
          style={{
            left: `${d.left}%`,
            top: '-10%',
            background: d.color,
            width: d.size,
            height: d.size,
            animationDelay: `${d.delay}s`,
            animationDuration: `${d.duration}s`
          }}
        />
      ))}
    </div>
  );
}
