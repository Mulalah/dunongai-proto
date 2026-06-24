import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { assessReadingLevel } from '../../utils/claude';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/ui/Logo';
import Icon from '../../components/ui/Icon';

const QUESTIONS = [
  {
    grade: 1,
    passage: 'Ang pusa ay nasa ilalim ng mesa. Ito ay kulay puti at maliit.',
    question: 'Saan nakaupo ang pusa?',
    options: ['Sa ibabaw ng mesa', 'Sa ilalim ng mesa', 'Sa labas ng bahay', 'Sa loob ng aparador'],
    answer: 'Sa ilalim ng mesa'
  },
  {
    grade: 2,
    passage: 'Si Maria ay tumulong sa kanyang ina sa pagluluto. Naghuhugas siya ng mga gulay sa lababo.',
    question: 'Anong tinatawag ang ginagawa ni Maria?',
    options: ['Naglalakad', 'Naglalaba', 'Naghuhugas', 'Natutulog'],
    answer: 'Naghuhugas'
  },
  {
    grade: 3,
    passage:
      'Bumili si Lola ng prutas sa palengke. May mansanas, mangga, at saging. Pagdating sa bahay, ibinigay niya ang mansanas sa apo niyang si Pia.',
    question: 'Sino ang tumanggap ng mansanas?',
    options: ['Si Lola', 'Si Pia', 'Si Tatay', 'Ang vendor'],
    answer: 'Si Pia'
  },
  {
    grade: 4,
    passage:
      'Hindi nakapunta sa eskuwelahan si Carlo dahil malakas ang ulan. Inabala niya ang sarili sa pagbabasa ng libro tungkol sa mga ibon.',
    question: 'Bakit hindi nakapasok si Carlo?',
    options: ['Tinatamad', 'May sakit', 'Malakas ang ulan', 'Walang baon'],
    answer: 'Malakas ang ulan'
  },
  {
    grade: 5,
    passage:
      'Ang pagbabasa ay parang paglalakbay — bawat libro ay isang bagong lugar na pwede mong tuklasin. Hindi mo kailangang umalis ng bahay para makita ang mundo. Buksan mo lang ang isang pahina, at magsisimula ang biyahe.',
    question: 'Ano ang pangunahing mensahe ng talata?',
    options: [
      'Mahirap maglakbay sa ibang bansa',
      'Ang mga libro ay magagastos',
      'Ang pagbabasa ay nagbibigay ng karanasan na parang paglalakbay',
      'Hindi na kailangan pumasok sa eskuwela'
    ],
    answer: 'Ang pagbabasa ay nagbibigay ng karanasan na parang paglalakbay'
  }
];

export default function DiagnosticQuiz() {
  const navigate = useNavigate();
  const { updateProfile } = useAuth();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const q = QUESTIONS[step];
  const total = QUESTIONS.length;
  const selected = answers[step];
  const isLast = step === total - 1;

  function selectOption(opt) {
    setAnswers((a) => ({ ...a, [step]: opt }));
  }

  async function next() {
    if (!isLast) {
      setStep((s) => s + 1);
      return;
    }
    setSubmitting(true);
    const payload = QUESTIONS.map((qq, i) => ({
      grade: qq.grade,
      question: qq.question,
      answer: answers[i] || '',
      correct: answers[i] === qq.answer
    }));
    const result = await assessReadingLevel(payload);
    sessionStorage.setItem('diagnostic_result', JSON.stringify(result));
    updateProfile({ hasCompletedDiagnostic: true, currentLevel: result.level });
    navigate('/student/level-up');
  }

  if (submitting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-6">
        <div className="text-center page-enter">
          <div className="text-5xl mb-4">🤖</div>
          <h2 className="font-heading font-bold text-navy text-xl mb-2">
            Sinusuri ng AI ang iyong mga sagot…
          </h2>
          <p className="text-slate-500 text-sm mb-4">
            Hinahanap namin ang tamang antas para sa iyo.
          </p>
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-6 py-10">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Logo variant="light" className="h-7 w-auto" />
            <div className="mt-1 text-xs uppercase tracking-wide text-teal font-bold">
              Placement Quiz
            </div>
          </div>
          <div className="flex items-end gap-3">
            <div className="text-right text-sm text-slate-500">
              Tanong {step + 1} ng {total}
            </div>
          </div>
        </div>

        {/* Progress bar segments */}
        <div className="mt-4 flex gap-1.5">
          {QUESTIONS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition ${
                i <= step ? 'bg-teal' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>

        {/* Basa Bot speech bubble */}
        <div className="mt-6 flex items-start gap-3 p-4 rounded-2xl bg-teal-50 border border-teal-100">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal to-teal-600 text-white flex items-center justify-center text-lg shrink-0">
            🤖
          </div>
          <div className="text-sm text-navy">
            <div className="font-heading font-bold mb-0.5">Basa Bot</div>
            Basahin at sagutin ang bawat tanong! 📖 Walang dapat ipangamba — ginagawa ko 'to para makita ang antas mo.
          </div>
        </div>

        {/* Question card */}
        <div className="mt-6 page-enter" key={step}>
          <div className="bg-slate-50 rounded-2xl p-7 border border-slate-100">
            <div className="text-[11px] uppercase tracking-wide text-slate-400 font-bold mb-3">
              Basahin
            </div>
            <p className="font-reading text-[20px] leading-relaxed text-navy">{q.passage}</p>
          </div>

          <h3 className="mt-6 font-heading font-bold text-navy text-lg">{q.question}</h3>

          <div className="mt-4 space-y-3">
            {q.options.map((opt, i) => {
              const sel = selected === opt;
              return (
                <button
                  key={i}
                  onClick={() => selectOption(opt)}
                  className={`w-full text-left px-5 py-3 rounded-xl border-2 font-heading font-semibold btn-press transition ${
                    sel
                      ? 'border-teal bg-teal text-white'
                      : 'border-slate-200 bg-white text-navy hover:border-teal/50 hover:bg-teal/5'
                  }`}
                  style={{ minHeight: 52 }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-sm font-bold ${
                        sel ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {sel ? <Icon name="check" size={16} strokeWidth={2.5} /> : String.fromCharCode(65 + i)}
                    </span>
                    <span>{opt}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <Button onClick={next} disabled={!selected} size="lg">
            {isLast ? 'I-submit →' : 'Susunod →'}
          </Button>
        </div>
      </div>
    </div>
  );
}
