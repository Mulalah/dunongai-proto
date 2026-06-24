import { AbsoluteFill } from "remotion";
import { Background } from "../components/Background";
import { KineticLine } from "../components/KineticText";
import { useGsapTimeline } from "../hooks/useGsapTimeline";
import { C } from "../theme";
import { F } from "../fonts";

const beatWrap = {
  position: "absolute" as const,
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "0 200px",
};

/**
 * Scene 1 — The Hook (0–10s).
 * Three kinetic-typography beats stating the problem, each a masked word-rise
 * stagger driven by a single GSAP timeline.
 */
export const Scene1Hook = () => {
  const scope = useGsapTimeline((tl) => {
    // Beat 1
    tl.from(
      ".b1 .kw",
      { yPercent: 120, opacity: 0, duration: 0.9, stagger: 0.07, ease: "power4.out" },
      0.2,
    );
    tl.to(".b1", { opacity: 0, yPercent: -30, duration: 0.5, ease: "power3.in" }, 2.9);

    // Beat 2
    tl.from(
      ".b2 .kw",
      { yPercent: 120, opacity: 0, duration: 0.85, stagger: 0.06, ease: "power4.out" },
      3.25,
    );
    tl.to(".b2", { opacity: 0, yPercent: -30, duration: 0.5, ease: "power3.in" }, 5.85);

    // Beat 3 — payoff line with the hero word "adapt"
    tl.from(".b3", { opacity: 0, scale: 0.85, duration: 1.0, ease: "expo.out" }, 6.2);
    tl.from(
      ".b3 .ln",
      { yPercent: 70, opacity: 0, duration: 0.8, stagger: 0.12, ease: "power4.out" },
      6.3,
    );
    tl.from(
      ".b3 .pop",
      { scale: 0, rotation: -8, duration: 0.9, ease: "back.out(2.2)" },
      6.9,
    );
    tl.to(
      ".b3 .pop",
      { scale: 1.08, duration: 0.5, ease: "power1.inOut", yoyo: true, repeat: 1 },
      8.5,
    );

    // Smooth hand-off into Scene 2
    tl.to(".s1-stage", { opacity: 0, duration: 0.4, ease: "power2.in" }, 9.6);
  });

  return (
    <AbsoluteFill>
      <Background accent="teal" />
      <AbsoluteFill ref={scope} className="s1-stage">
        <div className="b1" style={beatWrap}>
          <KineticLine
            style={{ maxWidth: 1480, fontFamily: F.heading, fontWeight: 800, fontSize: 90, color: C.white, lineHeight: 1.05, letterSpacing: "-0.02em" }}
            tokens={[
              { t: "Every" },
              { t: "child" },
              { t: "reads" },
              { t: "at" },
              { t: "their" },
              { t: "own", c: C.gold },
              { t: "pace.", c: C.gold },
            ]}
          />
        </div>

        <div className="b2" style={beatWrap}>
          <KineticLine
            style={{ maxWidth: 1480, fontFamily: F.heading, fontWeight: 800, fontSize: 90, color: C.white, lineHeight: 1.05, letterSpacing: "-0.02em" }}
            tokens={[
              { t: "One" },
              { t: "lesson" },
              { t: "can't" },
              { t: "fit" },
              { t: "them" },
              { t: "all.", c: C.gold },
            ]}
          />
        </div>

        <div className="b3" style={beatWrap}>
          <div style={{ textAlign: "center", fontFamily: F.heading, color: C.white }}>
            <div className="ln" style={{ fontWeight: 600, fontSize: 58, color: C.muted }}>
              What if reading
            </div>
            <div className="ln" style={{ fontWeight: 800, fontSize: 132, lineHeight: 1.05, margin: "6px 0" }}>
              could{" "}
              <span
                className="pop"
                style={{ display: "inline-block", color: C.tealLight, textShadow: `0 0 40px ${C.tealGlow}` }}
              >
                adapt
              </span>
            </div>
            <div className="ln" style={{ fontWeight: 700, fontSize: 58 }}>
              to every child?
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
