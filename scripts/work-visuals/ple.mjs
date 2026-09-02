/**
 * Plé — reconstructed panels.
 *
 * A podcast / audio-series app: "Aujourd'hui, les séries s'écoutent". The
 * surviving cover gives the identity — a yellow tile carrying a play triangle
 * folded in blue and red, with a heavy lowercase-tailed wordmark on warm black.
 */
import { MONO, svg, rect, circle, path, line, text, caption, phone, bars } from "./kit.mjs";

const NIGHT = "#140f0f";
const NIGHT_2 = "#1f1917";
const YELLOW = "#f5d13f";
const DIM = "#8d8378";

/* --------------------------------------------------------------------- app */
export function app() {
  const W = 1600;
  const H = 1000;
  const pw = 320;
  const ph = 660;
  const top = 190;

  const cover = (x, y, s, hue) =>
    rect(x, y, s, s, { fill: hue, r: 8 }) +
    path(`M${x + s * 0.62} ${y} L${x + s} ${y + s * 0.42} L${x + s} ${y} Z`, {
      fill: "#000",
      opacity: 0.18,
    });

  /* A — la bibliothèque */
  const screenA =
    rect(0, 0, pw, ph, { fill: NIGHT }) +
    text(24, 52, "9:41", { fill: "#fff", size: 14, weight: 700 }) +
    text(24, 108, "Séries", { fill: "#fff", size: 30, weight: 700 }) +
    text(24, 138, "Reprendre l’écoute", { fill: DIM, size: 13.5 }) +
    // continue listening card
    rect(24, 158, pw - 48, 96, { fill: NIGHT_2, r: 12 }) +
    cover(36, 170, 72, "#c9553f") +
    text(122, 198, "Les Nuits d’Ostende", { fill: "#fff", size: 14.5, weight: 700 }) +
    text(122, 220, "Épisode 4 · 12 min restantes", { fill: DIM, size: 12 }) +
    rect(122, 234, 150, 4, { fill: "#3a322e", r: 2 }) +
    rect(122, 234, 96, 4, { fill: YELLOW, r: 2 }) +
    text(24, 300, "Nouveautés", {
      fill: "#fff",
      size: 12.5,
      weight: 700,
      family: MONO,
      spacing: 1.4,
      upper: true,
    }) +
    [
      ["#3f6cc9", "Le Dernier Quai", "6 épisodes"],
      ["#7a4bc0", "Marée Basse", "4 épisodes"],
      ["#2f8f6b", "Rue des Archives", "8 épisodes"],
    ]
      .map(([hue, title, meta], i) => {
        const y = 324 + i * 96;
        return (
          cover(24, y, 76, hue) +
          text(116, y + 32, title, { fill: "#fff", size: 15, weight: 600 }) +
          text(116, y + 54, meta, { fill: DIM, size: 12.5 }) +
          circle(280, y + 38, 15, { fill: "none", stroke: "#4a423d", sw: 1.5 }) +
          path(`M276 ${y + 31} l10 7 l-10 7 Z`, { fill: "#fff" })
        );
      })
      .join("") +
    // tab bar
    rect(0, ph - 76, pw, 76, { fill: "#0e0a0a" }) +
    [
      ["Séries", 60, true],
      ["Recherche", 160, false],
      ["Vous", 260, false],
    ]
      .map(([label, x, on]) =>
        text(x, ph - 30, label, {
          fill: on ? YELLOW : DIM,
          size: 11.5,
          weight: on ? 700 : 500,
          anchor: "middle",
        }),
      )
      .join("");

  /* B — le lecteur */
  const wave = bars(40, 470, 32, {
    gap: 4,
    width: 4,
    fill: "#4a423d",
    heights: (i) => 8 + Math.abs(Math.sin(i * 0.9)) * 46 + (i % 3) * 5,
  });
  const wavePlayed = bars(40, 470, 14, {
    gap: 4,
    width: 4,
    fill: YELLOW,
    heights: (i) => 8 + Math.abs(Math.sin(i * 0.9)) * 46 + (i % 3) * 5,
  });

  const screenB =
    rect(0, 0, pw, ph, { fill: NIGHT }) +
    rect(0, 0, pw, 300, { fill: "#c9553f", opacity: 0.22 }) +
    text(24, 52, "9:41", { fill: "#fff", size: 14, weight: 700 }) +
    path("M24 92 l-10 8 l10 8", { stroke: "#fff", sw: 2 }) +
    text(pw / 2, 100, "En lecture", {
      fill: "#fff",
      size: 12,
      family: MONO,
      anchor: "middle",
      spacing: 1.4,
      upper: true,
      opacity: 0.7,
    }) +
    cover(70, 130, 180, "#c9553f") +
    text(pw / 2, 356, "Les Nuits d’Ostende", {
      fill: "#fff",
      size: 21,
      weight: 700,
      anchor: "middle",
    }) +
    text(pw / 2, 382, "Épisode 4 · Le phare", { fill: DIM, size: 13.5, anchor: "middle" }) +
    wave +
    wavePlayed +
    text(40, 522, "18:42", { fill: DIM, size: 11.5, family: MONO }) +
    text(pw - 40, 522, "-12:07", { fill: DIM, size: 11.5, family: MONO, anchor: "end" }) +
    // transport
    circle(pw / 2, 588, 34, { fill: YELLOW }) +
    rect(pw / 2 - 9, 574, 6, 28, { fill: NIGHT, r: 2 }) +
    rect(pw / 2 + 3, 574, 6, 28, { fill: NIGHT, r: 2 }) +
    path(`M${pw / 2 - 78} 578 l-14 10 l14 10 Z`, { fill: "#fff" }) +
    rect(pw / 2 - 96, 578, 4, 20, { fill: "#fff", r: 2 }) +
    path(`M${pw / 2 + 78} 578 l14 10 l-14 10 Z`, { fill: "#fff" }) +
    rect(pw / 2 + 92, 578, 4, 20, { fill: "#fff", r: 2 }) +
    text(pw / 2, 646, "1.0×   ·   Minuteur   ·   Partager", {
      fill: DIM,
      size: 11.5,
      anchor: "middle",
    });

  /* C — la fiche série */
  const screenC =
    rect(0, 0, pw, ph, { fill: NIGHT }) +
    cover(0, 0, pw, "#3f6cc9") +
    rect(0, 180, pw, 140, { fill: NIGHT, opacity: 0.55 }) +
    rect(0, 300, pw, ph - 300, { fill: NIGHT }) +
    text(24, 52, "9:41", { fill: "#fff", size: 14, weight: 700 }) +
    text(24, 268, "Le Dernier Quai", { fill: "#fff", size: 26, weight: 700 }) +
    text(24, 294, "Fiction · 6 épisodes · 4 h 12", { fill: "#d8d2c9", size: 13 }) +
    rect(24, 322, 150, 46, { fill: YELLOW, r: 23 }) +
    path("M52 337 l14 8 l-14 8 Z", { fill: NIGHT }) +
    text(108, 351, "Écouter", { fill: NIGHT, size: 14.5, weight: 700, anchor: "middle" }) +
    circle(216, 345, 23, { fill: "none", stroke: "#4a423d", sw: 1.5 }) +
    path("M209 336 v18 l7 -6 l7 6 v-18 z", { fill: "#fff" }) +
    text(24, 412, "Un cargo disparaît au large de Dunkerque. Trente ans plus", {
      fill: DIM,
      size: 13,
    }) +
    text(24, 434, "tard, une archiviste rouvre le dossier.", { fill: DIM, size: 13 }) +
    line(24, 468, pw - 24, 468, { stroke: "#2a2422", sw: 1 }) +
    [
      ["1", "Le manifeste", "38 min"],
      ["2", "Vingt-deux noms", "41 min"],
      ["3", "La cale", "44 min"],
    ]
      .map(([n, title, dur], i) => {
        const y = 506 + i * 56;
        return (
          text(24, y, n, { fill: DIM, size: 13, family: MONO }) +
          text(56, y, title, { fill: "#fff", size: 14, weight: 600 }) +
          text(pw - 24, y, dur, { fill: DIM, size: 12, anchor: "end", family: MONO })
        );
      })
      .join("");

  const labels = [
    ["Library", "Pick up where you stopped"],
    ["Player", "The waveform shows what is left to hear"],
    ["Series", "A table of contents, not a wall of thumbnails"],
  ];

  return svg({
    w: W,
    h: H,
    bg: NIGHT_2,
    children:
      text(48, 56, "Plé · product screens", {
        fill: "#fff",
        size: 15,
        weight: 700,
        family: MONO,
        spacing: 2,
        opacity: 0.55,
        upper: true,
      }) +
      text(150, 120, "Aujourd’hui, les séries s’écoutent.", {
        fill: "#fff",
        size: 30,
        weight: 700,
      }) +
      labels
        .map(([t, s], i) => {
          const x = 150 + i * 450;
          return (
            text(x, top - 34, t, { fill: YELLOW, size: 14, weight: 700 }) +
            text(x, top - 12, s, { fill: DIM, size: 13 })
          );
        })
        .join("") +
      phone(150, top, pw, ph, { id: "ple-a", screen: screenA }) +
      phone(600, top, pw, ph, { id: "ple-b", screen: screenB }) +
      phone(1050, top, pw, ph, { id: "ple-c", screen: screenC }) +
      caption(W, H, "reconstruction · product screens", { fill: "#fff", dim: 0.32 }),
  });
}

export const panels = [["ple-app", app]];
