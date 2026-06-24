import { useEffect, useImperativeHandle, useRef, useState, forwardRef } from 'react';
import { basaBotChat, isDemoMode } from '../../utils/claude';
import Icon from '../ui/Icon';

const WELCOME = {
  role: 'bot',
  content:
    'Kumusta! Ako si Basa Bot. 🤖 May mga salitang hindi mo maintindihan? I-type lang at tutulungan kita! Maaari mo rin akong tanungin tungkol sa kwento.'
};

const BasaBotPanel = forwardRef(function BasaBotPanel({ storyContext = '' }, ref) {
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useImperativeHandle(ref, () => ({
    askAbout(word) {
      setInput(`Ano ang ibig sabihin ng "${word}"?`);
      inputRef.current?.focus();
    }
  }));

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing]);

  async function send() {
    const text = input.trim();
    if (!text || typing) return;
    const next = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setInput('');
    setTyping(true);
    try {
      const reply = await basaBotChat(
        text,
        storyContext,
        next.map((m) => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content }))
      );
      setMessages((m) => [...m, { role: 'bot', content: reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: 'bot', content: 'Pasensya na, may problema sa koneksyon. Subukan ulit!' }
      ]);
    } finally {
      setTyping(false);
    }
  }

  return (
    <aside className="w-full lg:w-[360px] flex flex-col h-[70vh] min-h-[400px] lg:h-full lg:min-h-0 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 shrink-0">
      {/* Header */}
      <div
        className="px-5 py-4 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0A1628 0%, #0D9488 100%)' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/15 border border-white/25 flex items-center justify-center text-xl">
            🤖
          </div>
          <div className="flex-1">
            <div className="font-heading font-bold leading-tight">Basa Bot</div>
            <div className="flex items-center gap-1.5 text-xs text-white/70">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Online · Handa magtulong</span>
            </div>
          </div>
          {isDemoMode() && (
            <span className="px-2 py-0.5 rounded-full bg-gold/20 text-gold text-[10px] font-bold uppercase tracking-wide">
              Demo
            </span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 bg-slate-50/40 space-y-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.role === 'bot' ? (
              <div className="max-w-[85%] bg-white border-l-[3px] border-teal rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                <div className="text-[10px] uppercase tracking-wider text-teal font-bold mb-1">
                  Basa Bot
                </div>
                <div className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {m.content}
                </div>
              </div>
            ) : (
              <div className="max-w-[85%] bg-gradient-to-br from-teal to-teal-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 shadow-sm">
                <div className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</div>
              </div>
            )}
          </div>
        ))}
        {typing && (
          <div className="flex justify-start">
            <div className="bg-white border-l-[3px] border-teal rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
              <div className="flex items-center gap-1.5">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-slate-200 bg-white">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="I-type ang tanong mo…"
            className="flex-1 h-11 px-4 rounded-xl bg-slate-100 border border-slate-200 text-sm focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/20 focus:bg-white transition"
          />
          <button
            onClick={send}
            disabled={typing || !input.trim()}
            aria-label="Ipadala"
            className="h-11 w-11 shrink-0 flex items-center justify-center rounded-xl bg-teal hover:bg-teal-600 text-white btn-press transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon name="send" size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
});

export default BasaBotPanel;
