import { useEffect, useMemo, useRef, useState } from "react";

type Work = {
  name: string;
  tag: string;
  images: WorkImage[];
  fit?: "cover" | "contain";
  bg?: string;
  summary: string;
  role: string;
};

type WorkImage = {
  src: string;
  alt: string;
  fit?: "cover" | "contain";
  bg?: string;
  position?: string;
};

const WORKS: Work[] = [
  {
    name: "Parions Sport",
    tag: "product · gaming",
    images: [{ src: "/work/fdj.jpg", alt: "Parions Sport product interface" }],
    summary:
      "Product work for a gaming interface, exploring AI-assisted ideation and RGAA 4 constraints.",
    role: "Product design · accessibility",
  },
  {
    name: "France TV",
    tag: "product · design system · broadcast",
    images: [{ src: "/work/ftv.jpg", alt: "France TV product and design system work" }],
    summary:
      "Design system and product work for public broadcast interfaces, focused on consistency and design-to-dev handoff.",
    role: "Product design · design system",
  },
  {
    name: "SNCF · station UX",
    tag: "technical UI",
    images: [
      { src: "/work/sncf.jpg", alt: "SNCF station UX work" },
      {
        src: "/work/sncf-display.jpg",
        alt: "SNCF real-time station display redesign",
      },
      {
        src: "/work/sncf/folio-ux-10.png",
        alt: "SNCF station display interface detail",
        fit: "contain",
      },
      {
        src: "/work/sncf/folio-ux-15.png",
        alt: "SNCF station display information hierarchy",
        fit: "contain",
      },
      {
        src: "/work/sncf/folio-ux-16.png",
        alt: "SNCF passenger information layout",
        fit: "contain",
      },
      {
        src: "/work/sncf/folio-ux-23.png",
        alt: "SNCF technical UI scenario",
        fit: "contain",
      },
      {
        src: "/work/sncf/folio-ux-25.png",
        alt: "SNCF technical UI variation",
        fit: "contain",
      },
      {
        src: "/work/sncf/info-train.png",
        alt: "SNCF train information screen",
        fit: "contain",
      },
      {
        src: "/work/sncf/train.png",
        alt: "SNCF train display screen",
        fit: "contain",
      },
    ],
    summary:
      "Real-time station display work where hierarchy, distance and stress define the interface.",
    role: "Information design · technical UI",
  },
  {
    name: "Brevo",
    tag: "systems · ops",
    images: [{ src: "/work/brevo.jpg", alt: "Brevo design ops work" }],
    summary:
      "Design ops and system work around tooling, process and product consistency.",
    role: "Design ops · systems",
  },
  {
    name: "Cityscoot",
    tag: "product · mobility",
    images: [
      {
        src: "/work/cityscoot.jpg",
        alt: "Cityscoot product design work",
        fit: "contain",
        bg: "#f5f4ef",
      },
    ],
    fit: "contain",
    bg: "#f5f4ef",
    summary:
      "Product design for mobility flows, balancing speed, clarity and operational constraints.",
    role: "Product design · mobile flows",
  },
  {
    name: "AKT",
    tag: "product · fintech",
    images: [
      { src: "/work/akt.jpg", alt: "AKT fintech product work" },
      {
        src: "/work/akt/image-76.png",
        alt: "AKT fintech interface detail",
        fit: "contain",
      },
      {
        src: "/work/akt/image-77.png",
        alt: "AKT fintech interface variation",
        fit: "contain",
      },
      {
        src: "/work/akt/image-78.png",
        alt: "AKT fintech interface screen",
        fit: "contain",
      },
    ],
    summary:
      "Product and fintech interface work, with a focus on structured decisions and trust.",
    role: "Product design · fintech",
  },
  {
    name: "kaskad",
    tag: "branding",
    images: [{ src: "/work/kaskad.jpg", alt: "kaskad brand identity" }],
    summary:
      "Brand identity and web direction for a product with a sharper visual signal.",
    role: "Art direction · brand",
  },
  {
    name: "Black Sales",
    tag: "branding",
    images: [{ src: "/work/blacksails.jpg", alt: "Black Sales brand identity" }],
    summary:
      "Brand identity work for a product with a direct, commercial voice.",
    role: "Brand identity",
  },
  {
    name: "Plé",
    tag: "branding",
    images: [
      { src: "/work/plume.jpg", alt: "Plé identity poster" },
      {
        src: "/work/ple.jpg",
        alt: "Plé horizontal identity composition",
        fit: "contain",
        bg: "#f5efe4",
      },
    ],
    summary: "Identity work around a small, precise brand system.",
    role: "Brand identity",
  },
  {
    name: "beroé",
    tag: "branding",
    images: [{ src: "/work/beroe.jpg", alt: "beroé brand identity" }],
    summary: "Brand identity work built around naming, mark and visual tone.",
    role: "Brand identity",
  },
  {
    name: "Snatch",
    tag: "open-source · Rust CLI",
    images: [
      {
        src: "/work/snatch.jpg",
        alt: "Snatch open-source CLI logo",
        fit: "contain",
        bg: "#0a2a55",
      },
    ],
    fit: "contain",
    bg: "#0a2a55",
    summary: "Logo and identity for an open-source Rust CLI download tool.",
    role: "Logo · developer tool",
  },
  {
    name: "perceptron",
    tag: "open-source · Erlang",
    images: [
      {
        src: "/work/mlp.jpg",
        alt: "perceptron open-source Erlang logo",
        fit: "contain",
        bg: "#082a4f",
      },
    ],
    fit: "contain",
    bg: "#082a4f",
    summary:
      "Logo and identity for an Erlang multilayer-perceptron project.",
    role: "Logo · open source",
  },
];

