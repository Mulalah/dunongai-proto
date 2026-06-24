# DunongAI — 60s Marketing Video (Remotion + GSAP)

A programmatic 1-minute (1800-frame @ 30fps), 1920×1080 advertisement for the
**DunongAI** reading app, built with [Remotion](https://remotion.dev) and
[GSAP](https://gsap.com). Brand tokens (navy / teal / gold, Plus Jakarta Sans /
Inter / Lora) mirror the webapp exactly.

## Preview (Remotion Studio)

```bash
cd marketing-video
npm install        # first time only
npm run dev        # opens Remotion Studio at http://localhost:3000
```

Pick the **DunongAd** composition. Scrub the timeline, play, and edit any scene —
the preview hot-reloads.

## Render to MP4 (H.264, 1080p)

```bash
cd marketing-video
npx remotion render DunongAd out/DunongAI-Ad.mp4
```

The file lands at `marketing-video/out/DunongAI-Ad.mp4`.

Useful variants:

```bash
# quick draft (faster, lower quality)
npx remotion render DunongAd out/draft.mp4 --jpeg-quality=70 --concurrency=4

# higher quality (crf lower = better; 18–23 typical)
npx remotion render DunongAd out/DunongAI-Ad.mp4 --crf=18

# a single still to sanity-check a frame (0-based; frame 30 = 1s)
npx remotion still DunongAd out/frame.png --frame=900 --scale=0.5
```

## Audio: narration + music

The ad mixes two audio layers, wired in [`src/DunongAd.tsx`](src/DunongAd.tsx):

- **Background music** — `public/music/ambient.mp3`, an original royalty-free
  ambient pad synthesized with ffmpeg. Plays the full 60s, faded in/out and held
  low (`volume ≈ 0.2`) so it sits under the voiceover.
- **Narration** — one MP3 per scene in `public/voiceover/`, each starting at its
  scene boundary. Silent placeholders ship in the repo so the video renders
  before you generate real speech.

### Generating the voiceover (ElevenLabs)

```bash
# PowerShell
$env:ELEVENLABS_API_KEY="sk-..."; npm run voiceover; npm run render

# bash
ELEVENLABS_API_KEY=sk-... npm run voiceover && npm run render
```

`npm run voiceover` runs [`generate-voiceover.mjs`](generate-voiceover.mjs),
which TTS-renders the per-scene script (`eleven_multilingual_v2`, so the Filipino
lines speak correctly) and overwrites the placeholders in `public/voiceover/`.
Then `npm run render` re-renders the MP4 with narration baked in.

Optional env overrides: `ELEVENLABS_VOICE_ID` (default Rachel),
`ELEVENLABS_MODEL_ID`. Edit the narration text in `generate-voiceover.mjs`; the
scene start frames live in the `NARRATION` array in `src/DunongAd.tsx`.

### Regenerating the music bed

The exact ffmpeg command that produced `public/music/ambient.mp3` is preserved in
[`scripts/generate-music.sh`](scripts/generate-music.sh) — tweak the chord notes,
LFO speed, or fades and re-run it.

## How the scenes map to the timeline

| Scene | Time | Frames | What happens |
|-------|------|--------|--------------|
| 1 — The Hook | 0–10s | 0–300 | Kinetic typography stating the problem ("every child reads at their own pace") |
| 2 — The Introduction | 10–25s | 300–750 | Brand reveal → app (story reader + Basa Bot) slides up, UI staggers in |
| 3 — Feature Highlights | 25–45s | 750–1350 | 3 quick-cut features: Basa Bot, Adaptive Levels, Teacher Dashboard |
| 4 — The Climax & CTA | 45–60s | 1350–1800 | Logo reveal, `dunongai.ph`, "Get started free" CTA |

## GSAP ↔ Remotion sync (the important bit)

Remotion is **frame-based** and deterministic; GSAP is **time-based** and normally
runs on its own rAF ticker. Letting both run independently desyncs the render. The
bridge lives in [`src/hooks/useGsapTimeline.ts`](src/hooks/useGsapTimeline.ts):

1. Build **one** `gsap.timeline({ paused: true })` per component (scoped with
   `gsap.context` so selectors resolve locally and revert cleanly).
2. Never let GSAP's ticker advance it. On every Remotion frame we seek explicitly:
   `timeline.time(frame / fps)`.

The seek runs in a `useLayoutEffect` keyed on `frame` so the DOM is mutated before
Remotion captures the frame — this keeps Studio, stills, and the final render
pixel-identical.

```tsx
const scope = useGsapTimeline((tl) => {
  tl.from(".title .kw", { yPercent: 120, opacity: 0, stagger: 0.08, ease: "power4.out" });
});
return <div ref={scope}>…</div>;
```

## Project layout

```
src/
  Root.tsx                 # registers the <Composition> (1800 frames, 30fps, 1920×1080)
  DunongAd.tsx             # arranges the 4 scenes as <Sequence>s
  theme.ts                 # brand colors (from the webapp tailwind config)
  fonts.ts                 # Plus Jakarta Sans / Inter / Lora via @remotion/google-fonts
  hooks/
    useGsapTimeline.ts     # the GSAP↔Remotion sync hook
  components/
    Background.tsx         # animated navy/teal/gold backdrop
    Brand.tsx              # LogoMark + Wordmark
    KineticText.tsx        # masked per-word text for reveals
    Mock.tsx               # browser frame + story-reader + feature mini-mocks
    icons.tsx              # inline SVG icon set
  scenes/
    Scene1Hook.tsx
    Scene2Intro.tsx
    Scene3Features.tsx
    Scene4CTA.tsx
```

## Customizing

- **Copy / colors:** edit the token arrays in each scene and `src/theme.ts`.
- **Duration:** change `durationInFrames` in `src/Root.tsx` (and the per-scene
  `<Sequence>` `from` / `durationInFrames` in `src/DunongAd.tsx`).
- **Audio / voiceover:** drop an `mp3` in `public/` and add
  `<Audio src={staticFile("track.mp3")} />` inside `DunongAd`.
