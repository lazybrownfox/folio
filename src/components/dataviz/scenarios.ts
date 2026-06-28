// Real artifact ported from the Nalo "net contributions" prototype.
// Each scenario is a monthly series of { invested, gains }.
//   balance  = invested + gains            (the orange line)
//   invested = deposits − withdrawals      (can go NEGATIVE)
//   gains    = balance − invested          (negative = unrealized loss)
// The whole point: balance can stay positive while invested goes negative —
// the "−" is not a loss. The chart makes that legible.

export interface Point {
  label: string;
  invested: number;
  gains: number;
}

export interface Scenario {
  name: string;
  description: string;
  data: Point[];
}

const months = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function build(caps: number[], pvs: number[], startYear = 2026): Point[] {
  return caps.map((c, i) => ({
    label: `${months[i % 12]} ${String(startYear + Math.floor(i / 12)).slice(2)}`,
    invested: c,
    gains: pvs[i],
  }));
}

export const scenarios: Record<string, Scenario> = {
  A: {
    name: "A · Compounding",
    description:
      "Regular deposits in a rising market. Invested capital and gains climb together, so the breakdown stays easy to understand.",
    data: build(
      [1000, 1500, 2000, 2600, 3200, 3800, 4500, 5200, 6000, 6800, 7600, 8500],
      [30, 80, 150, 240, 360, 520, 720, 950, 1250, 1600, 2050, 2600],
    ),
  },

  B: {
    name: "B · Recovering the stake",
    description:
      "Saving, then a large withdrawal. Net invested capital crosses zero and goes negative: the stake has been recovered, and the remaining balance is gain.",
    data: build(
      [1500, 3000, 4500, 6000, 7500, 9000, 10000, 10000, 10000, 0, -2000, -2000, -2000, -2000, -2000],
      [100, 300, 600, 1000, 1500, 2100, 2800, 3200, 3600, 3600, 3650, 3750, 3900, 4050, 4200],
    ),
  },

  C: {
    name: "C · Market drawdown",
    description:
      "Deposits continue while the market drops. Gains turn negative, so the balance falls below invested capital before recovering. This is the actual loss-risk case.",
    data: build(
      [1000, 1800, 2600, 3400, 4200, 5000, 5800, 6600, 7400, 8200, 9000, 9800, 10600],
      [100, 300, 500, -200, -700, -1100, -600, 200, 900, 1500, 2100, 2700, 3300],
    ),
  },

  D: {
    name: "D · Deposits & withdrawals",
    description:
      "Deposits and withdrawals alternate. Net invested capital moves around zero and dips negative while gains keep building, so the balance stays positive.",
    data: build(
      [2000, 3500, 1000, -500, 1500, 3000, 500, -1000, 0, 2000, 3500, 1000, -800, 200],
      [150, 300, 450, 600, 750, 950, 1100, 1300, 1450, 1650, 1850, 2050, 2300, 2500],
    ),
  },
};

export interface CaseDef {
  n: number;
  label: string;
  cond: string;
  tone: "green" | "neutral" | "red" | "orange";
}

export const ALL_CASES: CaseDef[] = [
  { n: 1, label: "Compounding", cond: "Invested + · Gains +", tone: "green" },
  { n: 2, label: "Flat performance", cond: "Invested + · Gains 0", tone: "neutral" },
  { n: 3, label: "Unrealized loss", cond: "Invested + · Gains −", tone: "red" },
  { n: 4, label: "Stake recovered", cond: "Invested 0 · Gains +", tone: "green" },
  { n: 5, label: "Withdrawals > deposits", cond: "Invested − · Gains +", tone: "orange" },
];
