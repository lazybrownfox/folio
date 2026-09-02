/**
 * Nabaztag bridge — reconstructed panel.
 *
 * There is no product screenshot for the hardware half of this project: the
 * fix lives in an audio driver and an SSH tunnel, not a UI. This rebuilds the
 * two real technical decisions documented in the bridge's own README —
 * the sample-rate fix and the tunnel topology — as a labelled schematic,
 * the same convention as the Cityscoot component panel.
 */
import { MONO, svg, rect, circle, path, line, text, caption } from "./kit.mjs";

const INK = "#141210";
const PAPER = "#ede7dc";
const GREY = "#8a8274";
const RED = "#c0392b";
const GREEN = "#3f7d5c";
const AMBER = "#c9a26a";

const card = (x, y, w, h, title) =>
  rect(x, y, w, h, { fill: "#fff", r: 14, stroke: "#e2ded3", sw: 1 }) +
  text(x + 28, y + 38, title, { fill: INK, size: 16, weight: 700 });

/** A jagged vs. a clean waveform, standing in for a glitching vs. stable clock. */
function waveform(x, y, w, { glitch = false, color }) {
  const n = 28;
  const step = w / n;
  let d = `M${x} ${y}`;
  for (let i = 1; i <= n; i++) {
    const jitter = glitch
      ? Math.sin(i * 1.7) * 14 + Math.sin(i * 5.1) * (i % 3 === 0 ? 10 : 2)
      : Math.sin(i * 0.9) * 12;
    d += ` L${x + i * step} ${y + jitter}`;
  }
  return path(d, { stroke: color, sw: 2 });
}

function audioPath() {
  const x = 70;
  const y = 130;
  const w = 700;
  const h = 500;
  return (
    card(x, y, w, h, "Audio signal path") +
    text(x + 28, y + 66, "Mac (nab-bridge) → tunnel → TagTagTag audio HAT → speaker", {
      fill: GREY,
      size: 13,
      family: MONO,
    }) +
    // native rates — glitching
    text(x + 28, y + 116, "NATIVE RATES", { fill: RED, size: 12, family: MONO, spacing: 1.2 }) +
    waveform(x + 28, y + 160, w - 200, { glitch: true, color: RED }) +
    circle(x + w - 60, y + 150, 11, { fill: RED }) +
    text(x + w - 60, y + 154, "✕", { fill: "#fff", size: 12, anchor: "middle", weight: 700 }) +
    text(x + 28, y + 196, "44.1 / 22.05 / 11.025 kHz — faulty PLL on the wm8960 codec", {
      fill: INK,
      size: 13.5,
    }) +
    // fixed rates — clean
    text(x + 28, y + 246, "SERVED RATES", { fill: GREEN, size: 12, family: MONO, spacing: 1.2 }) +
    waveform(x + 28, y + 290, w - 200, { glitch: false, color: GREEN }) +
    circle(x + w - 60, y + 280, 11, { fill: GREEN }) +
    text(x + w - 60, y + 284, "✓", { fill: "#fff", size: 12, anchor: "middle", weight: 700 }) +
    text(x + 28, y + 326, "48 / 32 / 16 / 8 kHz — clean on the same hardware", {
      fill: INK,
      size: 13.5,
    }) +
    line(x + 28, y + 360, x + w - 28, y + 360, { stroke: "#eceae4", sw: 1 }) +
    text(x + 28, y + 396, "Fix: every clip is resampled to 48 kHz CBR before playback —", {
      fill: GREY,
      size: 13,
    }) +
    text(x + 28, y + 418, "never VBR (the old mpg123 decoder segfaults on it).", {
      fill: GREY,
      size: 13,
    }) +
    text(x + 28, y + 458, "Diagnosed and shipped as a permanent bridge setting,", { fill: GREY, size: 13 }) +
    text(x + 28, y + 480, "not a one-off workaround.", { fill: GREY, size: 13 })
  );
}

function networkPath() {
  const x = 830;
  const y = 130;
  const w = 700;
  const h = 500;
  const boxW = 220;
  const boxH = 84;
  const macX = x + 40;
  const piX = x + w - 40 - boxW;
  const boxY = y + 140;

  const box = (bx, title, sub) =>
    rect(bx, boxY, boxW, boxH, { fill: "#f7f6f2", r: 10, stroke: "#e2ded3", sw: 1 }) +
    text(bx + 20, boxY + 34, title, { fill: INK, size: 14.5, weight: 700 }) +
    text(bx + 20, boxY + 58, sub, { fill: GREY, size: 12, family: MONO });

  const midX = x + w / 2;
  return (
    card(x, y, w, h, "Network path") +
    text(x + 28, y + 66, "a lapin reachable from a Mac, without exposing anything to Wi-Fi", {
      fill: GREY,
      size: 13,
      family: MONO,
    }) +
    box(macX, "Mac · nab-bridge", "127.0.0.1:10544") +
    box(piX, "Raspberry Pi · nabd", "127.0.0.1:10543") +
    line(macX + boxW, boxY + boxH / 2, piX, boxY + boxH / 2, {
      stroke: AMBER,
      sw: 2,
      dash: "6 5",
    }) +
    circle(midX, boxY + boxH / 2, 5, { fill: AMBER }) +
    text(midX, boxY + boxH / 2 - 16, "SSH TUNNEL", {
      fill: AMBER,
      size: 11,
      family: MONO,
      anchor: "middle",
      spacing: 1.2,
    }) +
    text(midX, boxY + boxH / 2 + 26, "bidirectional · key-based", {
      fill: GREY,
      size: 11.5,
      anchor: "middle",
    }) +
    line(x + 28, y + 300, x + w - 28, y + 300, { stroke: "#eceae4", sw: 1 }) +
    [
      [332, "Both services bind 127.0.0.1 only — never the LAN."],
      [364, "safeFetch rejects local/private destinations before any download."],
      [396, "Redirects are revalidated; requests time out at 30s."],
      [428, "Downloads capped at 250 MB (podcasts) / 5 MB (RSS)."],
    ]
      .map(([dy, label]) => text(x + 28, y + dy, label, { fill: GREY, size: 13 }))
      .join("")
  );
}

export function panel() {
  const W = 1600;
  const H = 700;
  return svg({
    w: W,
    h: H,
    bg: PAPER,
    children:
      text(48, 56, "Nab-bridge · hardware & network", {
        fill: INK,
        size: 15,
        weight: 700,
        family: MONO,
        spacing: 2,
        upper: true,
      }) +
      audioPath() +
      networkPath() +
      caption(W, H, "reconstruction · signal & network schematic", {
        fill: INK,
        dim: 0.38,
      }),
  });
}

export const panels = [["nabaztag-hardware", panel]];
