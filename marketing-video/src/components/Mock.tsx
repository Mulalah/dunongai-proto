import type { CSSProperties, ReactNode } from "react";
import { C } from "../theme";
import { F } from "../fonts";
import { IconChat, IconLock, IconSparkle, IconStar, IconCheck } from "./icons";

const Dot = ({ color }: { color: string }) => (
  <div style={{ width: 13, height: 13, borderRadius: 999, background: color }} />
);

/** Chrome browser window frame. Inner content area is positioned relative. */
export const BrowserFrame = ({
  url = "dunongai.ph",
  width = 1180,
  height = 720,
  children,
  className,
  style,
}: {
  url?: string;
  width?: number;
  height?: number;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) => (
  <div
    className={className}
    style={{
      width,
      height,
      borderRadius: 26,
      overflow: "hidden",
      background: C.white,
      boxShadow:
        "0 50px 130px -24px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.06)",
      ...style,
    }}
  >
    <div
      style={{
        height: 56,
        background: C.navy,
        display: "flex",
        alignItems: "center",
        padding: "0 22px",
        gap: 11,
      }}
    >
      <Dot color="#FF5F57" />
      <Dot color="#FEBC2E" />
      <Dot color="#28C840" />
      <div
        style={{
          flex: 1,
          marginLeft: 16,
          height: 32,
          borderRadius: 9,
          background: "rgba(255,255,255,0.08)",
          display: "flex",
          alignItems: "center",
          gap: 9,
          padding: "0 15px",
          color: C.muted,
          fontFamily: F.body,
          fontSize: 16,
        }}
      >
        <IconLock size={15} color={C.success} />
        <span>{url}</span>
      </div>
    </div>
    <div style={{ height: height - 56, position: "relative" }}>{children}</div>
  </div>
);

/** A gold-underlined "tappable" vocabulary word, as seen in the story reader. */
export const HighlightWord = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <span
    className={className}
    style={{
      color: C.gold,
      fontWeight: 700,
      borderBottom: `3px solid ${C.gold}`,
      paddingBottom: 1,
    }}
  >
    {children}
  </span>
);

