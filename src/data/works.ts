/**
 * Single source of truth for the work: the index rows on the home page and the
 * case-study pages under /work/<slug> read from here.
 *
 * A project only gets a page when it has something to show — three or four
 * visuals and text that explains a decision. Everything else stays an index
 * row with its hover reveal (`study` undefined), and is shared on request.
 *
 * Content lives in `src/content/work/<slug>.json`, one file per project,
 * editable by hand or through the Keystatic admin at /keystatic (local only —
 * see keystatic.config.ts). This module just loads, types and orders them.
 */

export type WorkImage = {
  src: string;
  alt: string;
  /** Optional video source; `src` is then used as its poster. */
  video?: string;
  /** CSS aspect-ratio of the video (e.g. "452 / 928") so it is never cropped. */
  videoAspect?: string;
  fit?: "cover" | "contain";
  bg?: string;
  position?: string;
  caption?: string;
};

export type CaseFact = {
  title: string;
  body: string;
};

export type CaseSection = {
  heading: string;
  body: string;
  images: WorkImage[];
  /** Optional short enumerable list already present in the copy (e.g. "three
   *  commitments") rendered as a flat fact grid instead of prose. */
  facts?: CaseFact[];
};

export type CaseStudy = {
  /** One sentence under the title: what the project is, in plain terms. */
  subtitle: string;
  services: string[];
  sector: string;
  year?: string;
  hero: WorkImage;
  sections: CaseSection[];
  /** Closing line before the next-project rail. */
  outro?: string;
  /** What was actually used to design/build/rebuild this — shown before the CTA. */
  tools?: string[];
};

export type Work = {
  slug: string;
  name: string;
  tag: string;
  role: string;
  /** Index-row backdrop + fallback; images[0] is the one that floods the section. */
  images: WorkImage[];
  fit?: "cover" | "contain";
  bg?: string;
  study?: CaseStudy;
};

// --- Keystatic on-disk shapes -----------------------------------------------
// fields.select always writes its key, using "" for "(inherit)"/unset.
// fields.conditional writes { discriminant, value? }. Optional fields.text
// keys are omitted entirely when empty, which already matches our optional
// TS properties, so those pass through unchanged.

type RawImage = Omit<WorkImage, "fit"> & { fit: "" | "cover" | "contain" };

type RawStudy = Omit<CaseStudy, "hero" | "sections" | "tools"> & {
  hero: RawImage;
  sections: (Omit<CaseSection, "images" | "facts"> & { images: RawImage[]; facts: CaseFact[] })[];
  tools: string[];
};

type RawWork = Omit<Work, "images" | "fit" | "study"> & {
  order: number;
  images: RawImage[];
  fit: "" | "cover" | "contain";
  study: { discriminant: false } | { discriminant: true; value: RawStudy };
};

const unsetFit = (fit: "" | "cover" | "contain") => (fit === "" ? undefined : fit);

const readImage = (img: RawImage): WorkImage => ({ ...img, fit: unsetFit(img.fit) });

const modules = import.meta.glob<{ default: RawWork }>("/src/content/work/*.json", {
  eager: true,
});

export const WORKS: Work[] = Object.values(modules)
  .map((mod) => mod.default)
  .sort((a, b) => a.order - b.order)
  .map((raw): Work => ({
    slug: raw.slug,
    name: raw.name,
    tag: raw.tag,
    role: raw.role,
    images: raw.images.map(readImage),
    fit: unsetFit(raw.fit),
    bg: raw.bg,
    study: raw.study.discriminant
      ? {
          subtitle: raw.study.value.subtitle,
          services: raw.study.value.services,
          sector: raw.study.value.sector,
          year: raw.study.value.year,
          hero: readImage(raw.study.value.hero),
          sections: raw.study.value.sections.map((s) => ({
            heading: s.heading,
            body: s.body,
            images: s.images.map(readImage),
            facts: s.facts.length > 0 ? s.facts : undefined,
          })),
          outro: raw.study.value.outro,
          tools: raw.study.value.tools.length > 0 ? raw.study.value.tools : undefined,
        }
      : undefined,
  }));

/** Projects with a case-study page, in index order. */
export const STUDIES = WORKS.filter((w) => w.study);

export const bySlug = (slug: string) => WORKS.find((w) => w.slug === slug);
