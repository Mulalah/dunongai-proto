// Live AI runs through the serverless proxy at /api/claude (key stays server-side).
// Toggle with VITE_AI_ENABLED=true; otherwise the app uses curated demo fallbacks.
const DEMO_MODE = import.meta.env.VITE_AI_ENABLED !== 'true';

export const isDemoMode = () => DEMO_MODE;

const FALLBACKS = {
  diagnosticLevel: { level: 3, rationale: 'Demo mode: Placed at Grade 3' },

  questions: [
    {
      type: 'mc',
      question: 'Saan pumunta sina Lolo Pedro at Benjo?',
      options: ['Sa taniman', 'Sa palengke', 'Sa eskuwelahan', 'Sa simbahan'],
      answer: 'Sa taniman'
    },
    {
      type: 'mc',
      question: 'Ano ang kanilang ginawa sa taniman?',
      options: ['Naglaro', 'Nag-aani ng gulay', 'Nagluto', 'Nagpahinga'],
      answer: 'Nag-aani ng gulay'
    },
    {
      type: 'mc',
      question: 'Sino si Benjo para kay Lolo Pedro?',
      options: ['Anak', 'Kaibigan', 'Apo', 'Kapitbahay'],
      answer: 'Apo'
    },
    {
      type: 'open',
      question: 'Bakit masaya ang pag-aani para kina Lolo Pedro at Benjo?'
    },
    {
      type: 'open',
      question: 'Ano ang natutunan mo mula sa kwentong ito?'
    }
  ],

  evaluation: {
    result: 'correct',
    feedback: 'Napakagaling! Maliwanag ang iyong pagkaunawa sa kwento.'
  },

  levelAdjust: { action: 'advance', reason: 'Demo: excellent score' },

  summary:
    'Si [name] ay nasa Antas 3. Sa nakaraang linggo, nakumpleto niya ang 3 kwento na may average na 72% comprehension score. Inirerekomenda: dagdag na practice sa inference questions bago i-advance sa Antas 4.',

  basaBot:
    'Ang salitang iyon ay isang magandang salitang Filipino! Subukan mong gamitin ito sa pangungusap. (Demo mode — ikonekta ang Claude API para sa tunay na sagot)'
};

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callProxy({ system, messages, max_tokens = 1024 }) {
  const response = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ system, messages, max_tokens })
  });
  if (!response.ok) throw new Error('Claude API error: ' + response.status);
  const data = await response.json();
  return data.content?.[0]?.text || '';
}

async function callClaude(systemPrompt, userMessage, maxTokens = 1024) {
  return callProxy({
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
    max_tokens: maxTokens
  });
}

