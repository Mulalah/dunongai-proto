import Badge from '../ui/Badge';
import Icon from '../ui/Icon';
import ReadingLevelBadge from '../ui/ReadingLevelBadge';

// Deeper, brand-adjacent cover tints (no candy rainbow). Deterministic per card
// so a story always wears the same color.
const GRADIENTS = [
  'from-teal-500 to-teal-800',
  'from-amber-400 to-orange-600',
  'from-sky-500 to-indigo-700',
  'from-rose-400 to-rose-700',
  'from-emerald-500 to-teal-700',
  'from-violet-500 to-indigo-700'
];

export default function StoryCard({ story, onSelect, completed = false, stars = 0, index = 0 }) {
  const gradient = story.gradient || GRADIENTS[index % GRADIENTS.length];
  return (
    <button
      onClick={() => onSelect?.(story)}
      className="group text-left bg-white border border-slate-200/70 rounded-2xl shadow-card overflow-hidden card-hover cursor-pointer w-full"
    >
      {/* Thumbnail */}
      <div
        className={`relative h-[160px] bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_18%,rgba(255,255,255,0.28),transparent_62%)]" />
        <div className="text-[56px] drop-shadow-md transition-transform duration-300 group-hover:scale-110">
          {story.emoji || '📖'}
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/85 via-navy/40 to-transparent p-3 pt-8">
          <div className="font-heading font-bold text-white text-base leading-tight line-clamp-2 drop-shadow-sm">
            {story.title}
          </div>
        </div>
        {completed ? (
          <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/95 text-emerald-600 flex items-center justify-center shadow-sm">
            <Icon name="check" size={16} strokeWidth={2.5} />
          </div>
        ) : (
          <div className="absolute top-3 right-3">
            <Badge variant="new">BAGO!</Badge>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2.5">
          <ReadingLevelBadge level={story.level} />
          <Badge variant="language">{story.language}</Badge>
        </div>
        <div className="flex items-center gap-1 text-sm">
          {Array.from({ length: 5 }).map((_, i) => (
            <Icon
              key={i}
              name="star"
              size={16}
              strokeWidth={i < stars ? 0 : 1.75}
              className={i < stars ? 'text-gold fill-gold' : 'text-slate-300'}
              fill={i < stars ? 'currentColor' : 'none'}
            />
          ))}
          <span className="ml-2 text-xs text-slate-500">
            {completed ? 'Tapos na' : 'Hindi pa nasimulan'}
          </span>
        </div>
      </div>
    </button>
  );
}
