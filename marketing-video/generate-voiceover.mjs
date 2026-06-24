/**
 * Generates the DunongAI ad narration with ElevenLabs TTS and writes one MP3 per
 * scene into public/voiceover/ (overwriting the silent placeholders).
 *
 * Usage:
 *   PowerShell:  $env:ELEVENLABS_API_KEY="sk-..."; npm run voiceover
 *   bash:        ELEVENLABS_API_KEY=sk-... npm run voiceover
 *
 * Optional overrides:
 *   ELEVENLABS_VOICE_ID   (default: Rachel — warm, neutral)
 *   ELEVENLABS_MODEL_ID   (default: eleven_multilingual_v2 — handles the Filipino lines)
 *
 * Then: npm run render
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || "EXAVITQu4vr4xnSDxMaL"; // Sarah (free-tier default)
const MODEL_ID = process.env.ELEVENLABS_MODEL_ID || "eleven_multilingual_v2";
const OUT_DIR = "public/voiceover";

if (!API_KEY) {
  console.error(
    "\n  ✗ Missing ELEVENLABS_API_KEY.\n" +
      '    PowerShell:  $env:ELEVENLABS_API_KEY="sk-..."; npm run voiceover\n' +
      "    bash:        ELEVENLABS_API_KEY=sk-... npm run voiceover\n",
  );
  process.exit(1);
}

// One clip per scene, written to match the scene's frame window in DunongAd.tsx.
const SCENES = [
  {
    file: "scene-1.mp3",
    text: "Every child learns to read at their own pace. But one lesson can’t fit them all. What if reading could adapt — to every single child?",
  },
  {
    file: "scene-2.mp3",
    text: "Meet DunongAI. Basahin Natin Ito. An A.I. reading buddy that adapts to every kindergarten to grade six learner. Children read real Filipino stories, and tap any word for instant, friendly help from Basa Bot.",
  },
  {
    file: "scene-3.mp3",
    text: "DunongAI grows with every reader. Basa Bot explains tricky words in kid-friendly Filipino, right inside the story. A quick diagnostic places each child at the right level, then raises the challenge as they improve. And teachers see everything — with A.I. summaries that flag exactly who needs help.",
  },
  {
    file: "scene-4.mp3",
    text: "DunongAI. Adaptive, bilingual, and built for every Filipino classroom. Give every child the joy of reading at their own pace. Get started free today, at dunong A.I. dot p.h. Basahin Natin Ito!",
  },
];

async function tts(text) {
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: {
        "xi-api-key": API_KEY,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: MODEL_ID,
        voice_settings: {
          stability: 0.45,
          similarity_boost: 0.8,
          style: 0.25,
          use_speaker_boost: true,
        },
      }),
    },
  );
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`ElevenLabs ${res.status} ${res.statusText}\n${body}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

mkdirSync(OUT_DIR, { recursive: true });
console.log(`\n  Voice: ${VOICE_ID}   Model: ${MODEL_ID}\n`);
for (const s of SCENES) {
  process.stdout.write(`  → ${s.file} … `);
  const audio = await tts(s.text);
  writeFileSync(join(OUT_DIR, s.file), audio);
  console.log(`ok (${(audio.length / 1024).toFixed(0)} KB)`);
}
console.log("\n  ✓ Narration written to public/voiceover/. Next:  npm run render\n");
