// Pure computation for the "net contributions" dataviz.
// Extracted from NetContributionsChart.tsx so the model logic can be reused,
// unit-tested, and benchmarked independently of the React/recharts rendering.

import type { Point } from "../components/dataviz/scenarios";

export interface Row extends Point {
  balance: number;
  invested_band: [number, number];
  gains_band: [number, number] | null;
  losses_band: [number, number] | null;
}

/** Derive the plotted bands (invested / gains / losses) from raw points. */
export function transform(data: Point[]): Row[] {
  return data.map((d) => {
    const balance = d.invested + d.gains;
    const pv = d.gains;
    return {
      ...d,
      balance,
      invested_band: pv >= 0 ? [0, Math.max(d.invested, 0)] : [0, balance],
      gains_band: pv >= 0 ? [d.invested, balance] : null,
      losses_band: pv < 0 ? [balance, d.invested] : null,
    };
  });
}

export interface CaseInfo {
  n: number;
  label: string;
  color: string;
}

/** Classify a row into one of the six semantic cases. */
export function caseOf(d: Row, colors: NetContributionsColors): CaseInfo {
  const { invested, gains, balance } = d;
  if (Math.abs(balance) < 1) return { n: 6, label: "Emptied", color: colors.axis };
  if (invested < -1) return { n: 5, label: "Withdrawals > deposits", color: colors.line };
  if (Math.abs(invested) <= 1) return { n: 4, label: "Stake recovered", color: colors.gains };
  if (gains < -1) return { n: 3, label: "Unrealized loss", color: colors.losses };
  if (Math.abs(gains) <= 1) return { n: 2, label: "Flat performance", color: colors.axis };
  return { n: 1, label: "Compounding", color: colors.gains };
}

export interface NetContributionsColors {
  axis: string;
  line: string;
  gains: string;
  losses: string;
}

/** The tooltip message associated with a row's case. */
export function message(d: Row, colors: NetContributionsColors): string {
  switch (caseOf(d, colors).n) {
    case 5:
      return "You have withdrawn more than you paid in. The remaining balance is gain; the negative invested figure is not a loss.";
    case 4:
      return "You recovered exactly your stake. The whole remaining balance is gain.";
    case 3:
      return "Unrealized loss: the balance has dropped below invested capital. The loss is only locked in if you sell.";
    case 2:
      return "Capital is invested, but performance is still flat.";
    case 6:
      return "Account emptied.";
    default:
      return "Invested capital and gains are rising together.";
  }
}
