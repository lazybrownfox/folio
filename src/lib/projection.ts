// Pure computation for the "projection / progressive securing" dataviz.
// Extracted from ProjectionChart.tsx so the compounding model and IRR solver
// can be reused, unit-tested, and benchmarked independently of the rendering.

export const SAFE_RATE = 0.018;

export const RATES = {
  favorable: 0.075,
  median: 0.061,
  defavorable: -0.0289,
  innerUpper: 0.066,
  innerLower: 0.028,
};

export interface Cfg {
  startYear: number;
  endYear: number;
  v0: number;
  monthly: number;
}

export const CFG: Cfg = { startYear: 2026, endYear: 2051, v0: 3000, monthly: 84 };

// Progressive securing: rate converges toward the safe rate near the horizon.
export const yearRate = (
  target: number,
  t: number,
  secured: boolean,
  N: number,
) => {
  if (!secured) return target;
  const span = Math.max(1, N - 1);
  const w = Math.max(0.25, 1 - (t / span) * 0.75);
  return target >= SAFE_RATE
    ? SAFE_RATE + w * (target - SAFE_RATE)
    : SAFE_RATE - w * (SAFE_RATE - target);
};

export const series = (target: number, secured: boolean, cfg: Cfg) => {
  const N = cfg.endYear - cfg.startYear;
  const out = [cfg.v0];
  let v = cfg.v0;
  for (let t = 1; t <= N; t++) {
    v = v * (1 + yearRate(target, t - 1, secured, N)) + cfg.monthly * 12;
    out.push(v);
  }
  return out;
};

export interface Row {
  year: number;
  favorable: number;
  median: number;
  defavorable: number;
  versements: number;
  cone: [number, number];
  innerCone: [number, number];
}

export const buildData = (secured: boolean, cfg: Cfg): Row[] => {
  const f = series(RATES.favorable, secured, cfg);
  const m = series(RATES.median, secured, cfg);
  const d = series(RATES.defavorable, secured, cfg);
  const iu = series(RATES.innerUpper, secured, cfg);
  const il = series(RATES.innerLower, secured, cfg);
  const years: number[] = [];
  for (let y = cfg.startYear; y <= cfg.endYear; y++) years.push(y);
  return years.map((year, i) => ({
    year,
    favorable: Math.round(f[i]),
    median: Math.round(m[i]),
    defavorable: Math.round(d[i]),
    versements: Math.round(cfg.v0 + cfg.monthly * 12 * i),
    cone: [Math.round(d[i]), Math.round(f[i])],
    innerCone: [Math.round(il[i]), Math.round(iu[i])],
  }));
};

export const niceStep = (max: number) => {
  if (max <= 0) return 1;
  const rough = max / 4;
  const pow = Math.pow(10, Math.floor(Math.log10(rough)));
  const cand = [1, 2, 2.5, 5, 10].map((x) => x * pow);
  return cand.find((c) => c >= rough) || 10 * pow;
};

export const xTicksFor = (start: number, end: number) => {
  const N = end - start;
  const step = N <= 8 ? 1 : N <= 18 ? 2 : 5;
  const ticks: number[] = [];
  for (let y = start; y <= end; y++) if ((y - start) % step === 0) ticks.push(y);
  if (ticks[ticks.length - 1] !== end) ticks.push(end);
  return ticks;
};

// IRR of the contributions → annualised return for a final capital.
export const annualPctFor = (finalCapital: number, cfg: Cfg) => {
  const N = cfg.endYear - cfg.startYear;
  const cf = [-cfg.v0];
  for (let t = 1; t <= N; t++) cf.push(-cfg.monthly * 12);
  cf[N] += finalCapital;
  const npv = (r: number) =>
    cf.reduce((s, c, t) => s + c / Math.pow(1 + r, t), 0);
  let lo = 0,
    hi = 1;
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    if (npv(mid) > 0) lo = mid;
    else hi = mid;
  }
  return ((lo + hi) / 2) * 100;
};
