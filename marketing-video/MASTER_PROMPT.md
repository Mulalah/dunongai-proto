# Master Prompt — Programmatic Marketing Video (Remotion + GSAP + Audio)

> Paste this whole document to Claude (or any capable coding agent) to generate a
> 60-second marketing video for a web app. Fill in the `[BRACKETS]`. The worked
> example throughout is **DunongAI**, an AI adaptive-reading app — replace with
> your product. Everything below reflects a build that actually shipped, including
> the gotchas, so follow it literally.

---

## 1. Role & objective

You are an expert Motion Graphics Developer specializing in **React, Remotion, and
GSAP**, with solid audio-engineering instincts. Programmatically generate a
high-quality, **exactly 60-second (1800-frame @ 30fps), 1920×1080** marketing
video advertisement for my web app. Produce a rendered **MP4 with synced
animation, AI voiceover narration, a background music bed, and UI sound effects.**

Do **not** ask for permission to write code or run setup — proceed step by step,
generating files and running commands. Only stop to ask if you hit a true
blocker that only I can resolve (e.g. a paid API key).

## 2. Project context (fill these in)

- **App name:** [APP NAME]
- **Source folder / repo:** [PATH or GitHub URL] — read it to learn the real
  product, UI, and brand. Do **not** invent features; recreate what exists.
- **Audience:** [AUDIENCE]
- **Tagline / value prop:** [TAGLINE] (derive from the app if unstated)
- **Brand tokens:** pull the **exact** colors, fonts, and shadows from the app's
  own config (e.g. `tailwind.config.js`) so the ad matches the product 1:1.
  - _DunongAI example:_ navy `#0A1628`, teal `#0D9488`, gold `#F59E0B`; fonts
    Plus Jakarta Sans (headings) / Inter (UI) / Lora (reading); warm, modern,
    educational.

## 3. Environment & setup

1. Add the Remotion skills: `npx -y skills@latest add remotion-dev/skills -g -y`
   (the global PromptScript target may report a failure — harmless).
2. Scaffold an **isolated** project in a subfolder so it never clashes with the
   app's deps/TS config:
   `npx -y create-video@latest --yes --blank --no-tailwind marketing-video`
3. `cd marketing-video && npm install gsap @remotion/google-fonts`
4. TypeScript is `strict` + `noUnusedLocals`. **Avoid `React.FC`**; type props
   inline and `import type { CSSProperties, ReactNode } from "react"` as needed.

## 4. Technical constraints

- **Duration:** exactly 1800 frames. `<Composition durationInFrames={1800} fps={30} width={1920} height={1080} />`.
- **Animation engine:** use **GSAP** for all non-trivial motion — staggers,
  text reveals, eases (`power4.out`, `expo.inOut`, `back.out`, `elastic.out`).
  Use Remotion `interpolate` only for cheap background drift / global fades.
- **FORBIDDEN:** CSS transitions/animations and Tailwind animation classes — they
  do not render deterministically in Remotion.
- Load fonts via `@remotion/google-fonts` with **restricted weights/subsets**
  (avoids the "too many network requests" warning and speeds warm-up).

## 5. THE critical piece — GSAP ↔ Remotion sync

Remotion is **frame-based**; GSAP is **time-based** and normally runs its own rAF
ticker, which desyncs the render. Bridge them with a single hook: build **one
paused timeline** per component (scoped with `gsap.context`), and on every frame
seek it explicitly. Put the seek in a `useLayoutEffect` keyed on `frame` so the
DOM mutates **before** Remotion captures the frame (keeps Studio, stills, and the
final render pixel-identical).

```ts
// src/hooks/useGsapTimeline.ts
import { useLayoutEffect, useRef } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { gsap } from "gsap";

export const useGsapTimeline = (
  build: (tl: gsap.core.Timeline, scope: HTMLDivElement) => void,
) => {
  const scope = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  useLayoutEffect(() => {
    const el = scope.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({ paused: true }); // never let GSAP's ticker run it
      build(timeline, el);
      tl.current = timeline;
    }, el);
    return () => { ctx.revert(); tl.current = null; };
    // build once per mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useLayoutEffect(() => {
    tl.current?.time(frame / fps); // the actual sync
  }, [frame, fps]);

  return scope;
};
```

