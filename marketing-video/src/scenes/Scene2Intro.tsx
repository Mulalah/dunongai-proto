import { AbsoluteFill } from "remotion";
import { Background } from "../components/Background";
import { LogoMark, Wordmark } from "../components/Brand";
import { BrowserFrame, StoryReaderMock } from "../components/Mock";
import { useGsapTimeline } from "../hooks/useGsapTimeline";
import { C } from "../theme";
import { F } from "../fonts";

/**
 * Scene 2 — The Introduction (10–25s).
 * The brand reveals centre-stage (hero), then cross-fades into a compact top
 * lockup as the live app (story reader + Basa Bot) slides up and its UI staggers
 * in. Two distinct brand elements keep the lift deterministic.
 */
export const Scene2Intro = () => {
  const scope = useGsapTimeline((tl) => {
    // Phase A — hero brand reveal, centre stage
    tl.from(".hero-mark", { scale: 0, rotation: -35, duration: 1.0, ease: "back.out(1.7)" }, 0.2);
    tl.from(".hero-word", { yPercent: 60, opacity: 0, duration: 0.9, ease: "power4.out" }, 0.55);
    tl.from(".hero-tag", { yPercent: 80, opacity: 0, duration: 0.8, ease: "power4.out" }, 1.15);
    tl.from(".hero-sub", { y: 22, opacity: 0, duration: 0.8, ease: "power2.out" }, 1.55);

    // Phase B — hero out, compact top lockup in, app slides up
    tl.to(".brand-hero", { opacity: 0, scale: 0.9, y: -50, duration: 0.6, ease: "power2.in" }, 4.0);
    tl.from(".brand-top", { opacity: 0, y: -34, duration: 0.7, ease: "power3.out" }, 4.45);
    tl.from(".browser", { yPercent: 130, opacity: 0, duration: 1.3, ease: "expo.out" }, 4.5);

    // Stagger the reader UI
    tl.from(".browser .sr-chip", { opacity: 0, y: -16, duration: 0.5, ease: "power3.out" }, 5.5);
    tl.from(".browser .sr-title", { opacity: 0, y: 22, duration: 0.6, ease: "power3.out" }, 5.65);
    tl.from(".browser .sr-line", { opacity: 0, y: 22, duration: 0.6, stagger: 0.12, ease: "power3.out" }, 5.85);
    tl.from(".browser .sr-bot", { opacity: 0, y: 26, scale: 0.92, duration: 0.6, stagger: 0.5, ease: "back.out(1.6)" }, 6.5);

    // Smooth hand-off into Scene 3
    tl.to(".s2-stage", { opacity: 0, duration: 0.4, ease: "power2.in" }, 14.5);
  });

  return (
    <AbsoluteFill>
      <Background accent="teal" />
      <AbsoluteFill ref={scope} className="s2-stage">
        {/* Hero brand — phase A */}
        <AbsoluteFill
          className="brand-hero"
          style={{ flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 22 }}
        >
          <LogoMark className="hero-mark" size={148} />
          <Wordmark className="hero-word" size={118} />
          <div className="hero-tag" style={{ fontFamily: F.heading, fontWeight: 800, fontSize: 54, color: C.gold }}>
            Basahin Natin Ito!
          </div>
          <div
            className="hero-sub"
            style={{ fontFamily: F.body, fontSize: 30, color: C.muted, maxWidth: 920, textAlign: "center", lineHeight: 1.5 }}
          >
            Your AI reading buddy that adapts to every K–6 learner.
          </div>
        </AbsoluteFill>

        {/* Compact top lockup — phase B */}
        <div
          className="brand-top"
          style={{
            position: "absolute",
            top: 50,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 18,
          }}
        >
          <LogoMark size={74} />
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
            <Wordmark size={56} />
            <div style={{ fontFamily: F.heading, fontWeight: 700, fontSize: 22, color: C.gold, marginTop: 7 }}>
              Basahin Natin Ito!
            </div>
          </div>
        </div>

        {/* App mockup */}
        <AbsoluteFill style={{ alignItems: "flex-end", justifyContent: "center", paddingBottom: 56 }}>
          <BrowserFrame className="browser" url="dunongai.ph/basa" width={1200} height={716}>
            <StoryReaderMock />
          </BrowserFrame>
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
