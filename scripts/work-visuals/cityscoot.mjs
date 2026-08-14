/**
 * Cityscoot — reconstructed panels.
 *
 * The free-floating scooter service: a map of available scooters in Paris,
 * a booking sheet, and the component set behind them. The original files are
 * gone; these rebuild the same screens from the surviving cover shot's palette.
 */
import {
  SANS,
  MONO,
  svg,
  rect,
  circle,
  path,
  line,
  text,
  group,
  caption,
  phone,
} from "./kit.mjs";

const BLUE = "#1f5fd6";
const GREEN = "#2e9e5b";
const AMBER = "#e0952f";
const PAPER = "#f5f4ef";
const MAP = "#e9e7e1";
const ROAD = "#ffffff";
const INK = "#12203a";
const GREY = "#8a93a4";

/* ---------------------------------------------------------------- map plate */
/** A plausible Paris-ish street grid. Deliberately generic: it reads as the
 *  product's map layer without copying any real cartography. Block shades
 *  and a couple of street labels vary the texture so it doesn't read as a
 *  flat diagram next to the photographic cover shot. */
function mapPlate(w, h, { seedShift = 0, labels = true } = {}) {
  const roads = [
    `M${-40 + seedShift} ${h * 0.22} L${w + 40} ${h * 0.17}`,
    `M${-40} ${h * 0.52} L${w + 40} ${h * 0.58}`,
    `M${-40} ${h * 0.8} L${w + 40} ${h * 0.75}`,
    `M${w * 0.22 + seedShift} ${-40} L${w * 0.3} ${h + 40}`,
    `M${w * 0.62} ${-40} L${w * 0.54} ${h + 40}`,
    `M${w * 0.86} ${-40} L${w * 0.92} ${h + 40}`,
    `M${-40} ${h * 0.95} L${w * 0.7} ${h * 0.1}`,
  ];
  const blocks = [
    [w * 0.06, h * 0.26, w * 0.13, h * 0.2, "#dfdcd4"],
    [w * 0.36, h * 0.24, w * 0.2, h * 0.22, "#e3e0d8"],
    [w * 0.68, h * 0.3, w * 0.16, h * 0.16, "#d8d5cc"],
    [w * 0.1, h * 0.6, w * 0.15, h * 0.14, "#e3e0d8"],
    [w * 0.42, h * 0.62, w * 0.14, h * 0.13, "#dfdcd4"],
    [w * 0.7, h * 0.64, w * 0.18, h * 0.15, "#d8d5cc"],
  ];
  const streetLabels = labels
    ? text(w * 0.16, h * 0.485, "Rue Darcet", {
        fill: "#a9a49a",
        size: 9.5,
        family: SANS,
        transform: `rotate(-8 ${w * 0.16} ${h * 0.485})`,
      }) +
      text(w * 0.3, h * 0.775, "Bd des Batignolles", {
        fill: "#a9a49a",
        size: 9.5,
        family: SANS,
        transform: `rotate(-4 ${w * 0.3} ${h * 0.775})`,
      })
    : "";
  return (
    rect(0, 0, w, h, { fill: MAP }) +
    blocks
      .map(([x, y, bw, bh, fill]) =>
        rect(x, y, bw, bh, { fill, r: 3 }),
      )
      .join("") +
    roads.map((d) => path(d, { stroke: ROAD, sw: 11, cap: "butt" })).join("") +
    roads
      .slice(0, 3)
      .map((d) => path(d, { stroke: "#f7f6f3", sw: 17, cap: "butt" }))
      .join("") +
    streetLabels
  );
}

/** iOS-style signal/wifi/battery cluster, right-aligned at (x, y) — the
 *  detail that reads "device screenshot" rather than "diagram". */
function statusIcons(x, y, { fill = INK } = {}) {
  const bars = [0, 1, 2, 3]
    .map((i) => rect(x - 66 + i * 5, y - 3 - i * 2.4, 3, 4 + i * 2.4, { fill, r: 0.6 }))
    .join("");
  const wifi = path(
    `M${x - 44} ${y - 4} q7 -7 14 0 M${x - 41} ${y - 1} q4 -4 8 0`,
    { stroke: fill, sw: 1.6 },
  ) + circle(x - 37, y + 2, 1.1, { fill });
  const battery =
    rect(x - 28, y - 8, 22, 11, { fill: "none", stroke: fill, sw: 1.2, r: 2.5 }) +
    rect(x - 6, y - 5, 1.6, 5, { fill, r: 0.8 }) +
    rect(x - 26, y - 6, 18, 7, { fill, r: 1.2 });
  return bars + wifi + battery;
}