/** Basa Bot chat bubble. */
export const BotBubble = ({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) => (
  <div
    className={className}
    style={{
      display: "flex",
      gap: 12,
      alignItems: "flex-start",
      ...style,
    }}
  >
    <div
      style={{
        width: 44,
        height: 44,
        borderRadius: 12,
        background: C.teal,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        boxShadow: `0 0 22px ${C.tealGlow}`,
      }}
    >
      <IconChat size={24} color={C.white} />
    </div>
    <div
      style={{
        background: C.teal,
        color: C.white,
        borderRadius: "4px 16px 16px 16px",
        padding: "14px 18px",
        fontFamily: F.body,
        fontSize: 21,
        lineHeight: 1.45,
        maxWidth: 360,
      }}
    >
      {children}
    </div>
  </div>
);

/**
 * Full story-reader screen used in the Introduction scene. Inner elements carry
 * stable classNames (`.sr-title`, `.sr-line`, `.sr-bot`, `.sr-chip`) so the
 * scene can stagger them in via GSAP.
 */
export const StoryReaderMock = () => (
  <div style={{ display: "flex", height: "100%", background: C.cream }}>
    {/* Story column */}
    <div style={{ flex: 1.6, padding: "44px 50px", overflow: "hidden" }}>
      <div
        className="sr-chip"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          background: C.teal,
          color: C.white,
          fontFamily: F.heading,
          fontWeight: 700,
          fontSize: 17,
          padding: "7px 15px",
          borderRadius: 999,
          marginBottom: 22,
        }}
      >
        <IconStar size={16} color={C.gold} /> Antas 2 • Kuwento
      </div>
      <div
        className="sr-title"
        style={{
          fontFamily: F.heading,
          fontWeight: 800,
          fontSize: 44,
          color: C.ink,
          marginBottom: 26,
          letterSpacing: "-0.01em",
        }}
      >
        Ang Taniman ni Lolo Pedro
      </div>
      <div
        style={{
          fontFamily: F.reading,
          fontSize: 27,
          lineHeight: 1.85,
          color: "#243142",
        }}
      >
        <p className="sr-line" style={{ margin: "0 0 18px" }}>
          Tuwing umaga, inaalagaan ni Lolo Pedro ang kanyang{" "}
          <HighlightWord className="sr-hl">taniman</HighlightWord> ng mga gulay.
        </p>
        <p className="sr-line" style={{ margin: "0 0 18px" }}>
          Masipag siyang magdilig at nag-aalaga ng bawat{" "}
          <HighlightWord className="sr-hl">binhi</HighlightWord> na kanyang
          itinanim.
        </p>
        <p className="sr-line" style={{ margin: 0 }}>
          Sa tulong ng araw at ulan, lumago ang mga halaman nang masagana.
        </p>
      </div>
    </div>

    {/* Basa Bot panel */}
    <div
      style={{
        flex: 1,
        background: C.white,
        borderLeft: `1px solid ${C.line}`,
        padding: "30px 28px",
        display: "flex",
        flexDirection: "column",
        gap: 18,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontFamily: F.heading,
          fontWeight: 700,
          fontSize: 22,
          color: C.ink,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: C.teal,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <IconChat size={20} color={C.white} />
        </div>
        Basa Bot
        <span
          style={{
            marginLeft: "auto",
            fontSize: 13,
            fontWeight: 600,
            color: C.teal,
            background: C.teal + "1A",
            padding: "4px 10px",
            borderRadius: 999,
          }}
        >
          ● Online
        </span>
      </div>

      <BotBubble className="sr-bot" style={{ marginTop: 4 }}>
        Kumusta! Pindutin ang anumang naka-highlight na salita at ipapaliwanag ko
        ito sa iyo.
      </BotBubble>

      <div
        className="sr-bot"
        style={{
          alignSelf: "flex-end",
          background: C.navy,
          color: C.white,
          borderRadius: "16px 4px 16px 16px",
          padding: "12px 16px",
          fontFamily: F.body,
          fontSize: 20,
          maxWidth: 300,
        }}
      >
        Ano ang ibig sabihin ng <b style={{ color: C.goldLight }}>taniman</b>?
      </div>

      <BotBubble className="sr-bot">
        Ang <b>taniman</b> ay lugar kung saan nagtatanim ng mga halaman o gulay,
        tulad ng hardin!
      </BotBubble>
    </div>
  </div>
);

/* ---------- Feature mini-mocks (Scene 3) ---------- */

/** Feature 1 — Basa Bot tap-to-explain. */
export const BasaBotMini = () => (
  <div
    style={{
      width: 560,
      background: C.white,
      borderRadius: 22,
      padding: "30px 32px",
      boxShadow: "0 30px 80px -24px rgba(0,0,0,0.5)",
    }}
  >
    <div
      style={{
        fontFamily: F.reading,
        fontSize: 26,
        lineHeight: 1.7,
        color: "#243142",
        marginBottom: 22,
      }}
    >
      Lumago ang mga halaman sa{" "}
      <HighlightWord className="fx-hl">masaganang</HighlightWord> lupa.
    </div>
    <BotBubble className="fx-bubble">
      <b>Masagana</b> = sagana o marami — ibig sabihin maraming ani!
    </BotBubble>
  </div>
);

const StepBar = ({
  active,
  label,
  h,
  className,
}: {
  active: boolean;
  label: string;
  h: number;
  className?: string;
}) => (
  <div
    style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}
  >
    <div
      className={className}
      style={{
        width: 86,
        height: h,
        borderRadius: 16,
        background: active
          ? `linear-gradient(180deg, ${C.tealLight}, ${C.teal})`
          : "rgba(255,255,255,0.10)",
        border: `1px solid ${active ? C.tealLight : "rgba(255,255,255,0.16)"}`,
        boxShadow: active ? `0 0 30px ${C.tealGlow}` : "none",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: 14,
        transformOrigin: "bottom center",
      }}
    >
      {active && <IconCheck size={28} color={C.white} />}
    </div>
    <div
      style={{
        fontFamily: F.heading,
        fontWeight: 700,
        fontSize: 20,
        color: active ? C.white : C.muted,
      }}
    >
      {label}
    </div>
  </div>
);

