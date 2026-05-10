export default function QuestionCard({
  question,
  questionNumber,
  total,
  onAnswer,
  userAnswer
}) {
  const isMC = question.type === 'mc';

  return (
    <div className="bg-white rounded-2xl shadow-card p-7 page-enter">
      <div className="flex items-center justify-between mb-5">
        <div className="text-xs uppercase tracking-wide text-teal font-bold">
          Tanong {questionNumber} ng {total}
        </div>
        <div className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold">
          {isMC ? 'Multiple Choice' : 'Open-ended'}
        </div>
      </div>

      <h3 className="font-heading font-bold text-xl text-navy leading-snug mb-6">
        {question.question}
      </h3>

      {isMC ? (
        <div className="space-y-3">
          {question.options.map((opt, i) => {
            const selected = userAnswer === opt;
            return (
              <button
                key={i}
                onClick={() => onAnswer(opt)}
                className={`w-full text-left px-5 py-4 rounded-xl border-2 font-heading font-semibold transition btn-press ${
                  selected
                    ? 'border-teal bg-gradient-to-r from-teal to-teal-600 text-white shadow-glow-teal'
                    : 'border-slate-200 bg-white text-navy hover:border-teal/50 hover:bg-teal/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold ${
                      selected
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {selected ? '✓' : String.fromCharCode(65 + i)}
                  </span>
                  <span>{opt}</span>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <textarea
          value={userAnswer || ''}
          onChange={(e) => onAnswer(e.target.value)}
          rows={5}
          placeholder="Isulat ang iyong sagot dito…"
          className="w-full min-h-[120px] p-4 rounded-xl border-2 border-slate-200 focus:border-teal focus:outline-none font-body text-base text-navy resize-none transition"
        />
      )}
    </div>
  );
}
