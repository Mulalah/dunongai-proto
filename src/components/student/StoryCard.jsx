import Badge from '../ui/Badge';

const GRADIENTS = [
  'from-emerald-400 to-teal-600',
  'from-amber-300 to-orange-500',
  'from-yellow-300 to-amber-500',
  'from-pink-300 to-rose-500',
  'from-sky-300 to-blue-600',
  'from-cyan-400 to-indigo-600'
];

export default function StoryCard({ story, onSelect, completed = false, stars = 0, index = 0 }) {
  const gradient = story.gradient || GRADIENTS[index % GRADIENTS.length];
  return (
    <button
      onClick={() => onSelect?.(story)}
      className="group text-left bg-white rounded-2xl shadow-card overflow-hidden card-hover cursor-pointer w-full"
    >
      {/* Thumbnail */}
      <div
        className={`relative h-[160px] bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_60%)]" />
        <div className="text-6xl drop-shadow-lg">{story.emoji || '📖'}</div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
          <div className="font-heading font-bold text-white text-base leading-tight line-clamp-2 drop-shadow">
            {story.title}
          </div>
        </div>
        {!completed && (
          <div className="absolute top-3 right-3">
            <Badge variant="new">BAGO!</Badge>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="level">Antas {story.level}</Badge>
          <Badge variant="language">{story.language}</Badge>
        </div>
        <div className="flex items-center gap-1 text-sm">
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className={i < stars ? 'text-gold' : 'text-slate-200'}
              aria-hidden="true"
            >
              ★
            </span>
          ))}
          <span className="ml-2 text-xs text-slate-500">{completed ? 'Tapos na' : 'Hindi pa nasimulan'}</span>
        </div>
      </div>
    </button>
  );
}