function tryParseJSON(text) {
  if (!text) return null;
  const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

export async function assessReadingLevel(answers) {
  if (DEMO_MODE) {
    await delay(1500);
    return FALLBACKS.diagnosticLevel;
  }
  try {
    const text = await callClaude(
      'You are an expert in K-6 Filipino reading assessment. Given a student\'s diagnostic answers, return JSON: {"level": 1-6, "rationale": "string"}. Reply with only JSON.',
      `Answers: ${JSON.stringify(answers)}`,
      512
    );
    const parsed = tryParseJSON(text);
    return parsed || FALLBACKS.diagnosticLevel;
  } catch (e) {
    console.warn('assessReadingLevel fallback:', e);
    return FALLBACKS.diagnosticLevel;
  }
}

export async function generateQuestions(storyText, level) {
  if (DEMO_MODE) {
    await delay(1500);
    return FALLBACKS.questions;
  }
  try {
    const text = await callClaude(
      `You are creating reading-comprehension questions for a Grade ${level} Filipino student. Mix 3 multiple-choice and 2 open-ended. Reply with only JSON array: [{"type":"mc","question":"...","options":["..."],"answer":"..."},{"type":"open","question":"..."}]`,
      `Story: ${storyText}`,
      1500
    );
    const parsed = tryParseJSON(text);
    return Array.isArray(parsed) && parsed.length >= 4 ? parsed : FALLBACKS.questions;
  } catch (e) {
    console.warn('generateQuestions fallback:', e);
    return FALLBACKS.questions;
  }
}

export async function evaluateAnswer(question, answer, context) {
  if (DEMO_MODE) {
    await delay(1500);
    return FALLBACKS.evaluation;
  }
  try {
    const text = await callClaude(
      'You are a kind Filipino reading teacher. Evaluate the answer. Reply ONLY with JSON: {"result":"correct|partial|incorrect","feedback":"warm Filipino feedback (1-2 sentences)"}',
      `Question: ${question}\nStudent Answer: ${answer}\nStory Context: ${context}`,
      400
    );
    const parsed = tryParseJSON(text);
    return parsed || FALLBACKS.evaluation;
  } catch (e) {
    console.warn('evaluateAnswer fallback:', e);
    return FALLBACKS.evaluation;
  }
}

export async function adjustLevel(level, score, history) {
  if (DEMO_MODE) {
    await delay(1500);
    return score >= 80
      ? { action: 'advance', reason: 'Demo: excellent score' }
      : score < 50
      ? { action: 'stepback', reason: 'Demo: needs more practice' }
      : { action: 'maintain', reason: 'Demo: solid performance, stay at level' };
  }
  try {
    const text = await callClaude(
      'Decide level adjustment for K-6 Filipino reader. Reply ONLY JSON: {"action":"advance|maintain|stepback","reason":"..."}',
      `Current level: ${level}\nLatest score: ${score}\nHistory: ${JSON.stringify(history)}`,
      300
    );
    const parsed = tryParseJSON(text);
    return parsed || FALLBACKS.levelAdjust;
  } catch (e) {
    console.warn('adjustLevel fallback:', e);
    return FALLBACKS.levelAdjust;
  }
}

export async function generateStudentSummary(studentData) {
  if (DEMO_MODE) {
    await delay(1500);
    return FALLBACKS.summary.replace('[name]', studentData?.displayName || 'ang estudyante');
  }
  try {
    const text = await callClaude(
      'You are a teacher assistant. Write a short Filipino+English mixed summary (3-4 sentences) about the student\'s reading progress, strengths, and one recommendation. No JSON, just text.',
      `Student: ${JSON.stringify(studentData)}`,
      500
    );
    return (
      text || FALLBACKS.summary.replace('[name]', studentData?.displayName || 'ang estudyante')
    );
  } catch (e) {
    console.warn('generateStudentSummary fallback:', e);
    return FALLBACKS.summary.replace('[name]', studentData?.displayName || 'ang estudyante');
  }
}

export async function basaBotChat(message, storyContext, history = []) {
  if (DEMO_MODE) {
    await delay(1200);
    const tagalogVocab = {
      galapong: 'Ang "galapong" ay ginawa mula sa bigas na binabad, ito ang base ng bibingka at puto. 🍚',
      bibingka: 'Ang "bibingka" ay isang Filipino rice cake na niluluto sa dahon ng saging tuwing Pasko. 🎄',
      taniman: 'Ang "taniman" ay lugar kung saan tumutubo ang mga halaman tulad ng gulay o bigas. 🌱',
      saranggola: 'Ang "saranggola" ay isang larong Pilipino — gawa sa kawayan at papel, pinapalipad sa hangin! 🪁',
      apo: 'Ang "apo" ay anak ng iyong anak — ikaw ay apo ng iyong lolo at lola. 👴👵'
    };
    const lower = message.toLowerCase();
    for (const [key, val] of Object.entries(tagalogVocab)) {
      if (lower.includes(key)) return val;
    }
    return FALLBACKS.basaBot;
  }
  try {
    const messages = [
      ...history.slice(-6).map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: message }
    ];
    const text = await callProxy({
      system: `You are Basa Bot — a friendly reading buddy for Filipino kids in Grades K-6. Reply in warm, simple Filipino (or mixed English) under 3 sentences. Use emojis sparingly. Story context: ${storyContext}`,
      messages,
      max_tokens: 400
    });
    return text || FALLBACKS.basaBot;
  } catch (e) {
    console.warn('basaBotChat fallback:', e);
    return FALLBACKS.basaBot;
  }
}
