import { useEffect, useRef, useState } from "react";

/* Live mini-showcase of Alba — the design system I built at Nalo.
   Real token values (exported from Figma) drive the whole card; the Light/Dark
   toggle swaps the semantic token set, re-theming tokens + components in place.
   Demonstrates token-based theming, not a folder of screenshots. */

type Theme = {
  surface: string;
  card: string;
  text: string;
  textSec: string;
  border: string;
  swatches: { token: string; hex: string }[];
  btn: Record<string, { bg: string; fg: string; border: string }>;
};

const LIGHT: Theme = {
  surface: "#f4f1ec",
  card: "#ffffff",
  text: "#112122",
  textSec: "#414d4e",
  border: "#d3d4d3",
  swatches: [
    { token: "action/primary", hex: "#c15429" },
    { token: "action/accent", hex: "#8f320d" },
    { token: "bg/secondary", hex: "#efe3d7" },
    { token: "text/default", hex: "#112122" },
    { token: "status/success", hex: "#00826a" },
    { token: "border/default", hex: "#d3d4d3" },
  ],
  btn: {
    Primary: { bg: "#c15429", fg: "#ffffff", border: "transparent" },
    Secondary: { bg: "#efe3d7", fg: "#112122", border: "transparent" },
    Tertiary: { bg: "transparent", fg: "#112122", border: "transparent" },
    Ghost: { bg: "transparent", fg: "#112122", border: "#d4c9be" },
    Danger: { bg: "#8f320d", fg: "#ffffff", border: "transparent" },
  },
};

const DARK: Theme = {
  surface: "#262630",
  card: "#1c1c24",
  text: "#ebebf2",
  textSec: "#bebecd",
  border: "#373746",
  swatches: [
    { token: "action/primary", hex: "#c15429" },
    { token: "action/accent", hex: "#8f320d" },
    { token: "bg/secondary", hex: "#1c1c24" },
    { token: "text/default", hex: "#ebebf2" },
    { token: "status/success", hex: "#00826a" },
    { token: "border/default", hex: "#373746" },
  ],
  btn: {
    Primary: { bg: "#c15429", fg: "#ffffff", border: "transparent" },
    Secondary: { bg: "#1c1c24", fg: "#ebebf2", border: "#373746" },
    Tertiary: { bg: "transparent", fg: "#ebebf2", border: "transparent" },
    Ghost: { bg: "transparent", fg: "#ebebf2", border: "#373746" },
    Danger: { bg: "#8f320d", fg: "#ffffff", border: "transparent" },
  },
};

const BUTTONS = ["Primary", "Secondary", "Tertiary", "Ghost", "Danger"];
const TAGS = [
  { label: "Success", color: "#1aa888" },
  { label: "Brand", color: "#e16f2c" },
  { label: "Info", color: "#7c8cff" },
];

const font = "var(--font-sans)";

export default function AlbaShowcase() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [dark, setDark] = useState(false);
  const t = dark ? DARK : LIGHT;

  useEffect(() => {
    let raf = 0;

    const updateThemeFromScroll = () => {
      const root = rootRef.current;
      if (!root) return;

      const rect = root.getBoundingClientRect();
      const viewportMidpoint = window.innerHeight * 0.5;
      const componentMidpoint = rect.top + rect.height * 0.5;
      const nextDark = componentMidpoint <= viewportMidpoint;

      setDark((current) => (current === nextDark ? current : nextDark));
    };

    const scheduleUpdate = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        updateThemeFromScroll();
      });
    };

    updateThemeFromScroll();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      style={{
        fontFamily: font,
        background: t.surface,
        border: `1px solid ${t.border}`,
        borderRadius: 16,
        padding: "clamp(18px, 3vw, 28px)",
        color: t.text,
        transition: "background 0.35s ease, color 0.35s ease, border-color 0.35s ease",
      }}
    >
      {/* Header + theme toggle */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.01em" }}>Alba</div>
          <div style={{ fontSize: 13, color: t.textSec }}>tokens → components, themed live</div>
        </div>
        <div
          style={{
            display: "inline-flex",
            padding: 3,
            borderRadius: 999,
            background: dark ? "#121218" : "#efe3d7",
            border: `1px solid ${t.border}`,
          }}
        >
          {(["Light", "Dark"] as const).map((m) => {
            const on = (m === "Dark") === dark;
            return (
              <button
                key={m}
                onClick={() => setDark(m === "Dark")}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  padding: "5px 12px",
                  borderRadius: 999,
                  border: "none",
                  cursor: "pointer",
                  color: on ? (dark ? "#ebebf2" : "#112122") : t.textSec,
                  background: on ? (dark ? "#262630" : "#ffffff") : "transparent",
                  transition: "all 0.25s ease",
                }}
              >
                {m}
              </button>
            );
          })}
        </div>
      </div>

      {/* Token swatches */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(96px, 1fr))", gap: 10, marginBottom: 24 }}>
        {t.swatches.map((s) => (
          <div key={s.token}>
            <div
              style={{
                height: 44,
                borderRadius: 8,
                background: s.hex,
                border: `1px solid ${t.border}`,
              }}
            />
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, marginTop: 6, color: t.textSec, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {s.token}
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: dark ? "#8c8ca0" : "#8c8ca0" }}>{s.hex}</div>
          </div>
        ))}
      </div>

      {/* Components: buttons */}
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.08em", color: t.textSec, marginBottom: 10 }}>
        Button · 5 variants
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 22 }}>
        {BUTTONS.map((v) => {
          const b = t.btn[v];
          return (
            <span
              key={v}
              style={{
                display: "inline-flex",
                alignItems: "center",
                height: 38,
                padding: "0 16px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                background: b.bg,
                color: b.fg,
                border: `1px solid ${b.border}`,
                transition: "all 0.35s ease",
              }}
            >
              {v}
            </span>
          );
        })}
      </div>

      {/* Components: tags + type */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16 }}>
        <div style={{ display: "flex", gap: 6 }}>
          {TAGS.map((tag) => (
            <span
              key={tag.label}
              style={{
                display: "inline-flex",
                alignItems: "center",
                height: 22,
                padding: "0 8px",
                borderRadius: 4,
                fontSize: 12,
                fontWeight: 700,
                color: tag.color,
                border: `1px solid ${tag.color}`,
                background: `${tag.color}1a`,
              }}
            >
              {tag.label}
            </span>
          ))}
        </div>
        <div style={{ marginLeft: "auto", textAlign: "right" }}>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1 }}>Rethink Sans</div>
          <div style={{ fontSize: 12, color: t.textSec, fontFamily: "var(--font-mono)" }}>27 type styles</div>
        </div>
      </div>
    </div>
  );
}
