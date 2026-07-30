import { useRef, useState } from "react";
import { WORKS, type Work } from "../data/works";

/** A row is a link only when the project has a case-study page. */
const hasPage = (work: Work) => Boolean(work.study);

/**
 * Selected work — a monumental typographic index. Hovering a row floods the
 * section with that project's visual; clicking goes to its case-study page.
 * Projects without a page keep the "available on request" cursor tip.
 */
export default function WorkGallery() {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const tipRef = useRef<HTMLDivElement | null>(null);

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
            const openable = hasPage(work);

            const enter = () => setHoverIndex(index);
            const leave = () => {
              setHoverIndex((i) => (i === index ? null : i));
              tipRef.current?.classList.remove("is-on");
            };
            const track = () =>
              window.posthog?.capture(
                openable ? "work_project_opened" : "work_project_teased",
                { project_name: work.name, project_tag: work.tag },
              );

            const inner = (
              <>
                <span className="work-row-name">
                  {work.name}
                  {domain && <i className="work-row-domain">{domain}</i>}
                </span>
                <span className="work-row-meta">
                  {meta}
                  {openable && (
                    <>
                      {" · "}
                      <i className="work-row-read">read</i>
                    </>
                  )}
                </span>
              </>
            );

            return (
              <li key={work.name}>
                {openable ? (
                  <a
                    href={`/work/${work.slug}`}
                    className="work-row"
                    onMouseEnter={enter}
                    onMouseLeave={leave}
                    onFocus={enter}
                    onBlur={leave}
                    onClick={track}
                    aria-label={`Read the ${work.name} case study`}
                  >
                    {inner}
                  </a>
                ) : (
                  <button
                    type="button"
                    className="work-row"
                    onMouseEnter={enter}
                    onMouseLeave={leave}
                    onMouseMove={(event) => {
                      const tip = tipRef.current;
                      if (!tip) return;
                      tip.style.transform = `translate(${event.clientX + 14}px, ${event.clientY + 10}px)`;
                      tip.classList.add("is-on");
                    }}
                    onFocus={enter}
                    onBlur={leave}
                    onClick={track}
                    aria-label={`${work.name} — available on request`}
                    style={{ cursor: "default" }}
                  >
                    {inner}
                  </button>
                )}
              </li>
            );
          })}
        </ul>

        <div ref={tipRef} className="work-tip" aria-hidden="true">
          available on request
        </div>
      </div>
    </div>
  );
}