/** Available-scooter pin: the round "C" marker from the live map. */
function pin(x, y, { fill = GREEN, label = "C", scale = 1, count } = {}) {
  const r = 17 * scale;
  return group(
    circle(0, r * 0.85, r * 0.7, { fill: "#000", opacity: 0.14 }) +
      circle(0, 0, r, { fill }) +
      circle(0, 0, r, { fill: "none", stroke: "rgba(0,0,0,0.12)", sw: 1 }) +
      path(`M0 ${r} L${-5 * scale} ${r - 4} L${5 * scale} ${r - 4} Z`, { fill }) +
      text(0, 6 * scale, count ?? label, {
        fill: "#fff",
        size: 18 * scale,
        weight: 700,
        anchor: "middle",
      }),
    `translate(${x} ${y})`,
  );
}

/* ------------------------------------------------------- 1 · the map flow */
export function mapflow() {
  const W = 1600;
  const H = 1000;
  const pw = 320;
  const ph = 660;
  const top = 170;

  /* A — browse the map */
  const screenA =
    mapPlate(pw, ph) +
    pin(90, 250) +
    pin(196, 205, { count: "3" }) +
    pin(150, 400) +
    pin(240, 470, { fill: AMBER }) +
    circle(120, 330, 9, { fill: BLUE }) +
    circle(120, 330, 22, { fill: BLUE, opacity: 0.16 }) +
    // top chrome
    rect(0, 0, pw, 96, { fill: "#fff", opacity: 0.95 }) +
    text(24, 40, "9:41", { fill: INK, size: 15, weight: 700 }) +
    statusIcons(pw - 24, 40) +
    rect(96, 56, 128, 30, { fill: "#eceaf3", r: 15 }) +
    rect(98, 58, 62, 26, { fill: BLUE, r: 13 }) +
    text(129, 76, "Plan", { fill: "#fff", size: 13, weight: 700, anchor: "middle" }) +
    text(192, 76, "Liste", { fill: GREY, size: 13, weight: 600, anchor: "middle" }) +
    path("M22 64 h20 M22 71 h20 M22 78 h14", { stroke: BLUE, sw: 2.4 }) +
    circle(285, 71, 13, { fill: "none", stroke: BLUE, sw: 2.2 }) +
    line(294, 80, 301, 87, { stroke: BLUE, sw: 2.4 });

  /* B — a scooter selected, booking sheet up.
     `sheetTop` has to leave room for the whole sheet: the CTA ends at
     sheetTop + 324, so anything above ~316 clips the primary action off. */
  const sheetTop = 300;
  const screenB =
    mapPlate(pw, ph, { seedShift: 24 }) +
    pin(150, 250, { scale: 1.25 }) +
    circle(150, 250, 44, { fill: GREEN, opacity: 0.15 }) +
    rect(0, 0, pw, ph, { fill: "#0b1220", opacity: 0.12 }) +
    // status bar, over the tinted map
    text(24, 40, "9:41", { fill: "#fff", size: 15, weight: 700 }) +
    statusIcons(pw - 24, 40, { fill: "#fff" }) +
    // sheet
    rect(0, sheetTop, pw, ph - sheetTop, { fill: "#fff", r: 18 }) +
    rect(pw / 2 - 20, sheetTop + 12, 40, 4, { fill: "#d7d9de", r: 2 }) +
    // scooter row
    circle(52, sheetTop + 68, 26, { fill: "#eaf3ff" }) +
    path(
      `M38 ${sheetTop + 74} h9 l6 -12 h10 l4 8 h6`,
      { stroke: BLUE, sw: 3 },
    ) +
    circle(41, sheetTop + 78, 5.5, { fill: "none", stroke: BLUE, sw: 3 }) +
    circle(65, sheetTop + 78, 5.5, { fill: "none", stroke: BLUE, sw: 3 }) +
    text(90, sheetTop + 58, "N° 146", { fill: BLUE, size: 22, weight: 700 }) +
    text(90, sheetTop + 82, "32 av. de Ségur, 75007", {
      fill: INK,
      size: 13,
      weight: 500,
    }) +
    text(272, sheetTop + 58, "3 min", { fill: GREEN, size: 13, weight: 700, anchor: "end" }) +
    // meta chips
    rect(24, sheetTop + 108, 122, 34, { fill: "#f3f4f7", r: 8 }) +
    rect(158, sheetTop + 108, 138, 34, { fill: "#f3f4f7", r: 8 }) +
    rect(36, sheetTop + 119, 20, 12, { fill: GREEN, r: 2 }) +
    text(64, sheetTop + 130, "± 28 km", { fill: INK, size: 12.5, weight: 600 }) +
    text(172, sheetTop + 130, "EG-643-CD", { fill: INK, size: 12.5, weight: 600 }) +
    // payment row
    line(24, sheetTop + 168, pw - 24, sheetTop + 168, { stroke: "#e8e9ee", sw: 1 }) +
    text(24, sheetTop + 196, "Options de paiement", { fill: INK, size: 13, weight: 500 }) +
    text(pw - 24, sheetTop + 196, "•••• 6091", {
      fill: GREY,
      size: 13,
      weight: 600,
      anchor: "end",
    }) +
    line(24, sheetTop + 218, pw - 24, sheetTop + 218, { stroke: "#e8e9ee", sw: 1 }) +
    text(24, sheetTop + 246, "J’accepte les CGU", { fill: INK, size: 13, weight: 500 }) +
    circle(pw - 34, sheetTop + 241, 10, { fill: BLUE }) +
    path(`M${pw - 39} ${sheetTop + 241} l4 4 l7 -8`, { stroke: "#fff", sw: 2.4 }) +
    // CTA
    rect(24, sheetTop + 272, pw - 48, 52, { fill: BLUE, r: 26 }) +
    text(pw / 2, sheetTop + 304, "Je réserve mon Cityscoot", {
      fill: "#fff",
      size: 14.5,
      weight: 700,
      anchor: "middle",
    });

  /* C — reserved, countdown running */
  const screenC =
    rect(0, 0, pw, ph, { fill: BLUE }) +
    circle(pw / 2, 250, 210, { fill: "#fff", opacity: 0.06 }) +
    circle(pw / 2, 250, 150, { fill: "#fff", opacity: 0.06 }) +
    circle(pw / 2, 250, 58, { fill: "#fff" }) +
    path(`M${pw / 2 - 24} 250 l16 17 l31 -35`, { stroke: BLUE, sw: 7 }) +
    text(pw / 2, 372, "Scooter réservé", {
      fill: "#fff",
      size: 25,
      weight: 700,
      anchor: "middle",
    }) +
    text(pw / 2, 404, "N° 146 · 32 av. de Ségur", {
      fill: "#cfe0ff",
      size: 14,
      anchor: "middle",
    }) +
    rect(48, 448, pw - 96, 84, { fill: "#ffffff", opacity: 0.12, r: 14 }) +
    text(pw / 2, 486, "14:52", {
      fill: "#fff",
      size: 34,
      weight: 700,
      anchor: "middle",
      family: MONO,
    }) +
    text(pw / 2, 512, "avant expiration", {
      fill: "#cfe0ff",
      size: 12,
      anchor: "middle",
      spacing: 1.2,
      upper: true,
    }) +
    rect(48, ph - 128, pw - 96, 52, { fill: "#fff", r: 26 }) +
    text(pw / 2, ph - 95, "Ouvrir le top-case", {
      fill: BLUE,
      size: 14.5,
      weight: 700,
      anchor: "middle",
    }) +
    text(pw / 2, ph - 46, "Annuler", {
      fill: "#cfe0ff",
      size: 13.5,
      weight: 600,
      anchor: "middle",
    });

  const steps = [
    ["01", "Trouver", "Scooters disponibles autour de soi"],
    ["02", "Réserver", "Fiche véhicule, paiement, CGU"],
    ["03", "Rouler", "15 minutes de réservation offertes"],
  ];

  const cols = steps
    .map(([n, title, sub], i) => {
      const x = 150 + i * 450;
      return (
        text(x, 92, n, { fill: BLUE, size: 13, weight: 700, family: MONO, spacing: 1.5 }) +
        text(x, 122, title, { fill: INK, size: 24, weight: 700 }) +
        text(x, 146, sub, { fill: GREY, size: 13.5 })
      );
    })
    .join("");

  const arrows = [0, 1]
    .map((i) => {
      const x = 150 + i * 450 + pw + 46;
      return (
        line(x, top + ph / 2, x + 58, top + ph / 2, { stroke: "#c9c6bd", sw: 2 }) +
        path(`M${x + 50} ${top + ph / 2 - 6} l8 6 l-8 6`, { stroke: "#c9c6bd", sw: 2 })
      );
    })
    .join("");

  return svg({
    w: W,
    h: H,
    bg: PAPER,
    children:
      text(48, 56, "Cityscoot · réservation", {
        fill: INK,
        size: 15,
        weight: 700,
        family: MONO,
        spacing: 2,
        upper: true,
      }) +
      cols +
      arrows +
      phone(150, top, pw, ph, { id: "cs-a", screen: screenA }) +
      phone(600, top, pw, ph, { id: "cs-b", screen: screenB }) +
      phone(1050, top, pw, ph, { id: "cs-c", screen: screenC }) +
      caption(W, H, "reconstruction · flow de réservation", { fill: INK, dim: 0.38 }),
  });
}

