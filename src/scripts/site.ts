import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);
// Avoid ScrollTrigger's 100vh mobile-resize refresh path — it throws a
// `removeChild` NotFoundError with our `min-h-[100svh]` hero and aborts refresh.
ScrollTrigger.config({ ignoreMobileResize: true });

const html = document.documentElement;
const prefersReduced = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

type Mode = "story" | "libre";
const STORAGE_KEY = "folio-mode";
const THEME_KEY = "folio-theme";

// ScrollTrigger.refresh can throw in its 100vh path; never let that abort us.
function safeRefresh() {
  try {
    ScrollTrigger.refresh();
  } catch {
    /* ignore ScrollTrigger refresh quirks — failsafe in buildReveals covers it */
  }
}

/* --------------------------------------------------------- Lenis (story only) */
let lenis: Lenis | null = null;
let rafId = 0;

function startLenis() {
  if (lenis || prefersReduced) return;
  lenis = new Lenis({ duration: 1.1, smoothWheel: true, touchMultiplier: 1.5 });
  lenis.on("scroll", ScrollTrigger.update);
  const raf = (time: number) => {
    lenis?.raf(time);
    rafId = requestAnimationFrame(raf);
  };
  rafId = requestAnimationFrame(raf);
}

function stopLenis() {
  if (!lenis) return;
  cancelAnimationFrame(rafId);
  lenis.destroy();
  lenis = null;
}

/* ------------------------------------------------------------- Base reveals
   Reveals are driven by a CSS class (`.is-in`), NOT GSAP inline opacity. A GSAP
   "from {opacity:0}" tween leaves an *inline* style that no CSS failsafe can
   override — so if ScrollTrigger ever fails to fire (e.g. the 100svh hero makes
   `refresh()` throw), every element stays stranded at opacity:0 and the whole
   page reads as blank. Class-driven reveals + a `.reveal-all` failsafe make that
   impossible: content can never get permanently stuck hidden. */
function buildReveals() {
  if (prefersReduced) return; // reduced-motion CSS already shows everything
  html.classList.add("armed");
  html.classList.add("reveal-ready"); // signal the head-script failsafe that JS is alive

  const els = gsap.utils.toArray<HTMLElement>("[data-reveal]");
  els.forEach((el) => {
    const delay = Number(el.dataset.revealDelay ?? 0);
    if (delay) el.style.transitionDelay = `${delay}s`;
    ScrollTrigger.create({
      trigger: el,
      start: "top 88%",
      once: true,
      onEnter: () => el.classList.add("is-in"),
    });
  });

  // If positioning throws (the known 100svh refresh quirk), triggers never fire.
  // Bail to the failsafe so the content still shows.
  try {
    ScrollTrigger.refresh();
  } catch {
    html.classList.add("reveal-all");
    return;
  }

  // onEnter does not fire for triggers already active on first paint — reveal
  // anything in (or near) view on load directly.
  const vh = window.innerHeight;
  els.forEach((el) => {
    if (el.getBoundingClientRect().top < vh * 0.88) el.classList.add("is-in");
  });
}

/* ------------------------------------------------- Profile statement scrub
   The scroll drives the sentence in, word by word (Polar-style). Words are
   dimmed via the `.st-armed` class added HERE, right before the trigger is
   created — so if this never runs (or throws), the text is simply readable.
   `.reveal-all` also forces the words on (see global.css). */
function buildStatement() {
  if (prefersReduced) return;
  const st = document.querySelector<HTMLElement>("[data-statement]");
  if (!st) return;
  const words = st.querySelectorAll<HTMLElement>(".st-w");
  if (!words.length) return;
  try {
    st.classList.add("st-armed");
    gsap.to(words, {
      opacity: 1,
      ease: "none",
      stagger: 0.08,
      scrollTrigger: {
        trigger: st,
        start: "top 80%",
        end: "bottom 45%",
        scrub: 0.3,
      },
    });
  } catch {
    st.classList.remove("st-armed");
  }
}

/* ----------------------------------------------- Story-only scenes */
let storyTriggers: ScrollTrigger[] = [];

function buildStoryScenes() {
  // Connector draw-ins removed — kept Story scroll lightweight (no extra
  // per-frame ScrollTrigger work). Bracket connector lines stay static (CSS).
}

function destroyStoryScenes() {
  storyTriggers.forEach((t) => t.kill());
  storyTriggers = [];
}

/* -------------------------------------------------------------- Mode switch */
function syncToggle(mode: Mode) {
  document
    .querySelectorAll<HTMLButtonElement>("[data-mode-btn]")
    .forEach((b) => {
      b.setAttribute("aria-pressed", String(b.dataset.modeBtn === mode));
    });
}

function applyMode(mode: Mode, shouldTrack = false) {
  html.dataset.mode = mode;
  if (mode === "story") {
    startLenis();
    buildStoryScenes();
  } else {
    stopLenis();
    destroyStoryScenes();
  }
  syncToggle(mode);
  localStorage.setItem(STORAGE_KEY, mode);
  safeRefresh();
  if (shouldTrack) {
    window.posthog?.capture("mode_toggled", { mode });
  }
}

/* ------------------------------------------------------------- Theme switch */
/* The head script has already set `data-theme` before first paint (no FOUC);
   this only handles the toggle and persistence. Switching resizes the display
   type, so ScrollTrigger has to re-measure afterwards. */
type Theme = "dark" | "light";