export default function WorkGallery() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const active = activeIndex == null ? null : WORKS[activeIndex];
  const activeImage = active?.images[activeImageIndex] ?? active?.images[0] ?? null;

  const count = WORKS.length;
  const modalLabel = useMemo(
    () => (active ? `${active.name} project preview` : "Project preview"),
    [active],
  );

  const close = () => {
    const index = activeIndex;
    setActiveIndex(null);
    if (index != null) {
      requestAnimationFrame(() => buttonRefs.current[index]?.focus());
    }
  };

  const move = (delta: number) => {
    setActiveImageIndex(0);
    setActiveIndex((index) => {
      if (index == null) return index;
      return (index + delta + count) % count;
    });
  };

  useEffect(() => {
    if (activeIndex == null) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") move(-1);
      if (event.key === "ArrowRight") move(1);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeIndex]);

  return (
    <div className="work-gallery">
      <div className="work-grid">
        {WORKS.map((work, index) => {
          const cardImage = work.images[0];
          const contain = (cardImage.fit ?? work.fit) === "contain";
          return (
            <button
              key={work.name}
              ref={(node) => {
                buttonRefs.current[index] = node;
              }}
              type="button"
              className="work-card"
              style={cardImage.bg || work.bg ? { background: cardImage.bg ?? work.bg } : undefined}
              onClick={() => {
                setActiveIndex(index);
                setActiveImageIndex(0);
              }}
              aria-label={`Open ${work.name}`}
            >
              <img
                src={cardImage.src}
                alt=""
                loading="lazy"
                decoding="async"
                style={cardImage.position ? { objectPosition: cardImage.position } : undefined}
                className={contain ? "work-card-img is-contain" : "work-card-img"}
              />
              <span className="work-card-shade" aria-hidden="true" />
              <span className="work-card-caption">
                <span className="work-card-name">{work.name}</span>
                <span className="tag work-card-tag">{work.tag}</span>
              </span>
            </button>
          );
        })}
      </div>

      {active && activeImage && (
        <div
          className="work-viewer"
          role="dialog"
          aria-modal="true"
          aria-label={modalLabel}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <div className="work-viewer-panel" onMouseDown={(event) => event.stopPropagation()}>
            <div
              className="work-viewer-media"
              style={
                activeImage.bg || active.bg
                  ? { background: activeImage.bg ?? active.bg }
                  : undefined
              }
            >
              <img
                src={activeImage.src}
                alt={activeImage.alt}
                style={activeImage.position ? { objectPosition: activeImage.position } : undefined}
                className={
                  (activeImage.fit ?? active.fit) === "contain"
                    ? "work-viewer-img is-contain"
                    : "work-viewer-img"
                }
              />
              {active.images.length > 1 && (
                <div className="work-image-strip" aria-label={`${active.name} images`}>
                  {active.images.map((image, index) => (
                    <button
                      key={image.src}
                      type="button"
                      className={index === activeImageIndex ? "is-active" : undefined}
                      onClick={() => setActiveImageIndex(index)}
                      aria-label={`Show image ${index + 1} for ${active.name}`}
                      aria-pressed={index === activeImageIndex}
                    >
                      <img src={image.src} alt="" loading="lazy" decoding="async" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <aside className="work-viewer-info">
              <div className="work-viewer-topline">
                <span className="tag">
                  {String((activeIndex ?? 0) + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
                </span>
                <button
                  ref={closeRef}
                  type="button"
                  className="work-icon-btn"
                  onClick={close}
                  aria-label="Close project preview"
                >
                  ×
                </button>
              </div>

              <div>
                <p className="tag work-viewer-tag">{active.tag}</p>
                <h3>{active.name}</h3>
                <p className="work-viewer-summary">{active.summary}</p>
              </div>

              <div className="work-viewer-meta">
                <span className="tag">Contribution</span>
                <p>{active.role}</p>
              </div>

              <div className="work-viewer-nav">
                <button type="button" onClick={() => move(-1)}>
                  <span aria-hidden="true">‹</span>
                  Previous
                </button>
                <button type="button" onClick={() => move(1)}>
                  Next
                  <span aria-hidden="true">›</span>
                </button>
              </div>
            </aside>
          </div>
        </div>
      )}
    </div>
  );
}