/** Feature 2 — adaptive level ladder. */
export const LevelMini = () => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
    <div
      className="fx-badge"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 12,
        background: `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`,
        color: C.navy,
        fontFamily: F.heading,
        fontWeight: 800,
        fontSize: 30,
        padding: "14px 28px",
        borderRadius: 18,
        boxShadow: `0 0 36px ${C.goldGlow}`,
      }}
    >
      <IconStar size={28} color={C.navy} /> Antas 2 — Nakaangat!
    </div>
    <div style={{ display: "flex", alignItems: "flex-end", gap: 28 }}>
      <StepBar className="fx-step" active label="Antas 1" h={120} />
      <StepBar className="fx-step" active label="Antas 2" h={180} />
      <StepBar className="fx-step" active={false} label="Antas 3" h={240} />
    </div>
  </div>
);

const StudentRow = ({
  name,
  status,
  ok,
  className,
}: {
  name: string;
  status: string;
  ok: boolean;
  className?: string;
}) => (
  <div
    className={className}
    style={{
      display: "flex",
      alignItems: "center",
      gap: 16,
      background: C.white,
      borderRadius: 14,
      padding: "14px 18px",
      boxShadow: "0 10px 30px -18px rgba(0,0,0,0.5)",
    }}
  >
    <div
      style={{
        width: 42,
        height: 42,
        borderRadius: 999,
        background: ok ? C.teal : C.gold,
        color: C.white,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: F.heading,
        fontWeight: 800,
        fontSize: 19,
      }}
    >
      {name[0]}
    </div>
    <div style={{ fontFamily: F.heading, fontWeight: 700, fontSize: 22, color: C.ink }}>
      {name}
    </div>
    <div
      style={{
        marginLeft: "auto",
        fontFamily: F.body,
        fontWeight: 600,
        fontSize: 16,
        color: ok ? C.success : C.gold,
        background: (ok ? C.success : C.gold) + "1A",
        padding: "6px 14px",
        borderRadius: 999,
      }}
    >
      {status}
    </div>
  </div>
);

/** Feature 3 — teacher dashboard with AI summary. */
export const DashboardMini = () => (
  <div style={{ display: "flex", gap: 26, alignItems: "stretch" }}>
    <div style={{ display: "flex", flexDirection: "column", gap: 14, width: 420 }}>
      <StudentRow className="fx-row" name="Maria" status="On track" ok />
      <StudentRow className="fx-row" name="Jose" status="Needs help" ok={false} />
      <StudentRow className="fx-row" name="Ana" status="On track" ok />
    </div>
    <div
      className="fx-summary"
      style={{
        width: 380,
        background: `linear-gradient(160deg, ${C.panel}, ${C.navy})`,
        border: `1px solid ${C.teal}55`,
        borderRadius: 18,
        padding: "24px 24px",
        color: C.white,
        boxShadow: `0 0 40px ${C.tealGlow}`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontFamily: F.heading,
          fontWeight: 700,
          fontSize: 22,
          marginBottom: 16,
        }}
      >
        <IconSparkle size={22} color={C.goldLight} /> AI Summary
      </div>
      <div
        style={{
          fontFamily: F.body,
          fontSize: 19,
          lineHeight: 1.6,
          color: "#C7CDD7",
        }}
      >
        Jose struggles with comprehension on longer texts. Suggest Antas 1
        stories on <b style={{ color: C.goldLight }}>daily routines</b> this week.
      </div>
    </div>
  </div>
);
