import {
  AbsoluteFill,
  Audio,
  interpolate,
  Sequence,
  staticFile,
} from "remotion";
import { Scene1Hook } from "./scenes/Scene1Hook";
import { Scene2Intro } from "./scenes/Scene2Intro";
import { Scene3Features } from "./scenes/Scene3Features";
import { Scene4CTA } from "./scenes/Scene4CTA";
import { C } from "./theme";
import { F } from "./fonts";

/**
 * DunongAI — 60s marketing ad @ 30fps (1800 frames), 1920×1080.
 *
 * Timeline:
 *   Scene 1  The Hook            0–10s   frames    0–300
 *   Scene 2  The Introduction   10–25s   frames  300–750
 *   Scene 3  Feature Highlights 25–45s   frames  750–1350
 *   Scene 4  The Climax & CTA   45–60s   frames 1350–1800
 *
 * Audio:
 *   - music/ambient.mp3 plays the whole length, faded in/out and ducked low.
 *   - voiceover/scene-N.mp3 starts at each scene boundary (generate with
 *     `npm run voiceover`; silent placeholders ship until then).
 */
const NARRATION = [
  { file: "voiceover/scene-1.mp3", from: 0 },
  { file: "voiceover/scene-2.mp3", from: 300 },
  { file: "voiceover/scene-3.mp3", from: 750 },
  { file: "voiceover/scene-4.mp3", from: 1350 },
];

export const DunongAd = () => (
  <AbsoluteFill style={{ backgroundColor: C.navyDeep, fontFamily: F.body }}>
    {/* Background music — low under the voiceover, with fade in/out. */}
    <Audio
      src={staticFile("music/ambient.mp3")}
      volume={(f) =>
        interpolate(f, [0, 24, 1760, 1800], [0, 0.6, 0.6, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      }
    />

    {/* Per-scene narration. */}
    {NARRATION.map((n) => (
      <Sequence key={n.file} from={n.from}>
        <Audio src={staticFile(n.file)} />
      </Sequence>
    ))}

    {/* Visuals */}
    <Sequence durationInFrames={300}>
      <Scene1Hook />
    </Sequence>
    <Sequence from={300} durationInFrames={450}>
      <Scene2Intro />
    </Sequence>
    <Sequence from={750} durationInFrames={600}>
      <Scene3Features />
    </Sequence>
    <Sequence from={1350} durationInFrames={450}>
      <Scene4CTA />
    </Sequence>
  </AbsoluteFill>
);
