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
function initMotion() {
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

/* --------------------------------------------------------------- Bootstrap */
function init() {
  const saved = localStorage.getItem(STORAGE_KEY) as Mode | null;
  const initial: Mode = saved ?? (prefersReduced ? "libre" : "story");

  buildReveals();
  trackScrolled();
  wireAnchors();
  initMotion();
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
