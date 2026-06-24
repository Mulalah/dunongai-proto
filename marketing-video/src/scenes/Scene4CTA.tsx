import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Background } from "../components/Background";
import { LogoMark, Wordmark } from "../components/Brand";
import { useGsapTimeline } from "../hooks/useGsapTimeline";
import { IconArrowRight, IconCheck, IconGlobe } from "../components/icons";
import { C } from "../theme";
import { F } from "../fonts";

/** Gentle gold motes drifting upward — deterministic, frame-driven. */
const Particles = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const dots = Array.from({ length: 18 }, (_, i) => {
    const speed = 0.05 + (i % 5) * 0.012;
    const phase = ((i * 37) % 100) / 100;
    const prog = (t * speed + phase) % 1;
    const y = (1 - prog) * (height + 80) - 40;
    const x = ((i * 137) % 100) / 100 * width;
    const size = 4 + ((i * 53) % 9);
    const opacity = Math.sin(prog * Math.PI) * 0.5;
    return { x, y, size, opacity, i };
  });
  return (
    <AbsoluteFill>
      {dots.map((d) => (
        <div
          key={d.i}
          style={{
            position: "absolute",
            left: d.x,
            top: d.y,
            width: d.size,
            height: d.size,
            borderRadius: 999,
            background: C.goldLight,
            opacity: d.opacity,
            boxShadow: `0 0 ${d.size * 2}px ${C.goldGlow}`,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

const Badge = ({ label }: { label: string }) => (
  <div
    className="cta-badge"
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      fontFamily: F.body,
      fontWeight: 600,
      fontSize: 24,
      color: C.cream,
    }}
  >
    <span
      style={{
        width: 30,
        height: 30,
        borderRadius: 999,
        background: C.teal,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <IconCheck size={18} color={C.white} />
    </span>
    {label}
  </div>
);

/**
 * Scene 4 — The Climax & CTA (45–60s).
 * Logo reveal, tagline, a pulsing call-to-action and the website URL.
 */
export const Scene4CTA = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  // A soft global fade-in at the cut from Scene 3.
  const enter = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });

  const scope = useGsapTimeline((tl) => {
    tl.from(".cta-mark", { scale: 0, rotation: -20, duration: 1.1, ease: "elastic.out(1, 0.6)" }, 0.2);
    tl.from(".cta-word", { yPercent: 60, opacity: 0, duration: 0.9, ease: "power4.out" }, 0.7);
    tl.from(".cta-tag", { yPercent: 80, opacity: 0, duration: 0.8, ease: "power4.out" }, 1.3);
    tl.from(".cta-sub", { opacity: 0, y: 22, duration: 0.7, ease: "power2.out" }, 1.7);
    tl.from(".cta-btn", { scale: 0, duration: 0.8, ease: "back.out(2)" }, 2.2);
    tl.from(".cta-url", { opacity: 0, y: 16, duration: 0.6, ease: "power2.out" }, 2.7);
    tl.from(".cta-badge", { opacity: 0, y: 20, scale: 0.9, duration: 0.6, stagger: 0.12, ease: "back.out(1.6)" }, 2.9);

    // Keep the end card alive through the long hold.
    tl.to(".cta-mark", { y: -12, duration: 1.5, ease: "sine.inOut", yoyo: true, repeat: 7 }, 3.6);
    tl.to(".cta-btn", { scale: 1.05, duration: 0.95, ease: "sine.inOut", yoyo: true, repeat: 9 }, 3.7);
  });

  return (
    <AbsoluteFill style={{ opacity: enter }}>
      <Background accent="gold" />
      <Particles />
      <AbsoluteFill
        ref={scope}
        style={{ flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 0 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28, marginBottom: 18 }}>
          <LogoMark className="cta-mark" size={130} />
          <Wordmark className="cta-word" size={132} />
        </div>

        <div
          className="cta-tag"
          style={{ fontFamily: F.heading, fontWeight: 800, fontSize: 60, color: C.gold, marginTop: 6 }}
        >
          Basahin Natin Ito!
        </div>

        <div
          className="cta-sub"
          style={{
            fontFamily: F.body,
            fontSize: 30,
            color: C.muted,
            marginTop: 14,
            textAlign: "center",
            maxWidth: 900,
            lineHeight: 1.5,
          }}
        >
          An adaptive AI reading companion for every Filipino K–6 classroom.
        </div>

        <div
          className="cta-btn"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 16,
            marginTop: 44,
            padding: "22px 46px",
            borderRadius: 999,
            background: `linear-gradient(135deg, ${C.tealLight}, ${C.teal})`,
            color: C.white,
            fontFamily: F.heading,
            fontWeight: 800,
            fontSize: 34,
            boxShadow: `0 0 50px ${C.tealGlow}`,
          }}
        >
          Get started free
          <IconArrowRight size={34} color={C.white} />
        </div>

        <div
          className="cta-url"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            marginTop: 26,
            fontFamily: F.heading,
            fontWeight: 700,
            fontSize: 30,
            color: C.white,
            letterSpacing: "0.02em",
          }}
        >
          <IconGlobe size={26} color={C.tealLight} />
          dunongai.ph
        </div>

        <div style={{ display: "flex", gap: 40, marginTop: 40 }}>
          <Badge label="Adaptive levels" />
          <Badge label="Bilingual FIL / ENG" />
          <Badge label="Teacher dashboard" />
        </div>
      </AbsoluteFill>

      {/* fade the very end to black for a clean loop-out */}
      <AbsoluteFill
        style={{
          backgroundColor: C.navyDeep,
          opacity: interpolate(
            frame,
            [durationInFrames - 18, durationInFrames],
            [0, 1],
            { extrapolateLeft: "clamp" },
          ),
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