/* ------------------------------------------------ 2 · map markers & states */
export function markers() {
  const W = 1600;
  const H = 1000;

  const states = [
    ["Disponible", GREEN, "C", "batterie > 30 %"],
    ["Batterie faible", AMBER, "C", "20–30 %, trajet court"],
    ["Réservé", GREY, "C", "tenu 15 min pour un client"],
    ["Indisponible", "#c2c6cf", "C", "maintenance ou hors service"],
  ];

  const stateRow = states
    .map(([label, fill, glyph, note], i) => {
      const x = 130 + i * 350;
      return (
        rect(x - 60, 250, 300, 200, { fill: "#fff", r: 14, stroke: "#e6e4dd", sw: 1 }) +
        pin(x + 42, 330, { fill, label: glyph, scale: 1.35 }) +
        text(x + 42, 392, label, { fill: INK, size: 16, weight: 700, anchor: "middle" }) +
        text(x + 42, 416, note, { fill: GREY, size: 12.5, anchor: "middle" })
      );
    })
    .join("");

  /* clustering: how the map collapses density as you zoom out */
  const clusterY = 640;
  const cluster =
    rect(70, clusterY - 60, 640, 300, { fill: "#fff", r: 14, stroke: "#e6e4dd", sw: 1 }) +
    text(102, clusterY - 22, "Agrégation", { fill: INK, size: 16, weight: 700 }) +
    text(102, clusterY, "Au dézoom, les pins fusionnent et portent le compte.", {
      fill: GREY,
      size: 13,
    }) +
    pin(180, clusterY + 110, { scale: 1 }) +
    pin(230, clusterY + 92, { scale: 1 }) +
    pin(212, clusterY + 148, { scale: 1 }) +
    line(300, clusterY + 120, 360, clusterY + 120, { stroke: "#c9c6bd", sw: 2 }) +
    path(`M352 ${clusterY + 114} l8 6 l-8 6`, { stroke: "#c9c6bd", sw: 2 }) +
    pin(450, clusterY + 120, { count: "12", scale: 1.9 }) +
    text(560, clusterY + 126, "cluster", { fill: GREY, size: 13, family: MONO });

  /* the pin itself, dimensioned */
  const anat =
    rect(760, clusterY - 60, 770, 300, { fill: "#fff", r: 14, stroke: "#e6e4dd", sw: 1 }) +
    text(792, clusterY - 22, "Gabarit du pin", { fill: INK, size: 16, weight: 700 }) +
    text(792, clusterY, "Cible tactile de 44 px conservée à toutes les échelles.", {
      fill: GREY,
      size: 13,
    }) +
    circle(900, clusterY + 120, 44, { fill: "none", stroke: BLUE, sw: 1.4, dash: "5 5" }) +
    pin(900, clusterY + 120, { scale: 1.6 }) +
    line(856, clusterY + 190, 944, clusterY + 190, { stroke: BLUE, sw: 1.4 }) +
    text(900, clusterY + 214, "44 px", {
      fill: BLUE,
      size: 12.5,
      family: MONO,
      anchor: "middle",
    }) +
    text(1010, clusterY + 96, "· ombre portée légère, jamais de contour dur", {
      fill: GREY,
      size: 13,
    }) +
    text(1010, clusterY + 124, "· la couleur porte l’état, le chiffre la densité", {
      fill: GREY,
      size: 13,
    }) +
    text(1010, clusterY + 152, "· le glyphe reste lisible dès 24 px", {
      fill: GREY,
      size: 13,
    });

  return svg({
    w: W,
    h: H,
    bg: PAPER,
    children:
      text(48, 56, "Cityscoot · couche carto", {
        fill: INK,
        size: 15,
        weight: 700,
        family: MONO,
        spacing: 2,
        upper: true,
      }) +
      text(70, 150, "États du marqueur", { fill: INK, size: 30, weight: 700 }) +
      text(70, 182, "Un seul composant, quatre lectures — la couleur suffit à trancher.", {
        fill: GREY,
        size: 15,
      }) +
      stateRow +
      cluster +
      anat +
      caption(W, H, "reconstruction · système de marqueurs", { fill: INK, dim: 0.38 }),
  });
}

