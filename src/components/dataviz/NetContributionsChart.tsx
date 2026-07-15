import { useEffect, useState } from "react";
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { scenarios, ALL_CASES } from "./scenarios";
import {
  transform,
  caseOf as caseOfRow,
  message as messageForRow,
  type Row,
} from "../../lib/netContributions";

/* Dark-adapted semantic palette (kept meaningful: invested / gains / losses). */
const C = {
  line: "#f0a062", // balance (orange)
  invested: "#cbbfb2", // beige band
  gains: "#46e0b0", // accent green
  losses: "#e0556b", // red
  grid: "rgba(231,236,241,0.06)",
  axis: "#8a95a3",
  zero: "rgba(231,236,241,0.28)",
  fg: "#e7ecf1",
  panel: "#12161c",
};

const fmt = (n: number) => Math.abs(Math.round(n)).toLocaleString("en-US");
const eur = (n: number) => `${n < 0 ? "−" : ""}€${fmt(n)}`;
const signed = (n: number) =>
  `${n > 0 ? "+" : n < 0 ? "−" : ""}€${fmt(n)}`;

const caseOf = (d: Row) => caseOfRow(d, C);
const message = (d: Row) => messageForRow(d, C);

function Swatch({ color, line }: { color: string; line?: boolean }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: 12,
        height: line ? 3 : 10,
        borderRadius: line ? 2 : 2,
        background: color,
        marginRight: 6,
        verticalAlign: "middle",
      }}
    />
  );
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null;
  const d: Row = payload[0].payload;
  const c = caseOf(d);
  return (
    <div
      style={{
        background: C.panel,
        border: "1px solid rgba(231,236,241,0.16)",
        borderRadius: 10,
        padding: "12px 14px",
        minWidth: 230,
        boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
        fontSize: 13,
        color: C.fg,
      }}
    >
      <div style={{ color: C.axis, fontSize: 11, marginBottom: 8 }}>
        At {d.label}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span><Swatch color={C.line} line />Balance</span>
        <b>{eur(d.balance)}</b>
      </div>
      <div style={{ height: 1, background: "rgba(231,236,241,0.1)", margin: "10px 0" }} />
      <div style={{ color: C.axis, fontSize: 11, marginBottom: 6 }}>Breakdown</div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span><Swatch color={C.invested} />Net invested</span>
        <b style={{ color: d.invested < 0 ? C.gains : C.fg }}>{signed(d.invested)}</b>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span><Swatch color={d.gains < 0 ? C.losses : C.gains} />Gains</span>
        <b style={{ color: d.gains < 0 ? C.losses : C.gains }}>{signed(d.gains)}</b>
      </div>
      <div style={{ height: 1, background: "rgba(231,236,241,0.1)", margin: "10px 0" }} />
      <div style={{ color: C.axis, lineHeight: 1.45, marginBottom: 8 }}>{message(d)}</div>
      <div
        style={{
          display: "inline-block",
          fontSize: 11,
          padding: "2px 8px",
          borderRadius: 999,
          color: c.color,
          border: `1px solid ${c.color}`,
        }}
      >
        Case {c.n} · {c.label}
      </div>
    </div>
  );
}

export default function NetContributionsChart() {
  const ids = Object.keys(scenarios);
  const [sel, setSel] = useState(ids[0]);
  // Auto-cycle through scenarios every 4s until the visitor picks one.
  const [autoplay, setAutoplay] = useState(true);
  const sc = scenarios[sel];
  const data = transform(sc.data);
  const present = new Set(data.map((d) => caseOf(d).n));

  useEffect(() => {
    if (!autoplay) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => {
      setSel((cur) => ids[(ids.indexOf(cur) + 1) % ids.length]);
    }, 4000);
    return () => clearInterval(t);
  }, [autoplay]);

  const reduce =
    typeof window !== "undefined" &&
    !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const pick = (id: string) => {
    setAutoplay(false); // any click stops the carousel for good
    if (id !== sel) {
      window.posthog?.capture("dataviz_scenario_switched", {
        scenario_id: id,
        scenario_name: scenarios[id].name,
        previous_scenario_id: sel,
      });
      setSel(id);
    }
  };

  return (
    <div>
      {/* Scenario tabs */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {ids.map((id) => {
          const on = id === sel;
          return (
            <button
              key={id}
              onClick={() => pick(id)}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                padding: "6px 12px",
                borderRadius: 999,
                cursor: "pointer",
                color: on ? "#0b0e12" : C.axis,
                background: on ? C.gains : "transparent",
                border: `1px solid ${on ? C.gains : "rgba(231,236,241,0.14)"}`,
                transition: "all .2s ease",
              }}
            >
              {scenarios[id].name}
            </button>
          );
        })}
      </div>

      <div
        style={{
          borderRadius: 12,
          border: "1px solid rgba(231,236,241,0.08)",
          background: "rgba(18,22,28,0.5)",
          padding: 16,
        }}
      >
        <div style={{ width: "100%", height: 380 }}>
          <ResponsiveContainer>
            <ComposedChart key={sel} data={data} margin={{ top: 16, right: 12, left: 0, bottom: 4 }}>
              <CartesianGrid vertical={false} stroke={C.grid} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: C.axis }}
                interval="preserveStartEnd"
                minTickGap={24}
              />
              <YAxis
                tickFormatter={(v: number) => `${v / 1000}k`}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: C.axis }}
                width={40}
              />
              <ReferenceLine y={0} stroke={C.zero} strokeWidth={1.5} />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ stroke: C.axis, strokeDasharray: "3 3" }}
              />
              <Area dataKey="invested_band" stroke="none" fill={C.invested} fillOpacity={0.2} isAnimationActive={!reduce} animationBegin={0} animationDuration={650} animationEasing="ease-out" connectNulls activeDot={false} />
              <Area dataKey="gains_band" stroke="none" fill={C.gains} fillOpacity={0.24} isAnimationActive={!reduce} animationBegin={120} animationDuration={650} animationEasing="ease-out" connectNulls={false} activeDot={false} />
              <Area dataKey="losses_band" stroke="none" fill={C.losses} fillOpacity={0.24} isAnimationActive={!reduce} animationBegin={120} animationDuration={650} animationEasing="ease-out" connectNulls={false} activeDot={false} />
              <Line dataKey="balance" stroke={C.line} strokeWidth={2.5} dot={false} isAnimationActive={!reduce} animationBegin={260} animationDuration={900} animationEasing="ease-out" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 16,
            marginTop: 12,
            fontSize: 12,
            color: C.axis,
          }}
        >
          <span><Swatch color={C.line} line />Balance</span>
          <span><Swatch color={C.invested} />Net invested</span>
          <span><Swatch color={C.gains} />Gains</span>
          <span><Swatch color={C.losses} />Losses</span>
        </div>
      </div>

      {/* Scenario description */}
      <p style={{ marginTop: 16, color: C.axis, fontSize: 15, lineHeight: 1.55, maxWidth: "60ch" }}>
        {sc.description}
      </p>

      {/* States crossed */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
        {ALL_CASES.map((c) => {
          const on = present.has(c.n);
          return (
            <span
              key={c.n}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                padding: "3px 8px",
                borderRadius: 999,
                color: on ? C.fg : "rgba(231,236,241,0.3)",
                border: `1px solid ${on ? "rgba(231,236,241,0.25)" : "rgba(231,236,241,0.08)"}`,
                background: on ? "rgba(231,236,241,0.04)" : "transparent",
              }}
            >
              {c.n} · {c.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}
