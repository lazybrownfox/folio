import { bench, describe } from "vitest";
import { scenarios, type Point } from "../src/components/dataviz/scenarios";
import {
  transform,
  caseOf,
  message,
  type NetContributionsColors,
} from "../src/lib/netContributions";

// The palette the component passes in; only used for case classification.
const COLORS: NetContributionsColors = {
  axis: "#8a95a3",
  line: "#f0a062",
  gains: "#46e0b0",
  losses: "#e0556b",
};

// The four bundled scenarios concatenated — the realistic per-render workload.
const realData: Point[] = Object.values(scenarios).flatMap((s) => s.data);

// A larger synthetic series exercising every semantic case, to scale the work.
const bigData: Point[] = Array.from({ length: 2_000 }, (_, i) => {
  const invested = Math.round(5000 * Math.sin(i / 7) + (i % 11) * 100 - 550);
  const gains = Math.round(2000 * Math.cos(i / 5) - 300);
  return { label: `M${i}`, invested, gains };
});

describe("net contributions model", () => {
  bench("transform (bundled scenarios)", () => {
    transform(realData);
  });

  bench("transform (2k points)", () => {
    transform(bigData);
  });

  bench("classify + message (2k points)", () => {
    const rows = transform(bigData);
    for (const row of rows) {
      caseOf(row, COLORS);
      message(row, COLORS);
    }
  });
});