/* ------------------------------------------------------ 3 · component set */
export function components() {
  const W = 1600;
  const H = 1000;

  const card = (x, y, w, h, title) =>
    rect(x, y, w, h, { fill: "#fff", r: 14, stroke: "#e6e4dd", sw: 1 }) +
    text(x + 28, y + 38, title, { fill: INK, size: 16, weight: 700 });

  /* buttons */
  const btns =
    card(70, 130, 460, 330, "Boutons") +
    rect(98, 176, 300, 50, { fill: BLUE, r: 25 }) +
    text(248, 207, "Je réserve", { fill: "#fff", size: 14.5, weight: 700, anchor: "middle" }) +
    rect(98, 240, 300, 50, { fill: "none", stroke: BLUE, sw: 1.8, r: 25 }) +
    text(248, 271, "Je me connecte", { fill: BLUE, size: 14.5, weight: 700, anchor: "middle" }) +
    rect(98, 304, 300, 50, { fill: "#eceef2", r: 25 }) +
    text(248, 335, "Indisponible", { fill: "#a8aebb", size: 14.5, weight: 700, anchor: "middle" }) +
    text(420, 207, "primaire", { fill: GREY, size: 12.5, family: MONO }) +
    text(420, 271, "secondaire", { fill: GREY, size: 12.5, family: MONO }) +
    text(420, 335, "désactivé", { fill: GREY, size: 12.5, family: MONO }) +
    text(98, 400, "Hauteur 50 px · rayon plein · libellé à la 1ʳᵉ personne", {
      fill: GREY,
      size: 13,
    }) +
    text(98, 426, "— la voix du produit, pas un verbe d’interface.", {
      fill: GREY,
      size: 13,
    });

  /* form + chips */
  const forms =
    card(560, 130, 460, 330, "Saisie & filtres") +
    rect(588, 176, 404, 52, { fill: "#f5f6f8", r: 10, stroke: "#e2e5ea", sw: 1 }) +
    text(608, 208, "Où allez-vous ?", { fill: "#9aa1ae", size: 14 }) +
    circle(958, 202, 11, { fill: "none", stroke: GREY, sw: 2 }) +
    line(966, 210, 972, 216, { stroke: GREY, sw: 2 }) +
    rect(588, 248, 404, 52, { fill: "#fff", r: 10, stroke: BLUE, sw: 1.8 }) +
    text(608, 280, "Batignolles", { fill: INK, size: 14, weight: 600 }) +
    text(588, 336, "Filtres", { fill: GREY, size: 12.5, family: MONO, upper: true, spacing: 1.4 }) +
    rect(588, 356, 142, 38, { fill: BLUE, r: 19 }) +
    text(659, 380, "Disponible", { fill: "#fff", size: 13, weight: 600, anchor: "middle" }) +
    rect(742, 356, 172, 38, { fill: "#f0f1f4", r: 19 }) +
    text(828, 380, "Autonomie 30 km+", { fill: INK, size: 13, weight: 600, anchor: "middle" }) +
    rect(588, 406, 118, 38, { fill: "#f0f1f4", r: 19 }) +
    text(647, 430, "Top-case", { fill: INK, size: 13, weight: 600, anchor: "middle" });

  /* tokens */
  const swatches = [
    ["blue/600", BLUE, "action, sélection"],
    ["green/500", GREEN, "scooter disponible"],
    ["amber/500", AMBER, "batterie faible"],
    ["ink/900", INK, "texte principal"],
    ["grey/500", GREY, "texte secondaire"],
    ["paper/000", "#f5f6f8", "fonds de champ"],
  ];
  const tokens =
    card(1050, 130, 480, 330, "Couleurs") +
    swatches
      .map(([name, hex, use], i) => {
        // Starts below the card title (y + 38) — 178 collided with it.
        const y = 206 + i * 42;
        return (
          rect(1078, y - 18, 34, 34, { fill: hex, r: 8, stroke: "rgba(0,0,0,0.08)", sw: 1 }) +
          text(1128, y - 2, name, { fill: INK, size: 13.5, weight: 600, family: MONO }) +
          text(1128, y + 16, use, { fill: GREY, size: 12 }) +
          text(1500, y + 4, hex.toUpperCase(), {
            fill: GREY,
            size: 12,
            family: MONO,
            anchor: "end",
          })
        );
      })
      .join("");

  /* bottom sheet anatomy */
  const sheet =
    card(70, 500, 700, 380, "Anatomie de la feuille") +
    rect(110, 556, 300, 290, { fill: "#f7f7f5", r: 12, stroke: "#e6e4dd", sw: 1 }) +
    rect(240, 570, 40, 4, { fill: "#d7d9de", r: 2 }) +
    circle(146, 606, 20, { fill: "#eaf3ff" }) +
    text(178, 600, "N° 146", { fill: BLUE, size: 15, weight: 700 }) +
    text(178, 620, "32 av. de Ségur", { fill: INK, size: 11.5 }) +
    line(126, 648, 394, 648, { stroke: "#e8e9ee", sw: 1 }) +
    rect(126, 664, 120, 28, { fill: "#eef0f3", r: 6 }) +
    rect(258, 664, 136, 28, { fill: "#eef0f3", r: 6 }) +
    line(126, 712, 394, 712, { stroke: "#e8e9ee", sw: 1 }) +
    rect(126, 730, 268, 22, { fill: "#f1f2f5", r: 4 }) +
    rect(126, 780, 268, 44, { fill: BLUE, r: 22 }) +
    [
      [576, "poignée — la feuille est déplaçable", 1],
      [606, "identité du véhicule, toujours en tête", 2],
      [678, "métadonnées secondaires, en puces", 3],
      [741, "engagements (paiement, CGU)", 4],
      [802, "action unique, jamais concurrencée", 5],
    ]
      .map(([y, label, n]) => {
        return (
          line(410, y, 448, y, { stroke: "#c9c6bd", sw: 1.2, dash: "3 4" }) +
          circle(460, y, 11, { fill: BLUE }) +
          text(460, y + 4, String(n), {
            fill: "#fff",
            size: 12,
            weight: 700,
            anchor: "middle",
          }) +
          text(482, y + 4, label, { fill: GREY, size: 13 })
        );
      })
      .join("");

  /* type */
  const type =
    card(800, 500, 730, 380, "Typographie") +
    text(830, 596, "Aa", { fill: INK, size: 74, weight: 700 }) +
    text(946, 566, "Titre · 700", { fill: GREY, size: 12.5, family: MONO }) +
    text(946, 596, "Cityscoot, la liberté sans bornes", {
      fill: INK,
      size: 22,
      weight: 700,
    }) +
    text(946, 626, "Corps · 500", { fill: GREY, size: 12.5, family: MONO }) +
    text(946, 654, "32 avenue de Ségur, 75007 Paris", { fill: INK, size: 16, weight: 500 }) +
    line(830, 690, 1500, 690, { stroke: "#eceae4", sw: 1 }) +
    text(830, 726, "Chiffres tabulaires pour le numéro de scooter et le compte à rebours,", {
      fill: GREY,
      size: 13.5,
    }) +
    text(830, 750, "afin que rien ne tremble pendant que le temps défile.", {
      fill: GREY,
      size: 13.5,
    }) +
    text(830, 812, "146", { fill: BLUE, size: 40, weight: 700, family: MONO }) +
    text(920, 812, "14:52", { fill: INK, size: 40, weight: 700, family: MONO });

  return svg({
    w: W,
    h: H,
    bg: PAPER,
    children:
      text(48, 56, "Cityscoot · éléments d’interface", {
        fill: INK,
        size: 15,
        weight: 700,
        family: MONO,
        spacing: 2,
        upper: true,
      }) +
      btns +
      forms +
      tokens +
      sheet +
      type +
      caption(W, H, "reconstruction · bibliothèque de composants", {
        fill: INK,
        dim: 0.38,
      }),
  });
}

export const panels = [
  ["cityscoot-mapflow", mapflow],
  ["cityscoot-markers", markers],
  ["cityscoot-components", components],
];