Usage: `const scope = useGsapTimeline((tl) => tl.from(".title .kw", { yPercent: 120, opacity: 0, stagger: 0.08, ease: "power4.out" })); return <div ref={scope}>…</div>;`

Because each scene lives in a `<Sequence>`, `useCurrentFrame()` is **local** to
that scene, so `frame / fps` is scene-local time and `.from()` reveals hold their
start state until their cue (immediateRender). This also makes parallel render
workers correct (absolute `.time()` seeks).

## 6. Architecture

Keep it modular:

```
src/
  Root.tsx                 # <Composition id="…Ad" 1800/30/1920×1080>
  <Name>Ad.tsx             # arranges 4 scenes as <Sequence>s + audio layers
  theme.ts                 # brand tokens copied from the app
  fonts.ts                 # google-fonts loadFont() with restricted weights
  hooks/useGsapTimeline.ts # the sync hook above
  components/
    Background.tsx         # animated gradient backdrop (interpolate drift)
    Brand.tsx              # LogoMark + Wordmark
    KineticText.tsx        # per-word masked spans for rise-reveals
    Mock.tsx               # browser frame + product-UI mockups + mini-mocks
    icons.tsx              # inline SVG icon set (no emoji — headless Chromium tofus them)
  scenes/Scene1Hook.tsx … Scene4CTA.tsx
public/
  music/ambient.mp3
  voiceover/scene-1..4.mp3
  sfx/…                    # or reference remotion.media URLs
```

## 7. Scene structure (1800 frames)

Build each as a `<Sequence>` with the exact frame window:

| Scene | Time | Frames | Content |
|-------|------|--------|---------|
| 1 — Hook | 0–10s | `0` / `300` | Kinetic typography stating the problem; 2–3 beats, masked word-rise staggers; last beat lands a hero word (`back.out` pop + pulse). |
| 2 — Introduction | 10–25s | `300` / `450` | Brand reveal centre-stage → cross-fade to a compact **top lockup** while the live app UI slides up (`expo.out`) and its pieces stagger in. _(Cross-fade two brand elements rather than scaling+translating one fullscreen flex container — the latter clips children unpredictably.)_ |
| 3 — Features | 25–45s | `750` / `600` | 3 features, each its own inner `<Sequence>` (≈200f, hard "quick cut"), with a ghost index number, kicker+icon, kinetic title, and a product mini-mock that **scales in** (`expo.out` / `back.out`). |
| 4 — Climax & CTA | 45–60s | `1350` / `450` | Logo reveal (`elastic.out`), tagline, URL, pulsing CTA button, trust badges, drifting particles. Hold the end card alive with gentle `sine.inOut yoyo` loops. |

Recreate the **real product UI** as styled components (browser chrome, the actual
screens) — far better than screenshots and fully animatable. Give inner elements
stable classNames so each scene's GSAP timeline can stagger them.

## 8. Audio — narration

Use **ElevenLabs** TTS, one MP3 per scene, written to `public/voiceover/`.

- Write a self-contained `generate-voiceover.mjs` (plain ESM, Node ≥ 20 has
  global `fetch`/`Buffer`). Read the key from `process.env.ELEVENLABS_API_KEY`
  (PowerShell: `$env:ELEVENLABS_API_KEY="sk-…"; npm run voiceover`). **Never**
  write the key to a tracked file.
- Model `eleven_multilingual_v2` (handles non-English brand words). Voice
  settings ≈ `{ stability: 0.45, similarity_boost: 0.8, style: 0.25, use_speaker_boost: true }`.
