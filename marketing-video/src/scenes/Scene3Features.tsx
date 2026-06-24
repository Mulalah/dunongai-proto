import type { ComponentType, ReactNode } from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Background } from "../components/Background";
import { KineticLine, type Token } from "../components/KineticText";
import { useGsapTimeline } from "../hooks/useGsapTimeline";
import { IconChat, IconLevels, IconChart } from "../components/icons";
import { BasaBotMini, LevelMini, DashboardMini } from "../components/Mock";
import { C } from "../theme";
import { F } from "../fonts";

type Variant = "basabot" | "levels" | "dash";

type Feature = {
  index: number;
  accent: "teal" | "gold";
  accentColor: string;
  Icon: ComponentType<{ size?: number; color?: string }>;
  kicker: string;
  title: Token[];
  desc: string;
  mock: ReactNode;
  variant: Variant;
};

const FeatureScene = ({ feature }: { feature: Feature }) => {
  const { index, accent, accentColor, Icon, kicker, title, desc, mock, variant } =
    feature;

  const scope = useGsapTimeline((tl) => {
    tl.from(".fx-num", { opacity: 0, x: 70, duration: 0.9, ease: "expo.out" }, 0.1);
    tl.from(".fx-kicker", { opacity: 0, x: -30, duration: 0.6, ease: "power3.out" }, 0.2);
    tl.from(".fx-icon", { scale: 0, rotation: -25, duration: 0.8, ease: "back.out(2)" }, 0.35);
    tl.from(".fx-title .kw", { yPercent: 120, opacity: 0, duration: 0.8, stagger: 0.07, ease: "power4.out" }, 0.5);
    tl.from(".fx-desc", { opacity: 0, y: 26, duration: 0.7, ease: "power2.out" }, 1.0);
    tl.from(".fx-card", { opacity: 0, x: 90, scale: 0.85, duration: 1.0, ease: "expo.out" }, 0.8);

    // Mock-specific reveals
    if (variant === "basabot") {
      tl.from(".fx-bubble", { opacity: 0, y: 26, scale: 0.9, duration: 0.6, ease: "back.out(1.6)" }, 1.7);
    } else if (variant === "levels") {
      tl.from(".fx-step", { scaleY: 0, opacity: 0, duration: 0.7, stagger: 0.15, ease: "power3.out" }, 1.4);
      tl.from(".fx-badge", { scale: 0, duration: 0.7, ease: "back.out(2)" }, 2.15);
    } else {
      tl.from(".fx-row", { opacity: 0, x: 45, duration: 0.6, stagger: 0.15, ease: "power3.out" }, 1.5);
      tl.from(".fx-summary", { opacity: 0, x: 60, scale: 0.9, duration: 0.8, ease: "expo.out" }, 2.15);
    }

    // Quick cut out
    tl.to(".fx-stage", { opacity: 0, scale: 0.96, duration: 0.35, ease: "power2.in" }, 6.25);
  });

  return (
    <AbsoluteFill>
      <Background accent={accent} />
      <AbsoluteFill ref={scope} className="fx-stage">
        <div
          className="fx-num"
          style={{
            position: "absolute",
            top: 20,
            right: 90,
            fontFamily: F.heading,
            fontWeight: 800,
            fontSize: 460,
            color: "rgba(255,255,255,0.045)",
            lineHeight: 1,
          }}
        >
          {String(index).padStart(2, "0")}
        </div>

        <AbsoluteFill
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 96,
            padding: "0 150px",
          }}
        >
          {/* Copy */}
          <div style={{ width: 720, flexShrink: 0 }}>
            <div
              className="fx-kicker"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                color: accentColor,
                fontFamily: F.heading,
                fontWeight: 700,
                fontSize: 22,
                letterSpacing: "0.18em",
                marginBottom: 26,
              }}
            >
              <span
                className="fx-icon"
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 14,
                  background: accentColor + "22",
                  border: `1px solid ${accentColor}55`,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon size={30} color={accentColor} />
              </span>
              {kicker}
            </div>

            <div className="fx-title">
              <KineticLine
                tokens={title}
                style={{
                  justifyContent: "flex-start",
                  fontFamily: F.heading,
                  fontWeight: 800,
                  fontSize: 76,
                  color: C.white,
                  lineHeight: 1.04,
                  letterSpacing: "-0.02em",
                }}
              />
            </div>

            <div
              className="fx-desc"
              style={{
                marginTop: 28,
                fontFamily: F.body,
                fontSize: 30,
                lineHeight: 1.55,
                color: C.muted,
                maxWidth: 640,
              }}
            >
              {desc}
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 42 }}>
              {[1, 2, 3].map((d) => (
                <div
                  key={d}
                  style={{
                    width: d === index ? 46 : 14,
                    height: 14,
                    borderRadius: 999,
                    background: d === index ? accentColor : "rgba(255,255,255,0.18)",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Mock */}
          <div className="fx-card" style={{ display: "flex", justifyContent: "center" }}>
            {mock}
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const features: Feature[] = [
  {
    index: 1,
    accent: "teal",
    accentColor: C.tealLight,
    Icon: IconChat,
    kicker: "BASA BOT",
    title: [
      { t: "Instant" },
      { t: "word" },
      { t: "help.", c: C.tealLight },
    ],
    desc: "Tap any word and Basa Bot explains it in kid-friendly Filipino — right inside the story, never breaking the flow.",
    mock: <BasaBotMini />,
    variant: "basabot",
  },
  {
    index: 2,
    accent: "gold",
    accentColor: C.gold,
    Icon: IconLevels,
    kicker: "ADAPTIVE LEVELS",
    title: [
      { t: "Reading" },
      { t: "that" },
      { t: "levels", c: C.gold },
      { t: "up.", c: C.gold },
    ],
    desc: "A quick diagnostic places each child at the right antas — then raises the challenge automatically as they improve.",
    mock: <LevelMini />,
    variant: "levels",
  },
  {
    index: 3,
    accent: "teal",
    accentColor: C.tealLight,
    Icon: IconChart,
    kicker: "TEACHER DASHBOARD",
    title: [
      { t: "Teachers" },
      { t: "see" },
      { t: "everything.", c: C.tealLight },
    ],
    desc: "AI summaries flag who's falling behind and suggest the next step — so no learner slips through the cracks.",
    mock: <DashboardMini />,
    variant: "dash",
  },
];

/**
 * Scene 3 — Feature Highlights (25–45s).
 * Three ~6.7s features, each its own Sequence (hard "quick cut") with an
 * independent GSAP timeline scaling its mock in.
 */
export const Scene3Features = () => (
  <AbsoluteFill>
    {features.map((feature, i) => (
      <Sequence key={feature.index} from={i * 200} durationInFrames={200}>
        <FeatureScene feature={feature} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
