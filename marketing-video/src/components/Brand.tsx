import type { CSSProperties } from "react";
import { C } from "../theme";
import { F } from "../fonts";

/** The rounded-square "D" mark from the app favicon. */
export const LogoMark = ({
  size = 120,
  className,
  style,
}: {
  size?: number;
  className?: string;
  style?: CSSProperties;
}) => (
  <div
    className={className}
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.28,
      background: `linear-gradient(145deg, ${C.tealLight}, ${C.teal})`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: `0 0 ${size * 0.45}px ${C.tealGlow}, inset 0 2px 6px rgba(255,255,255,0.28)`,
      fontFamily: F.heading,
      fontWeight: 800,
      color: C.white,
      fontSize: size * 0.56,
      lineHeight: 1,
      ...style,
    }}
  >
    D
  </div>
);

/** "Dunong" + gold "AI" wordmark. */
export const Wordmark = ({
  size = 92,
  className,
  style,
}: {
  size?: number;
  className?: string;
  style?: CSSProperties;
}) => (
  <div
    className={className}
    style={{
      fontFamily: F.heading,
      fontWeight: 800,
      fontSize: size,
      color: C.white,
      letterSpacing: "-0.02em",
      lineHeight: 1,
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    Dunong<span style={{ color: C.gold }}>AI</span>
  </div>
);
