/**
 * Shared SVG kit for the reconstructed work visuals.
 *
 * Why SVG, and why generated: the source files for several older projects are
 * gone. Rather than shipping heavy re-exported bitmaps, each panel is rebuilt
 * as vector, in the project's own palette — a few kB instead of a few hundred,
 * sharp at any size, and consistent with the site's "rebuilt live, not
 * screenshotted" argument.
 *
 * These panels are RECONSTRUCTIONS of real work, not the original artefacts.
 * Keep them faithful to what the project actually was; never invent a client,
 * a date or a result.
 *
 * Fonts: panels are served through <img>, which cannot pull webfonts, so
 * everything falls back to system stacks on purpose. Do not reference the
 * site's Instrument Serif / Rethink Sans here — they simply would not render.
 */

export const SANS =
  "'Helvetica Neue', Helvetica, Arial, 'Liberation Sans', sans-serif";
export const MONO =
  "'SF Mono', 'JetBrains Mono', Menlo, Consolas, 'Liberation Mono', monospace";

const esc = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

/** Root document. `defs` is raw markup (gradients, clips, filters). */
export function svg({ w, h, bg, defs = "", children }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img">
${defs ? `<defs>${defs}</defs>\n` : ""}<rect width="${w}" height="${h}" fill="${bg}"/>
${children}
</svg>`;
}

export function rect(x, y, w, h, o = {}) {
  const {
    fill = "none",
    stroke,
    sw = 1,
    r = 0,
    opacity,
    dash,
    transform,
  } = o;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"${
    stroke ? ` stroke="${stroke}" stroke-width="${sw}"` : ""
  }${dash ? ` stroke-dasharray="${dash}"` : ""}${
    opacity != null ? ` opacity="${opacity}"` : ""
  }${transform ? ` transform="${transform}"` : ""}/>`;
}

export function circle(cx, cy, r, o = {}) {
  const { fill = "none", stroke, sw = 1, opacity, dash } = o;
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"${
    stroke ? ` stroke="${stroke}" stroke-width="${sw}"` : ""
  }${dash ? ` stroke-dasharray="${dash}"` : ""}${
    opacity != null ? ` opacity="${opacity}"` : ""
  }/>`;
}

export function path(d, o = {}) {
  const { fill = "none", stroke, sw = 1, opacity, cap = "round", dash } = o;
  return `<path d="${d}" fill="${fill}"${
    stroke ? ` stroke="${stroke}" stroke-width="${sw}" stroke-linecap="${cap}"` : ""
  }${dash ? ` stroke-dasharray="${dash}"` : ""}${
    opacity != null ? ` opacity="${opacity}"` : ""
  }/>`;
}

export function line(x1, y1, x2, y2, o = {}) {
  const { stroke = "#000", sw = 1, opacity, dash, cap = "round" } = o;
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="${cap}"${
    dash ? ` stroke-dasharray="${dash}"` : ""
  }${opacity != null ? ` opacity="${opacity}"` : ""}/>`;
}

export function text(x, y, str, o = {}) {
  const {
    fill = "#fff",
    size = 14,
    weight = 400,
    family = SANS,
    anchor = "start",
    spacing,
    opacity,
    transform,
    upper,
  } = o;
  const content = esc(upper ? String(str).toUpperCase() : str);
  return `<text x="${x}" y="${y}" fill="${fill}" font-family="${family}" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}"${
    spacing != null ? ` letter-spacing="${spacing}"` : ""
  }${opacity != null ? ` opacity="${opacity}"` : ""}${
    transform ? ` transform="${transform}"` : ""
  }>${content}</text>`;
}

export const group = (children, transform) =>
  `<g${transform ? ` transform="${transform}"` : ""}>${children}</g>`;

/** Caption strip every panel carries, so a reconstruction is never mistaken
 *  for an original screenshot. */
export function caption(w, h, label, { fill = "#fff", dim = 0.42 } = {}) {
  return text(48, h - 40, label, {
    fill,
    size: 19,
    family: MONO,
    spacing: 1.4,
    opacity: dim,
    upper: true,
  });
}

/** Rounded phone body with a clipped screen area and a notch + side buttons,
 *  so it reads as an actual device rather than a generic rounded rect —
 *  matches the bezel of the real cover-shot screenshots used as hero images.
 *  `id` must be unique. */
export function phone(x, y, w, h, { id, screen, body = "#000", radius = 34 }) {
  const inset = 8;
  const notchW = w * 0.34;
  const notchH = 22;
  const notchX = (w - notchW) / 2;
  const buttons =
    rect(-2, h * 0.145, 2.5, h * 0.045, { fill: "#2c2c2e", r: 1 }) +
    rect(-2, h * 0.205, 2.5, h * 0.09, { fill: "#2c2c2e", r: 1 }) +
    rect(-2, h * 0.305, 2.5, h * 0.09, { fill: "#2c2c2e", r: 1 }) +
    rect(w - 0.5, h * 0.175, 2.5, h * 0.12, { fill: "#2c2c2e", r: 1 });
  const notch =
    rect(notchX, inset, notchW, notchH, { fill: "#0b0b0d", r: notchH / 2 }) +
    circle(notchX + notchW - 17, inset + notchH / 2, 3, { fill: "#1c2733" }) +
    circle(notchX + notchW - 17, inset + notchH / 2, 1.3, { fill: "#33465c" });
  return `<g transform="translate(${x} ${y})">
  <clipPath id="${id}"><rect x="${inset}" y="${inset}" width="${w - inset * 2}" height="${
    h - inset * 2
  }" rx="${radius - inset}"/></clipPath>
  ${buttons}
  ${rect(0, 0, w, h, { fill: body, r: radius })}
  <g clip-path="url(#${id})">${screen}</g>
  ${notch}
  ${rect(0.5, 0.5, w - 1, h - 1, { r: radius, stroke: "rgba(255,255,255,0.14)", sw: 1 })}
</g>`;
}

/** Desktop/browser chrome with a clipped viewport. `id` must be unique. */
export function window_(x, y, w, h, { id, screen, chrome = "#e8e8e6", bar = 34 }) {
  return `<g transform="translate(${x} ${y})">
  <clipPath id="${id}"><rect x="0" y="${bar}" width="${w}" height="${h - bar}"/></clipPath>
  ${rect(0, 0, w, h, { fill: chrome, r: 10 })}
  ${circle(18, bar / 2, 5, { fill: "#f2564c" })}
  ${circle(36, bar / 2, 5, { fill: "#f5bf4f" })}
  ${circle(54, bar / 2, 5, { fill: "#5ec45e" })}
  <g clip-path="url(#${id})">${screen}</g>
  ${rect(0.5, 0.5, w - 1, h - 1, { r: 10, stroke: "rgba(0,0,0,0.16)", sw: 1 })}
</g>`;
}

/** Evenly spaced bars — used for waveforms and simple charts. */
export function bars(x, y, count, { gap = 6, width = 4, fill, heights, baseline = "center" }) {
  let out = "";
  for (let i = 0; i < count; i++) {
    const hgt = heights(i);
    const bx = x + i * (width + gap);
    const by = baseline === "center" ? y - hgt / 2 : y - hgt;
    out += rect(bx, by, width, hgt, { fill, r: width / 2 });
  }
  return out;
}
