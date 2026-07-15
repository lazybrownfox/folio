import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  CFG,
  buildData,
  niceStep,
  xTicksFor,
  annualPctFor,
} from "../../lib/projection";

/* Real artifact ported from the Nalo "projection / progressive securing"
   prototype. One reference case, dark-themed, English labels. The toggle
   morphs (rAF-interpolated) between a secured glide-path (flatter, lower risk
   near term) and an unsecured one (convex, higher target, higher risk). */

const C = {
  card: "rgba(18,22,28,0.5)",
  border: "rgba(231,236,241,0.08)",
  text: "#e7ecf1",
  textSoft: "#8a95a3",
  grid: "rgba(231,236,241,0.08)",
  divider: "rgba(231,236,241,0.10)",
  favorable: "#e4cfb0", // beige — best case
  median: "#46e0b0", // accent green — expected
  defavorable: "#e0556b", // red — worst case
  versements: "#8a95a3", // slate dashed — contributions
  cone: "#46e0b0",
  accent: "#f0a062", // warm orange — %/yr
  positive: "#46e0b0",
  warning: "#f0a062",
};

/* ------------------------------------------------------------- formatters */
const grp = (n: number) => Math.round(n).toLocaleString("en-US");
const fmtRound = (n: number) => "€" + grp(Math.round(n / 100) * 100);
const fmtAxis = (v: number) => {
  if (v === 0) return "€0";
  if (Math.abs(v) >= 1e6) {
    const m = v / 1e6;
    return `€${Number.isInteger(m) ? m : m.toFixed(1)}M`;
  }
  if (Math.abs(v) >= 1000) return `€${Math.round(v / 1000)}k`;
  return `€${Math.round(v)}`;
};

/* ----------------------------------------------------------------- tooltip */
function TooltipBox({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;
  const val = (k: string) => payload.find((p: any) => p.dataKey === k)?.value;
  const row = (color: string, name: string, v: number, dashed?: boolean) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 28,
        padding: "5px 0",
        fontSize: 13,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {dashed ? (
          <div style={{ width: 18, borderTop: `2px dashed ${color}`, height: 0 }} />
        ) : (
          <div style={{ width: 14, height: 3, background: color, borderRadius: 2 }} />
        )}
        <span style={{ color: C.text }}>{name}</span>
      </div>
      <span style={{ fontWeight: 600, color: C.text }}>
        {v != null ? fmtRound(v) : "—"}
      </span>
    </div>
  );
  return (
    <div
      style={{
        background: "#12161c",
        border: `1px solid rgba(231,236,241,0.16)`,
        borderRadius: 12,
        padding: "14px 18px",
        minWidth: 230,
        boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
      }}
    >
      <div
        style={{
          fontSize: 12,
          color: C.textSoft,
          paddingBottom: 10,
          marginBottom: 6,
          borderBottom: `1px solid ${C.divider}`,
        }}
      >
        At Jan {label}
      </div>
      {row(C.favorable, "Best case", val("favorable"))}
      {row(C.median, "Expected", val("median"))}
      {row(C.defavorable, "Worst case", val("defavorable"))}
      {row(C.versements, "Contributions", val("versements"), true)}
    </div>
  );
}

const ActiveDot = ({ cx, cy, fill }: any) => (
  <circle cx={cx} cy={cy} r={5} fill="#0b0e12" stroke={fill} strokeWidth={2.5} />
);

/* -------------------------------------------------------------- compare card */
function CompareCard({ label, pct, capital, dim }: any) {
  return (
    <div
      style={{
        flex: "1 1 240px",
        minWidth: 0,
        background: "rgba(231,236,241,0.04)",
        border: `1px solid ${C.border}`,
        borderRadius: 14,
        padding: "14px 18px",
        opacity: dim ? 0.55 : 1,
        transition: "opacity 0.35s ease",
      }}
    >
      <div style={{ fontSize: 13, color: C.textSoft, marginBottom: 8 }}>{label}</div>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 10,
          flexWrap: "wrap",
          fontWeight: 700,
          letterSpacing: "-0.25px",
          fontSize: "clamp(20px, 2.4vw, 28px)",
          lineHeight: 1.1,
        }}
      >
        <span style={{ color: C.accent, fontFamily: "var(--font-mono)" }}>{pct}</span>
        <span style={{ color: C.text }}>{capital}</span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- toggle */
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label="Progressive derisking"
      onClick={() => onChange(!checked)}
      style={{
        position: "relative",
        width: 52,
        height: 30,
        borderRadius: 999,
        background: checked ? C.median : "rgba(231,236,241,0.18)",
        border: "none",
        cursor: "pointer",
        transition: "background 0.3s cubic-bezier(0.65,0,0.35,1)",
        padding: 0,
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 3,
          left: checked ? 25 : 3,
          width: 24,
          height: 24,
          borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 2px 6px rgba(0,0,0,0.35)",
          transition: "left 0.25s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      />
    </button>
  );
}

