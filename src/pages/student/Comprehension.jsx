import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import TopBar from '../../components/layout/TopBar';
import QuestionCard from '../../components/student/QuestionCard';
import Button from '../../components/ui/Button';
import ProgressBar from '../../components/ui/ProgressBar';
import { evaluateAnswer, generateQuestions, isDemoMode } from '../../utils/claude';

export default function Comprehension() {
  const navigate = useNavigate();
  const stored = JSON.parse(sessionStorage.getItem('reading_session') || '{}');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const qs = await generateQuestions(stored.storyText || '', stored.level || 3);
      if (!cancelled) {
        setQuestions(qs);
        setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setAnswer(val) {
    setAnswers((a) => ({ ...a, [step]: val }));
  }

  const total = questions.length;
  const isLast = step === total - 1;
  const current = questions[step];
  const userAnswer = answers[step];
  const ready =
    !!userAnswer && (typeof userAnswer === 'string' ? userAnswer.trim().length > 0 : true);

  async function next() {
    if (!isLast) {
      setStep((s) => s + 1);
      return;
    }
    setSubmitting(true);
    // Evaluate each answer
    const results = [];
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const a = answers[i] || '';
      let evalResult;
      if (q.type === 'mc') {
        const correct = a === q.answer;
        evalResult = {
          result: correct ? 'correct' : 'incorrect',
          feedback: correct
            ? 'Tama! Magaling ang iyong pagkakaintindi.'
            : `Halos tama! Ang sagot ay "${q.answer}".`
        };
      } else {
        evalResult = await evaluateAnswer(q.question, a, stored.storyText || '');
      }
      results.push({
        question: q.question,
        type: q.type,
        userAnswer: a,
        correctAnswer: q.answer || null,
        ...evalResult
      });
    }
    const correctCount = results.filter((r) => r.result === 'correct').length;
    const score = Math.round((correctCount / results.length) * 100);
    sessionStorage.setItem(
      'session_results',
      JSON.stringify({
        ...stored,
        results,
        score,
        correct: correctCount,
        total: results.length
      })
    );
    navigate('/student/complete');
  }

  return (
    <PageWrapper role="student">
      <TopBar
        title="Mga Tanong 🤔"
        subtitle={total ? `Tanong ${step + 1} ng ${total}` : 'Inihahanda ang mga tanong…'}
      />
      <div className="p-8 max-w-3xl mx-auto">
        {loading ? (
          <div className="bg-white rounded-2xl shadow-card p-7">
            <div className="skeleton h-3 w-24 mb-4" />
            <div className="skeleton h-6 w-3/4 mb-6" />
            <div className="space-y-3">
              <div className="skeleton h-12 w-full" />
              <div className="skeleton h-12 w-full" />
              <div className="skeleton h-12 w-full" />
              <div className="skeleton h-12 w-full" />
            </div>
            <div className="mt-6 text-center text-sm text-slate-500">
              {isDemoMode() ? 'Demo mode: bumubuo ng mga tanong…' : 'Bumubuo ng mga tanong gamit ang AI…'}
            </div>
          </div>
        ) : (
          <>
            <ProgressBar value={(step / total) * 100 + 100 / total} />
            <div className="mt-6">
              <QuestionCard
                question={current}
                questionNumber={step + 1}
                total={total}
                userAnswer={userAnswer}
                onAnswer={setAnswer}
              />
            </div>
            <div className="mt-6 flex justify-between">
              <Button
                variant="ghost"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
              >
                ← Nakaraan
              </Button>
              <Button onClick={next} disabled={!ready} loading={submitting} size="lg">
                {isLast ? 'I-submit →' : 'Susunod na Tanong →'}
              </Button>
            </div>
          </>
        )}
      </div>
    </PageWrapper>
  );
}