- **Free-tier gotchas (hit these, plan for them):**
  - `output_format=mp3_44100_192` requires Creator tier → use **`mp3_44100_128`**.
  - The classic default voices (e.g. Rachel) are now restricted "library" voices
    → use an account-**default** voice such as **Sarah `EXAVITQu4vr4xnSDxMaL`**.
  - A TTS-only key lacks `voices_read`, so you can't list voices via API — pick a
    known default ID or probe a few with a 1-word call (failed calls don't bill).
- Write the narration script timed to each scene window (~roughly: 10s≈25 words,
  15s≈38, 20s≈50, 15s≈33). Verify each clip's duration fits its window with
  `ffprobe`.
- **Ship silent placeholders first** so the composition renders before any key
  exists: `ffmpeg -f lavfi -i anullsrc=r=48000:cl=stereo -t <sec> public/voiceover/scene-N.mp3`.
  The generation script overwrites them.

Place each clip at its scene start: `<Sequence from={start}><Audio src={staticFile("voiceover/scene-N.mp3")} /></Sequence>` (no `durationInFrames`, so it plays fully). Narration at full volume (`1.0`).

## 9. Audio — background music bed

Synthesize an **original, royalty-free** ambient pad with ffmpeg (use Remotion's
bundled binary via `npx remotion ffmpeg` — no system ffmpeg needed). Keep a
reproducible `scripts/generate-music.sh`.

- **The bundled ffmpeg has a limited filter set** — no `afade`, `tremolo`,
  `lowpass`, `aevalsrc`. So: build a chord from `sine` sources, mix with
  `amix=…:normalize=0`, and shape the swell + fades with a **single comma-free
  `volume` expression** (commas inside filter expressions are painful to escape):
  `volume='(0.8+0.15*sin(2*PI*0.05*t))*(1-exp(-t/1.0))*(1-exp(-(60-t)/1.5))':eval=frame`.
- **Weight the chord toward mid notes (≈260–780 Hz)** — pure low sines (130 Hz)
  are inaudible on laptop speakers. Normalize with `loudnorm` placed **before**
  the fades (so it can't fight them).
- **LEVELS MATTER (the #1 mistake):** target the bed at ≈ **−21 LUFS** in the
  file, and mix it ≈ **6–9 dB under** the narration. Narration is ~−17 LUFS, so
  music landing around **−25 LUFS** in the mix is "clearly audible background."
  A bed at −37 LUFS (what raw quiet sines give you) is **inaudible** under speech.
  Verify with `ffmpeg -i … -af loudnorm=print_format=summary -f null -` and
  sanity-check a music-only gap with `silencedetect`.
- In Remotion, play it full-length with fades via an `interpolate` volume
  function, e.g. `volume={(f) => interpolate(f, [0,24,1760,1800], [0,0.6,0.6,0], {extrapolateLeft:"clamp", extrapolateRight:"clamp"})}`. Tune the `0.6` to taste.

## 10. Audio — SOUND EFFECTS  ⟵ (add this layer)

Layer short UI **sound effects** on top of music + narration, each fired at the
**exact frame** of its animation event. Because GSAP is frame-synced, a hit at
GSAP-time `t` seconds inside a scene starting at `sceneStart` lands at frame
`sceneStart + Math.round(t * fps)`.

**Sourcing.** Use Remotion's hosted SFX (reference as remote URLs — no download)
or drop royalty-free files into `public/sfx/` and use `staticFile`:

```
https://remotion.media/mouse-click.wav   # taps / clicks
https://remotion.media/switch.wav        # toggles / small UI pops
https://remotion.media/whoosh.wav        # scene cuts, slide-ins, camera moves
https://remotion.media/whip.wav          # fast text snaps
https://remotion.media/page-turn.wav     # story / content changes
https://remotion.media/ding.wav          # success / level-up / AI result
https://remotion.media/shutter-modern.wav# logo lock / capture moment
```

More: `@remotion/sfx`, or https://github.com/kapishdima/soundcn/tree/main/assets,
or any royalty-free pack. You may also synthesize simple ones with ffmpeg (a click
= a few-ms sine/noise blip with a fast exponential decay; a pop = a short upward
sine sweep).

**Helper** — make placement one line:

```tsx
// components/Sfx.tsx
import { Audio, Sequence } from "remotion";
export const Sfx = ({ at, src, volume = 0.4 }: { at: number; src: string; volume?: number }) => (
  <Sequence from={at} layout="none">
    <Audio src={src} volume={volume} />
  </Sequence>
);
```

**Cue sheet (map every key beat — adapt frames to your timeline):**

| Beat | Sound | Why |
|------|-------|-----|
| Each scene cut (300, 750, 1350) & every slide-in | `whoosh` | sells the motion |
| Kinetic word/line reveals | `whip` (sparingly — 1 per beat, not per word) | snappy typography |
| Tapping a highlighted word / Basa-Bot interaction | `mouse-click` then `page-turn` or `ding` | mimic the real UX |
| Card / badge / chip pop-in (`back.out`) | `switch` | tactile "pop" |
| Feature mini-mock scaling in | soft `whoosh` + `switch` | entrance accent |
| Level-up badge, AI summary appears | `ding` | positive payoff |
| CTA button appears (`back.out`) + logo lock | `mouse-click` / `shutter-modern` | call to action snap |

**Mixing rules.** Keep SFX **short (≈0.05–0.5s)** and at `volume` **0.25–0.5** —
present but **under the voice**, sitting alongside the music. **Don't overuse**:
one effect per meaningful beat; silence is part of the design. Ensure no clipping
(voice peaks ~−2 dBTP; keep SFX peaks well below). Time each hit to the GSAP cue,
not the Sequence boundary, so it lands on the visual accent.

## 11. Composition wiring (audio order is irrelevant; it all mixes)

```tsx
<AbsoluteFill style={{ backgroundColor: navyDeep }}>
  <Audio src={staticFile("music/ambient.mp3")} volume={musicVolumeFn} />
  {narration.map(n => <Sequence key={n.file} from={n.from}><Audio src={staticFile(n.file)} /></Sequence>)}
  {/* SFX cues */}
  <Sfx at={300} src="https://remotion.media/whoosh.wav" />
  {/* …more cues… */}
  {/* visual scenes */}
  <Sequence durationInFrames={300}><Scene1Hook /></Sequence>
  <Sequence from={300} durationInFrames={450}><Scene2Intro /></Sequence>
  <Sequence from={750} durationInFrames={600}><Scene3Features /></Sequence>
  <Sequence from={1350} durationInFrames={450}><Scene4CTA /></Sequence>
</AbsoluteFill>
```

## 12. Execution steps

1. Run setup (§3). 2. Build tokens, fonts, the sync hook, Background, Brand,
KineticText, icons, and the product mockups. 3. Build the 4 scenes with high-end
easing. 4. Generate the music bed (§9) and **measure its LUFS**; ship silent VO
placeholders. 5. Wire music + narration + **SFX cues** (§10–11). 6. `npx tsc` to
typecheck; render representative **stills** (`npx remotion still <id> out/x.png
--frame=N --scale=0.45`) and **view them** to verify each scene before full
render. 7. Generate narration once the key is provided, verify clip durations.
8. Render the MP4 and **verify** duration/streams with `ffprobe`, and music
audibility with `loudnorm`/`silencedetect`.

## 13. Deliver

- Preview: `npm run dev` → Remotion Studio → pick the composition.
- Render: `npx remotion render <id> out/<Name>-Ad.mp4` (add `npm run render` and
  `npm run voiceover` scripts).
- A `README.md` documenting preview/render, the audio workflow, and how to tweak
  copy, levels, voice, and SFX.

## 14. Gotchas checklist (don't relearn these)

- ☐ GSAP timeline **paused**, seeked via `useLayoutEffect([frame])` — never the ticker.
- ☐ No CSS/Tailwind animations. No emoji in render (use SVG icons).
- ☐ Don't scale+translate a fullscreen flex container to "move" a group — it clips children; cross-fade two elements instead.
- ☐ ElevenLabs free tier: `mp3_44100_128`, a **default** voice (Sarah), `multilingual_v2`; can't list voices without `voices_read`.
- ☐ Ship **silent VO placeholders** so the project renders before the key exists.
- ☐ Bundled ffmpeg lacks `afade`/`tremolo` — shape audio with a comma-free `volume` expression; `loudnorm` before fades.
- ☐ **Music level is the thing people notice:** bed ≈ −21 LUFS, mixed ≈ 6–9 dB under the −17 LUFS voice; weight the chord to the mids. Verify, don't guess.
- ☐ SFX: fire on the **GSAP cue frame**, keep short, `volume` 0.25–0.5, one per beat.
- ☐ Typecheck (`strict` + `noUnusedLocals`); render + **view stills** before committing to the full render.
```
