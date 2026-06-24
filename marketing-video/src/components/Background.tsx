import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { C } from "../theme";

/**
 * Shared animated backdrop: deep-navy base with two slowly drifting brand-color
 * glows, a faint masked grid and a vignette. The drift uses Remotion's
 * `useCurrentFrame` (cheap, deterministic) — GSAP is reserved for the foreground
 * staggers and text reveals per the brief.
 */
export const Background = ({
  accent = "teal",
}: {
  accent?: "teal" | "gold";
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const t = frame / 30;

  const x1 = width * 0.3 + Math.sin(t * 0.4) * 130;
  const y1 = height * 0.34 + Math.cos(t * 0.33) * 90;
  const x2 = width * 0.74 + Math.cos(t * 0.28) * 150;
  const y2 = height * 0.72 + Math.sin(t * 0.25) * 110;

  const glow = accent === "gold" ? C.goldGlow : C.tealGlow;
  const pulse = interpolate(Math.sin(t * 0.8), [-1, 1], [0.78, 1]);

  return (
    <AbsoluteFill style={{ backgroundColor: C.navyDeep }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(900px 900px at ${x1}px ${y1}px, ${glow}, transparent 60%),
            radial-gradient(1150px 1150px at ${x2}px ${y2}px, rgba(13,148,136,0.20), transparent 62%),
            linear-gradient(160deg, ${C.navy} 0%, ${C.navyDeep} 72%)`,
          opacity: pulse,
        }}
      />
      <AbsoluteFill
        style={{
          opacity: 0.05,
          backgroundImage: `linear-gradient(${C.tealLight} 1px, transparent 1px),
            linear-gradient(90deg, ${C.tealLight} 1px, transparent 1px)`,
          backgroundSize: "66px 66px",
          maskImage: "radial-gradient(circle at 50% 45%, black, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(circle at 50% 45%, black, transparent 75%)",
        }}
      />
      <AbsoluteFill
        style={{ boxShadow: "inset 0 0 420px 90px rgba(2,6,12,0.72)" }}
      />
    </AbsoluteFill>
  );
};
