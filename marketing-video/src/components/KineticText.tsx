import type { CSSProperties } from "react";

export type Token = { t: string; c?: string; weight?: number };

/**
 * Renders a line of text as individually-maskable words. Each word sits inside
 * an `overflow: hidden` wrapper so a GSAP `from({ yPercent: 120 })` produces a
 * clean "rise from behind the line" reveal. Target the inner `.${wordClass}`
 * spans with a stagger.
 */
export const KineticLine = ({
  tokens,
  wordClass = "kw",
  style,
  gap = "0 0.3em",
}: {
  tokens: Token[];
  wordClass?: string;
  style?: CSSProperties;
  gap?: string;
}) => (
  <div
    style={{
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      alignItems: "flex-end",
      gap,
      ...style,
    }}
  >
    {tokens.map((tok, i) => (
      <span
        key={i}
        style={{
          display: "inline-block",
          overflow: "hidden",
          paddingBottom: "0.16em",
        }}
      >
        <span
          className={wordClass}
          style={{
            display: "inline-block",
            color: tok.c,
            fontWeight: tok.weight,
          }}
        >
          {tok.t}
        </span>
      </span>
    ))}
  </div>
);
