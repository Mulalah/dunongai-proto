import { useCallback, useEffect, useRef, useState } from 'react';

// Thin wrapper over the Web Speech API for read-aloud story narration.
// Prefers a Filipino voice (fil-PH / tl-PH); degrades gracefully when unsupported.
export default function useSpeech() {
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
  const supported = !!synth;
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const voiceRef = useRef(null);

  useEffect(() => {
    if (!supported) return;
    function pickVoice() {
      const voices = synth.getVoices();
      voiceRef.current =
        voices.find((v) => /fil|tl[-_]?PH|Filipino|Tagalog/i.test(`${v.lang} ${v.name}`)) ||
        voices.find((v) => v.lang?.toLowerCase().startsWith('en')) ||
        voices[0] ||
        null;
    }
    pickVoice();
    synth.addEventListener?.('voiceschanged', pickVoice);
    return () => synth.removeEventListener?.('voiceschanged', pickVoice);
  }, [supported, synth]);

  const stop = useCallback(() => {
    if (!supported) return;
    synth.cancel();
    setSpeaking(false);
    setPaused(false);
  }, [supported, synth]);

  const speak = useCallback(
    (text) => {
      if (!supported || !text) return;
      synth.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      if (voiceRef.current) {
        utter.voice = voiceRef.current;
        utter.lang = voiceRef.current.lang;
      }
      utter.rate = 0.9; // a touch slower for young readers
      utter.onend = () => {
        setSpeaking(false);
        setPaused(false);
      };
      utter.onerror = () => {
        setSpeaking(false);
        setPaused(false);
      };
      synth.speak(utter);
      setSpeaking(true);
      setPaused(false);
    },
    [supported, synth]
  );

  const pause = useCallback(() => {
    if (!supported) return;
    if (synth.speaking && !synth.paused) {
      synth.pause();
      setPaused(true);
    } else if (synth.paused) {
      synth.resume();
      setPaused(false);
    }
  }, [supported, synth]);

  // Stop narration if the component using the hook unmounts.
  useEffect(() => () => synth?.cancel(), [synth]);

  return { supported, speaking, paused, speak, pause, stop };
}
