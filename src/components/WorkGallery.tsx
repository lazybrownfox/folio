import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

type Work = {
  name: string;
  tag: string;
  images: WorkImage[];
  fit?: "cover" | "contain";
  bg?: string;
  summary?: string;
  role: string;
};

type WorkImage = {
  src: string;
  alt: string;
  /** Optional video source. When set, the viewer plays it (poster = `src`). */
  video?: string;
  /** CSS aspect-ratio of the video (e.g. "452 / 928") so the viewer frames it exactly. */
  videoAspect?: string;
  fit?: "cover" | "contain";
  bg?: string;
  position?: string;
};

const WORKS: Work[] = [
  {
    name: "Parions Sport",
    tag: "product · gaming",
    images: [
      {
        src: "/work/video/posters/fdj.jpg",
        alt: "Parions Sport product interface",
        video: "/work/video/fdj.mp4",
        videoAspect: "452 / 928",
        fit: "contain",
        bg: "#0a0d12",
      },
    ],
    summary:
      "Gaming interface explored with AI-assisted ideation under RGAA 4 constraints.",
    role: "Product design · accessibility",
  },
  {
    name: "France TV",
    tag: "product · design system · broadcast",
    images: [
      {
        src: "/work/video/posters/ftv.jpg",
        alt: "France TV product and design system work",
        video: "/work/video/ftv.mp4",
        videoAspect: "592 / 1280",
        fit: "contain",
        bg: "#0a0d12",
      },
    ],
    summary: "Design-system and product work for public-broadcast interfaces.",
    role: "Product design · design system",
  },
  {
    name: "SNCF · station UX",
    tag: "technical UI",
    images: [
      { src: "/work/sncf.jpg", alt: "SNCF station UX work" },
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
    role: "Product design · mobile flows",
  },
  {
    name: "CosmoConnected",
    tag: "product · connected mobility",
    images: [
      {
        src: "/work/video/posters/cosmoconnected.jpg",
        alt: "COSMO Connected smart-bike-light app",
        video: "/work/video/cosmoconnected.mp4",
        videoAspect: "498 / 1080",
        fit: "contain",
        bg: "#0a0d12",
      },
    ],
    summary: "App for COSMO's connected bike light — onboarding and device pairing.",
    role: "Product design · mobile app",
  },
  {
    name: "AKT",
    tag: "product · fintech",
    images: [
      {
        src: "/work/akt.jpg",
        alt: "AKT fintech product work",
        video: "/work/video/akt.mp4",
        videoAspect: "768 / 1280",
        fit: "contain",
        bg: "#0a0d12",
      },
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
    role: "Product design · fintech",
  },
  {
    name: "Black Sales",
    tag: "branding",
    images: [{ src: "/work/blacksails.jpg", alt: "Black Sales brand identity" }],
    role: "Brand identity",
  },
  {
    name: "Plé",
    tag: "branding · audio",
    images: [
      { src: "/work/ple-cover.jpg", alt: "Plé brand image" },
      {
        src: "/work/ple.jpg",
        alt: "Plé identity — logo and tagline",
        fit: "contain",
        bg: "#1a1714",
      },
    ],
    role: "Brand identity",
  },
  {
    name: "Plume",
    tag: "branding · mobility",
    images: [
      { src: "/work/plume-cover.jpg", alt: "Plume brand image" },
      {
        src: "/work/plume-slide.jpg",
        alt: "Plume identity — last-mile mobility",
        fit: "contain",
        bg: "#0a0d12",
      },
    ],
    role: "Brand identity",
  },
  {
    name: "beroé",
    tag: "branding",
    images: [{ src: "/work/beroe.jpg", alt: "beroé brand identity" }],
    fit: "contain",
    bg: "#cfcfcf",
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

// Only branding work opens in the viewer for now; everything else keeps its
// hover reveal as a teaser (full case studies shared on request — a cursor
// tooltip says so).
const canOpen = (work: Work) => work.tag.includes("branding");

export default function WorkGallery() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const tipRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const active = activeIndex == null ? null : WORKS[activeIndex];
  const activeImage = active?.images[activeImageIndex] ?? active?.images[0] ?? null;

  const count = WORKS.length;
  const modalLabel = useMemo(
    () => (active ? `${active.name} project preview` : "Project preview"),
    [active],
  );
  const prefersReduced = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  // Open a project from anywhere on the page (brand grid, SNCF images …).
  useEffect(() => {
    const onOpen = (event: Event) => {
      const name = (event as CustomEvent<{ name?: string }>).detail?.name;
      if (!name) return;
      const index = WORKS.findIndex((w) => w.name === name);
      if (index < 0 || !canOpen(WORKS[index])) return;
      window.posthog?.capture("work_project_opened", {
        project_name: WORKS[index].name,
        project_tag: WORKS[index].tag,
      });
      setActiveImageIndex(0);
      setActiveIndex(index);
    };
    window.addEventListener("folio:open-work", onOpen as EventListener);
    return () =>
      window.removeEventListener("folio:open-work", onOpen as EventListener);
  }, []);

  const close = () => {
    const index = activeIndex;
    if (index != null) {
      window.posthog?.capture('work_project_closed', { project_name: WORKS[index].name });
    }
    setActiveIndex(null);
    if (index != null) {
      requestAnimationFrame(() => buttonRefs.current[index]?.focus());
    }
  };

  const move = (delta: number) => {
    setActiveImageIndex(0);
    setActiveIndex((index) => {
      if (index == null) return index;
      const next = (index + delta + count) % count;
      window.posthog?.capture('work_project_navigated', {
        from_project: WORKS[index].name,
        to_project: WORKS[next].name,
        direction: delta > 0 ? 'next' : 'previous',
      });
      return next;
    });
  };

  const moveImage = (delta: number) => {
    if (!active) return;
    const total = active.images.length;
    setActiveImageIndex((i) => (i + delta + total) % total);
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
      <div className="work-index-zone">
        {/* full-bleed backdrop: the hovered project floods the section */}
        <div
          className={
            hoverIndex == null ? "work-index-bg" : "work-index-bg is-active"
          }
          aria-hidden="true"
        >
          {WORKS.map((work, index) => {
            const image = work.images[0];
            const contain = (image.fit ?? work.fit) === "contain";
            return (
              <img
                key={work.name}
                src={image.src}
                alt=""
                loading="lazy"
                decoding="async"
                style={
                  contain && (image.bg ?? work.bg)
                    ? { backgroundColor: image.bg ?? work.bg }
                    : undefined
                }
                className={[
                  contain ? "is-contain" : "",
                  index === hoverIndex ? "is-on" : "",
                ]
                  .join(" ")
                  .trim() || undefined}
              />
            );
          })}
        </div>

        <ul className="work-index">
          {WORKS.map((work, index) => {
            const [domain, ...tagRest] = work.tag
              .split("·")
              .map((part) => part.trim());
            const meta = tagRest.join(" · ") || work.role;
            const hasMotion = work.images.some((image) => image.video);
            const openable = canOpen(work);
            return (
              <li key={work.name}>
                <button
                  ref={(node) => {
                    buttonRefs.current[index] = node;
                  }}
                  type="button"
                  className="work-row"
                  onMouseEnter={() => setHoverIndex(index)}
                  onMouseLeave={() => {
                    setHoverIndex((i) => (i === index ? null : i));
                    tipRef.current?.classList.remove("is-on");
                  }}
                  onMouseMove={
                    openable
                      ? undefined
                      : (event) => {
                          const tip = tipRef.current;
                          if (!tip) return;
                          tip.style.transform = `translate(${event.clientX + 14}px, ${event.clientY + 10}px)`;
                          tip.classList.add("is-on");
                        }
                  }
                  onFocus={() => setHoverIndex(index)}
                  onBlur={() =>
                    setHoverIndex((i) => (i === index ? null : i))
                  }
                  onClick={() => {
                    window.posthog?.capture(
                      openable ? 'work_project_opened' : 'work_project_teased',
                      { project_name: work.name, project_tag: work.tag },
                    );
                    if (!openable) return;
                    setActiveIndex(index);
                    setActiveImageIndex(0);
                  }}
                  aria-disabled={!openable}
                  aria-label={openable ? `Open ${work.name}` : `${work.name} — available on request`}
                  style={openable ? undefined : { cursor: "default" }}
                >
                  <span className="work-row-name">
                    {work.name}
                    {domain && <i className="work-row-domain">{domain}</i>}
                  </span>
                  <span className="work-row-meta">
                    {meta}
                    {hasMotion && " · ▶"}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <div ref={tipRef} className="work-tip" aria-hidden="true">
          available on request
        </div>
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
            <button
              ref={closeRef}
              type="button"
              className="work-viewer-close"
              onClick={close}
              aria-label="Close project preview"
            >
              ×
            </button>
            <div
              className={
                activeImage.video ? "work-viewer-media is-video" : "work-viewer-media"
              }
              style={{
                ...(activeImage.bg || active.bg
                  ? { background: activeImage.bg ?? active.bg }
                  : {}),
                ...(activeImage.video && activeImage.videoAspect
                  ? ({ "--va": activeImage.videoAspect } as CSSProperties)
                  : {}),
              }}
            >
              <div className="work-viewer-stage">
                {activeImage.video ? (
                  <video
                    key={activeImage.video}
                    src={activeImage.video}
                    poster={activeImage.src}
                    className="work-viewer-img is-contain"
                    muted
                    loop
                    playsInline
                    controls
                    autoPlay={!prefersReduced}
                    aria-label={activeImage.alt}
                  />
                ) : (
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
                )}
                {active.images.length > 1 && (
                  <>
                    <button
                      type="button"
                      className="work-stage-arrow is-prev"
                      onClick={() => moveImage(-1)}
                      aria-label="Previous image"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      className="work-stage-arrow is-next"
                      onClick={() => moveImage(1)}
                      aria-label="Next image"
                    >
                      ›
                    </button>
                  </>
                )}
              </div>
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
                      {image.video && (
                        <span className="work-image-strip-play" aria-hidden="true">
                          ▶
                        </span>
                      )}
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
                {active.images.length > 1 && (
                  <span className="tag work-viewer-imgcount">
                    {String(activeImageIndex + 1).padStart(2, "0")} / {String(active.images.length).padStart(2, "0")}
                  </span>
                )}
              </div>

              <div>
                <p className="tag work-viewer-tag">{active.tag}</p>
                <h3>{active.name}</h3>
                {active.summary && (
                  <p className="work-viewer-summary">{active.summary}</p>
                )}
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
