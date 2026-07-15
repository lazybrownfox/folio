import { bench, describe } from "vitest";
import {
  CFG,
  RATES,
  series,
  buildData,
  annualPctFor,
  niceStep,
  xTicksFor,
  type Cfg,
} from "../src/lib/projection";

// A long horizon exaggerates the year-over-year compounding loop so the
// benchmark reflects a meaningful amount of work, not just startup noise.
const LONG_CFG: Cfg = { ...CFG, startYear: 2026, endYear: 2226 };

describe("projection model", () => {
  bench("series (default horizon, secured)", () => {
    series(RATES.median, true, CFG);
  });

  bench("series (long horizon, secured)", () => {
    series(RATES.median, true, LONG_CFG);
  });

  bench("buildData (default horizon)", () => {
    buildData(true, CFG);
  });

  bench("buildData (long horizon)", () => {
    buildData(false, LONG_CFG);
  });

  bench("annualPctFor (IRR bisection, default)", () => {
    annualPctFor(120_000, CFG);
  });

  bench("annualPctFor (IRR bisection, long horizon)", () => {
    annualPctFor(1_000_000, LONG_CFG);
  });

  bench("axis helpers (niceStep + xTicksFor)", () => {
    niceStep(950_000);
    xTicksFor(LONG_CFG.startYear, LONG_CFG.endYear);
  });
});