/* -------------------------------------------------------------- legend */
const swatch = (bg: string): React.CSSProperties => ({
  display: "inline-block",
  width: 22,
  height: 9,
  background: bg,
  borderRadius: 3,
});
function Legend() {
  const item: React.CSSProperties = { display: "flex", alignItems: "center", gap: 10 };
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
        gap: "10px 24px",
        paddingTop: 20,
        fontSize: 13,
        color: C.text,
      }}
    >
      <div style={item}><span style={swatch(C.favorable)} />Best case · 10% · +8.5%/yr</div>
      <div style={item}><span style={swatch(C.median)} />Expected · 90% · +6.2%/yr</div>
      <div style={item}><span style={swatch(C.defavorable)} />Worst case · 2% · −2.89%/yr</div>
      <div style={item}>
        <span style={{ display: "inline-flex", width: 24 }}>
          <span style={{ width: "100%", borderTop: `2.5px dashed ${C.versements}` }} />
        </span>
        Total contributions
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- main */
export default function ProjectionDataviz() {
  const [boost, setBoost] = useState(true); // securing ON by default
  const [revealing, setRevealing] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setRevealing(false), 950);
    return () => clearTimeout(t);
  }, []);

  const lowData = useMemo(() => buildData(true, CFG), []);
  const highData = useMemo(() => buildData(false, CFG), []);

  // rAF-interpolated morph between secured (prog 0) and unsecured (prog 1).
  const scaleHigh = !boost;
  const progRef = useRef(scaleHigh ? 1 : 0);
  const [prog, setProg] = useState(scaleHigh ? 1 : 0);
  useEffect(() => {
    const target = scaleHigh ? 1 : 0;
    const from = progRef.current;
    if (from === target) return;
    const dur = 750;
    const start = performance.now();
    const ease = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const v = from + (target - from) * ease(t);
      progRef.current = v;
      setProg(v);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [scaleHigh]);

  const lerp = (a: number, b: number) => a + (b - a) * prog;
  const data = lowData.map((d, i) => {
    const h = highData[i];
    return {
      year: d.year,
      favorable: lerp(d.favorable, h.favorable),
      median: lerp(d.median, h.median),
      defavorable: lerp(d.defavorable, h.defavorable),
      versements: d.versements,
      cone: [lerp(d.cone[0], h.cone[0]), lerp(d.cone[1], h.cone[1])],
      innerCone: [lerp(d.innerCone[0], h.innerCone[0]), lerp(d.innerCone[1], h.innerCone[1])],
    };
  });

  const vals = data.flatMap((d) => [d.defavorable, d.favorable, d.versements]);
  const lo = Math.min(...vals);
  const hi = Math.max(...vals);
  const range = hi - lo || hi || 1;
  let ceil = hi + range * 0.12;
  let floor = lo < hi * 0.35 ? 0 : lo - range * 0.12;
  const step = niceStep(ceil - floor);
  floor = Math.max(0, Math.floor(floor / step) * step);
  ceil = Math.ceil(ceil / step) * step;
  const yTicks: number[] = [];
  for (let v = floor; v <= ceil + step * 0.001; v += step) yTicks.push(Math.round(v));
  const xticks = xTicksFor(CFG.startYear, CFG.endYear);

  const capSans = highData[highData.length - 1].favorable;
  const capAvec = lowData[lowData.length - 1].favorable;
  const pctOf = (v: number) => `${annualPctFor(v, CFG).toFixed(2)}%/yr`;
  const wide = Math.max(Math.abs(floor), Math.abs(ceil)) >= 1e6;
  const yAxisW = wide ? 64 : 48;
  const risk = (3.5 + 2.5 * prog).toFixed(1);

  return (
    <div
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 16,
        padding: "clamp(16px, 3vw, 24px)",
      }}
    >
      {/* Header: title + toggle */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
          marginBottom: 18,
        }}
      >
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: C.text }}>
            25-year projection · €3,000 + €84/mo
          </div>
          <div style={{ fontSize: 13, color: C.textSoft, marginTop: 2 }}>
            Risk score: <b style={{ color: boost ? C.positive : C.warning }}>{risk}</b> / 10
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, whiteSpace: "nowrap" }}>
            <span
              style={{
                fontSize: 15,
                fontWeight: 500,
                color: boost ? C.positive : C.textSoft,
                transition: "color 0.3s ease",
              }}
            >
              Progressive derisking {boost ? "on" : "off"}
            </span>
            <Toggle
              checked={boost}
              onChange={(v) => {
                window.posthog?.capture("projection_strategy_toggled", {
                  strategy: v ? "secured" : "unsecured",
                });
                setBoost(v);
              }}
            />
          </div>
          <span
            style={{
              fontSize: 12,
              color: boost ? C.textSoft : C.accent,
              transition: "color 0.3s ease",
            }}
          >
            {boost ? "Lower risk at horizon" : "Higher risk at horizon"}
          </span>
        </div>
      </div>

      {/* Compare cards */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 4 }}>
        <CompareCard label="Without derisking · at horizon" pct={pctOf(capSans)} capital={fmtRound(capSans)} dim={boost} />
        <CompareCard label="With derisking · at horizon" pct={pctOf(capAvec)} capital={fmtRound(capAvec)} dim={!boost} />
      </div>

      {/* Chart */}
      <div style={{ width: "100%", height: 380, marginTop: 12 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 16, right: 4, left: 0, bottom: 4 }}>
            <defs>
              <linearGradient id="coneGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={C.cone} stopOpacity={0.04} />
                <stop offset="100%" stopColor={C.cone} stopOpacity={0.18} />
              </linearGradient>
              <linearGradient id="innerConeGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={C.median} stopOpacity={0.06} />
                <stop offset="100%" stopColor={C.median} stopOpacity={0.26} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" stroke={C.grid} vertical={false} />
            <XAxis
              dataKey="year"
              ticks={xticks}
              tick={{ fontSize: 12, fill: C.textSoft }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              orientation="right"
              width={yAxisW}
              ticks={yTicks}
              tickFormatter={fmtAxis}
              tick={{ fontSize: 12, fill: C.textSoft }}
              tickLine={false}
              axisLine={false}
              domain={[floor, ceil]}
              allowDataOverflow={false}
            />
            <Tooltip
              content={<TooltipBox />}
              cursor={{ stroke: C.textSoft, strokeWidth: 1, strokeDasharray: "3 3" }}
              position={{ y: 8 }}
            />
            <Area type="monotone" dataKey="cone" stroke="none" fill="url(#coneGrad)" fillOpacity={1} isAnimationActive={revealing} animationDuration={900} animationEasing="ease-out" />
            <Area type="monotone" dataKey="innerCone" stroke="none" fill="url(#innerConeGrad)" fillOpacity={1} isAnimationActive={revealing} animationDuration={900} animationEasing="ease-out" />
            <Line type="monotone" dataKey="favorable" stroke={C.favorable} strokeWidth={2.5} dot={false} activeDot={<ActiveDot fill={C.favorable} />} isAnimationActive={revealing} animationDuration={900} animationEasing="ease-out" />
            <Line type="monotone" dataKey="median" stroke={C.median} strokeWidth={3} dot={false} activeDot={<ActiveDot fill={C.median} />} isAnimationActive={revealing} animationDuration={900} animationEasing="ease-out" />
            <Line type="monotone" dataKey="defavorable" stroke={C.defavorable} strokeWidth={2.5} dot={false} activeDot={<ActiveDot fill={C.defavorable} />} isAnimationActive={revealing} animationDuration={900} animationEasing="ease-out" />
            <Line type="monotone" dataKey="versements" stroke={C.versements} strokeWidth={2} strokeDasharray="6 4" dot={false} activeDot={<ActiveDot fill={C.versements} />} isAnimationActive={revealing} animationDuration={900} animationEasing="ease-out" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <Legend />
    </div>
  );
}