function applyTheme(theme: Theme, shouldTrack = false) {
  html.dataset.theme = theme;
  document
    .querySelectorAll<HTMLButtonElement>("[data-theme-btn]")
    .forEach((b) => {
      b.setAttribute("aria-pressed", String(theme === "light"));
      b.setAttribute(
        "aria-label",
        theme === "light" ? "Switch to the dark theme" : "Switch to the light theme",
      );
    });
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* private mode — the theme just won't persist */
  }
  safeRefresh();
  if (shouldTrack) {
    window.posthog?.capture("theme_toggled", { theme });
  }
}

function wireTheme() {
  applyTheme(html.dataset.theme === "light" ? "light" : "dark");
  document
    .querySelectorAll<HTMLButtonElement>("[data-theme-btn]")
    .forEach((b) => {
      b.addEventListener("click", () => {
        applyTheme(html.dataset.theme === "light" ? "dark" : "light", true);
      });
    });
}

/* --------------------------------------------------- "scrolled" + anchors */
function trackScrolled() {
  const onScroll = () => {
    html.classList.toggle("scrolled", window.scrollY > window.innerHeight * 0.6);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

/* Smooth anchor jumps respect Lenis when active */
function wireAnchors() {
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector<HTMLElement>(id);
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { offset: -64 });
      else target.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth" });
    });
  });
}

/* ---------------------------------------------- Lazy in-view motion videos */
function enterFullscreen(v: HTMLVideoElement) {
  type FsVideo = HTMLVideoElement & {
    webkitRequestFullscreen?: () => Promise<void> | void;
    webkitEnterFullscreen?: () => void;
  };
  const fv = v as FsVideo;
  v.controls = true;
  v.muted = true;
  const req =
    fv.requestFullscreen?.bind(fv) ??
    fv.webkitRequestFullscreen?.bind(fv) ??
    fv.webkitEnterFullscreen?.bind(fv);
  try {
    req?.();
  } catch {
    /* fullscreen rejected — playback still starts inline below */
  }
  void v.play().catch(() => {});
}

function initMotion() {
  // Click / keyboard on a clip → fullscreen playback (regardless of reduced motion).
  document.querySelectorAll<HTMLElement>("[data-fullscreen]").forEach((fig) => {
    const v = fig.querySelector<HTMLVideoElement>("[data-motion]");
    if (!v) return;
    fig.addEventListener("click", () => enterFullscreen(v));
    fig.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        enterFullscreen(v);
      }
    });
  });

  // Restore the quiet poster tiles after leaving fullscreen. Scoped to the
  // click-to-fullscreen tiles: case-study clips keep their own controls.
  document.addEventListener("fullscreenchange", () => {
    if (document.fullscreenElement || prefersReduced) return;
    document
      .querySelectorAll<HTMLVideoElement>("[data-fullscreen] [data-motion]")
      .forEach((v) => (v.controls = false));
  });

  const vids = Array.from(
    document.querySelectorAll<HTMLVideoElement>("[data-motion]"),
  );
  if (!vids.length) return;

  // Reduced motion: never autoplay — show poster, expose controls.
  if (prefersReduced) {
    vids.forEach((v) => {
      v.controls = true;
      v.preload = "metadata";
    });
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        const v = e.target as HTMLVideoElement;
        if (e.isIntersecting) void v.play().catch(() => {});
        else v.pause();
      });
    },
    { threshold: 0.35 },
  );
  vids.forEach((v) => io.observe(v));
}

/* ------------------------------------------------------- Wordmark scramble */
/* The wordmark periodically decodes out of noise instead of sitting static.
   The scramble pool is "complexity"'s own letters — complexity resolving
   into the plain three-letter mark. Repeats on a fixed interval so it stays
   a background detail, not a one-off intro flourish. */
const SCRAMBLE_INTERVAL = 5000;

function scrambleReveal(el: HTMLElement) {
  const target = el.dataset.scramble ?? el.textContent ?? "";
  const pool = [...new Set("complexity")];
  const speed = 45;
  const iterations = 12;
  let frame = 0;

  // Random glyphs rarely measure the same width as the real word, which can
  // reflow whatever sits after it (e.g. "disappear" wrapping to the next
  // line mid-scramble). Lock the box to its settled width for the duration.
  const width = el.getBoundingClientRect().width;
  el.style.display = "inline-block";
  el.style.width = `${width}px`;
  el.style.overflow = "hidden";

  const tick = () => {
    frame++;
    el.textContent = target
      .split("")
      .map(() => pool[Math.floor(Math.random() * pool.length)])
      .join("");
    if (frame >= iterations) {
      el.textContent = target;
      el.style.display = "";
      el.style.width = "";
      el.style.overflow = "";
      return;
    }
    setTimeout(tick, speed);
  };
  tick();
}

function initScramble() {
  if (prefersReduced) return;
  const els = document.querySelectorAll<HTMLElement>("[data-scramble]");
  els.forEach((el) => {
    scrambleReveal(el);
    setInterval(() => scrambleReveal(el), SCRAMBLE_INTERVAL);
  });
}

/* --------------------------------------------------------------- Bootstrap */
function init() {
  const saved = localStorage.getItem(STORAGE_KEY) as Mode | null;
  const initial: Mode = saved ?? (prefersReduced ? "libre" : "story");

  initScramble();
  buildReveals();
  buildStatement();
  trackScrolled();
  wireAnchors();
  initMotion();
  wireTheme();
  applyMode(initial);

  document
    .querySelectorAll<HTMLButtonElement>("[data-mode-btn]")
    .forEach((b) => {
      b.addEventListener("click", () => {
        const nextMode = b.dataset.modeBtn as Mode;
        applyMode(nextMode, html.dataset.mode !== nextMode);
      });
    });

  window.addEventListener("resize", safeRefresh);
}

init();
