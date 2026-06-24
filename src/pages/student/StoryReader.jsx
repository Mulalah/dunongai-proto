import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import BasaBotPanel from '../../components/student/BasaBotPanel';
import Badge from '../../components/ui/Badge';
import Icon from '../../components/ui/Icon';
import ReadingLevelBadge from '../../components/ui/ReadingLevelBadge';
import { formatTime } from '../../utils/levelUtils';
import { getStoryById } from '../../utils/stories';

function renderStory(text, tapWords, onTap) {
  if (!text) return null;
  const paragraphs = text.split(/\n\s*\n/);
  return paragraphs.map((p, idx) => {
    let parts = [p];
    (tapWords || []).forEach((w) => {
      const next = [];
      parts.forEach((piece) => {
        if (typeof piece !== 'string') {
          next.push(piece);
          return;
        }
        const re = new RegExp(`(${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'i');
        const split = piece.split(re);
        split.forEach((s, i) => {
          if (i % 2 === 1) {
            next.push(
              <span
                key={`${idx}-${w}-${i}-${Math.random()}`}
                className="tap-word"
                onClick={() => onTap(s)}
              >
                {s}
              </span>
            );
          } else if (s) {
            next.push(s);
          }
        });
      });
      parts = next;
    });
    return <p key={idx}>{parts}</p>;
  });
}

export default function StoryReader() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seconds, setSeconds] = useState(0);
  const botRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const found = await getStoryById(id);
        if (!cancelled) setStory(found);
      } catch {
        if (!cancelled) setStory(null);
      }
      if (!cancelled) setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  function handleTapWord(word) {
    botRef.current?.askAbout(word);
  }

  function finish() {
    sessionStorage.setItem(
      'reading_session',
      JSON.stringify({
        storyId: story.id,
        storyTitle: story.title,
        storyText: story.text,
        level: story.level,
        durationSec: seconds
      })
    );
    navigate('/student/questions');
  }

  return (
    <div className="min-h-screen flex bg-[#f4f6f9]">
      <Sidebar />
      <main className="flex-1 md:ml-[260px] flex flex-col min-h-screen lg:h-screen lg:overflow-hidden">
        {/* Custom top bar */}
        <div className="on-dark h-14 bg-navy text-white flex items-center justify-between pl-16 pr-4 md:px-5 sticky top-0 z-30">
          <button
            onClick={() => navigate('/student/library')}
            className="flex items-center gap-1.5 text-sm font-heading font-semibold text-white/80 hover:text-white transition"
          >
            <Icon name="arrowLeft" size={18} /> Bumalik
          </button>
          <div className="font-heading font-semibold text-sm truncate max-w-md">
            {loading ? '…' : story?.title}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-white/70 tabular-nums">
            <Icon name="clock" size={15} /> {formatTime(seconds)}
          </div>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row lg:min-h-0 lg:overflow-hidden">
          {/* Reading panel */}
          <div className="bg-white lg:flex-1 lg:overflow-y-auto">
            <div className="px-5 py-8 sm:px-8 lg:px-14 lg:py-12 max-w-[760px] mx-auto">
              {loading ? (
                <div className="space-y-3">
                  <div className="skeleton h-8 w-2/3" />
                  <div className="skeleton h-4 w-1/3" />
                  <div className="skeleton h-3 w-full mt-6" />
                  <div className="skeleton h-3 w-11/12" />
                  <div className="skeleton h-3 w-10/12" />
                </div>
              ) : !story ? (
                <div className="text-center text-slate-500 py-16">
                  <div className="text-3xl mb-2">📭</div>
                  Hindi nahanap ang kwentong ito.
                </div>
              ) : (
                <article className="page-enter">
                  <h1 className="font-heading font-bold text-navy text-3xl leading-tight">
                    {story.title}
                  </h1>
                  <div className="mt-3 flex items-center gap-2">
                    <ReadingLevelBadge level={story.level} />
                    <Badge variant="language">{story.language}</Badge>
                    <span className="text-xs text-slate-400 italic">— {story.author}</span>
                  </div>
                  <div className="mt-2 h-1 w-10 rounded bg-gold" />

                  <div className="reading-text mt-8">
                    {renderStory(story.text, story.tapWords, handleTapWord)}
                  </div>

                  <div className="mt-12 text-center">
                    <button
                      onClick={finish}
                      className="inline-flex items-center gap-2 h-[52px] px-8 rounded-xl bg-gold hover:bg-gold-600 text-navy font-heading font-bold shadow-glow-gold btn-press transition"
                    >
                      Tapos na Basahin!
                      <Icon name="check" size={20} strokeWidth={2.5} />
                    </button>
                  </div>
                </article>
              )}
            </div>
          </div>

          {/* Basa Bot */}
          <BasaBotPanel ref={botRef} storyContext={story?.text || ''} />
        </div>
      </main>
    </div>
  );
}
