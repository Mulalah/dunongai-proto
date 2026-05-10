import { useState } from 'react';
import { generateStudentSummary, isDemoMode } from '../../utils/claude';
import Button from '../ui/Button';

export default function AISummaryCard({ student, sessions = [] }) {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedAt, setGeneratedAt] = useState(null);

  async function generate() {
    setLoading(true);
    try {
      const text = await generateStudentSummary({
        displayName: student?.displayName,
        currentLevel: student?.currentLevel,
        recentScores: student?.recentScores,
        sessions: sessions.slice(0, 5).map((s) => ({
          score: s.score,
          stars: s.stars,
          title: s.storyTitle
        }))
      });
      setSummary(text);
      setGeneratedAt(new Date());
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-card p-6 border-l-4 border-gold">
        <div className="flex items-center gap-2 text-gold font-heading font-bold mb-4">
          <span className="text-xl">✨</span>
          <span>Ginagawa ng AI ang summary…</span>
        </div>
        <div className="space-y-2">
          <div className="skeleton h-3 w-full" />
          <div className="skeleton h-3 w-11/12" />
          <div className="skeleton h-3 w-10/12" />
          <div className="skeleton h-3 w-9/12" />
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="bg-white rounded-2xl shadow-card p-6 text-center">
        <div className="text-3xl mb-2">✨</div>
        <h3 className="font-heading font-bold text-navy text-lg mb-1">AI Summary</h3>
        <p className="text-sm text-slate-500 mb-4">
          Bumuo ng AI-powered na pagsusuri tungkol sa progreso ni {student?.displayName}.
        </p>
        <Button variant="gold" icon="✨" onClick={generate}>
          Gumawa ng AI Summary
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-card p-6 border-l-4 border-gold relative">
      {isDemoMode() && (
        <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-gold/15 text-gold text-[10px] font-bold uppercase tracking-wide">
          Demo Mode
        </span>
      )}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">🤖</span>
        <h3 className="font-heading font-bold text-navy">AI Summary</h3>
      </div>
      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{summary}</p>
      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={generate}
          className="text-xs text-teal font-semibold hover:underline"
        >
          🔄 I-refresh
        </button>
        <div className="text-[11px] text-slate-400">
          {generatedAt ? `Generated ${generatedAt.toLocaleTimeString()}` : ''}
        </div>
      </div>
    </div>
  );
}
