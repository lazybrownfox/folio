/**
 * Vercel Edge Middleware — shared-password gate for the portfolio.
 *
 * This is a PLATFORM (Vercel) middleware, not Astro's `src/middleware.ts`.
 * It runs at the edge for every request — including the static deployment —
 * BEFORE anything is served, so the site stays 100% static/CDN behind the gate.
 *
 * Config (Vercel → Project → Settings → Environment Variables):
 *   SITE_PASSWORD   (required)  the shared password visitors must enter.
 *   AUTH_SECRET     (optional)  random string used to sign the session cookie.
 *                               Falls back to SITE_PASSWORD if unset.
 *
 * Behaviour:
 *   - No SITE_PASSWORD set  → fail OPEN (site public). The gate is opt-in;
 *     this prevents a forgotten env var from bricking the site.
 *   - Not authenticated     → serves an on-brand /login page (HTTP 401).
 *   - POST /__auth          → verifies password, sets a signed HttpOnly cookie.
 *   - GET  /__logout        → clears the cookie.
 *   - Authenticated         → request continues to the static site.
 *
 * The password never reaches the client: comparison happens here at the edge.
 * The cookie is an HMAC-signed `exp.signature` token, so it can't be forged.
 */
import { next } from '@vercel/edge';

export const config = {
  // Match every path (Vercel excludes its own `/_vercel/*` internals automatically).
  // We intentionally gate assets too, so nothing can be deep-linked while locked.
  matcher: '/:path*',
};

const COOKIE_NAME = 'folio_auth';
const SESSION_TTL = 60 * 60 * 24 * 30; // 30 days, seconds

// Vercel's edge runtime exposes env vars on `process.env`. Read via globalThis so
// it type-checks without @types/node and never clashes if that's added later.
function readEnv(name: string): string | undefined {
  return (globalThis as unknown as { process?: { env: Record<string, string | undefined> } })
    .process?.env?.[name];
}

// Paths allowed through even when locked (keeps the login page looking right).
const PUBLIC_PATHS = new Set(['/favicon.svg']);

const enc = new TextEncoder();

function base64url(bytes: Uint8Array): string {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function hmac(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  return base64url(new Uint8Array(sig));
}

/** Constant-time-ish string compare (avoids early-exit timing leaks). */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

async function makeToken(secret: string): Promise<string> {
  const exp = String(Math.floor(Date.now() / 1000) + SESSION_TTL);
  return `${exp}.${await hmac(secret, exp)}`;
}

async function verifyToken(secret: string, token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const dot = token.lastIndexOf('.');
  if (dot <= 0) return false;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = await hmac(secret, payload);
  if (!safeEqual(sig, expected)) return false;
  const exp = Number(payload);
  return Number.isFinite(exp) && exp > Math.floor(Date.now() / 1000);
}

function getCookie(request: Request, name: string): string | undefined {
  const header = request.headers.get('cookie');
  if (!header) return undefined;
  for (const part of header.split(';')) {
    const eq = part.indexOf('=');
    if (eq === -1) continue;
    if (part.slice(0, eq).trim() === name) {
      return decodeURIComponent(part.slice(eq + 1).trim());
    }
  }
  return undefined;
}

/** Only allow same-origin, single-slash relative paths (blocks open redirects). */
function sanitizePath(path: string): string {
  if (!path.startsWith('/') || path.startsWith('//') || path.startsWith('/\\')) return '/';
  return path;
}

function setCookie(value: string, maxAge: number): string {
  return [
    `${COOKIE_NAME}=${value}`,
    'Path=/',
    `Max-Age=${maxAge}`,
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
  ].join('; ');
}

export default async function middleware(request: Request): Promise<Response> {
  const password = readEnv('SITE_PASSWORD');

  // Gate is opt-in: without a password configured, don't lock anyone out.
  if (!password) return next();

  const secret = readEnv('AUTH_SECRET') || password;
  const url = new URL(request.url);
  const { pathname } = url;

  if (PUBLIC_PATHS.has(pathname)) return next();

  // Logout: clear the cookie and bounce home.
  if (pathname === '/__logout') {
    return new Response(null, {
      status: 302,
      headers: { Location: '/', 'Set-Cookie': setCookie('', 0), 'Cache-Control': 'no-store' },
    });
  }

  // Login submission.
  if (request.method === 'POST' && pathname === '/__auth') {
    const form = await request.formData();
    // Vercel Dev can consume a middleware request body before this handler sees
    // it. The same-origin JS flow sends the value as a request header; the
    // form body remains as a no-JS and production fallback.
    const provided = request.headers.get('x-folio-password') ?? String(form.get('password') ?? '');
    const dest = sanitizePath(String(form.get('next') ?? '/'));
    if (safeEqual(provided, password)) {
      const token = await makeToken(secret);
      return new Response(null, {
        status: 303,
        headers: {
          Location: dest,
          'Set-Cookie': setCookie(encodeURIComponent(token), SESSION_TTL),
          'Cache-Control': 'no-store',
        },
      });
    }
    return loginResponse(dest, true);
  }

  // Already authenticated → let the static site serve the request.
  if (await verifyToken(secret, getCookie(request, COOKIE_NAME))) {
    return next();
  }

  // Locked → serve the login page for whatever was requested.
  return loginResponse(pathname + url.search, false);
}

function loginResponse(nextPath: string, error: boolean): Response {
  return new Response(loginHtml(sanitizePath(nextPath), error), {
    status: 401,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function loginHtml(nextPath: string, error: boolean): string {
  return `<!doctype html>
<html lang="en" data-mode="story">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex, nofollow" />
<title>fhd.xyz · Private portfolio</title>
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="preconnect" href="https://api.fontshare.com" crossorigin />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Rethink+Sans:wght@400;500;600&display=swap" />
<link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=general-sans@500,600&display=swap" />
<style>
  :root {
    --bg: #141210; --elev: #1c1916; --fg: #ede7dc; --muted: #a69d8f;
    --accent: #c9a26a; --line: rgba(237,231,220,.12);
    --line-strong: rgba(237,231,220,.24); --danger: #e4a298;
    color-scheme: dark;
  }
  * { box-sizing: border-box; }
  html, body { height: 100%; }
  body {
    margin: 0; background: var(--bg); color: var(--fg);
    font-family: "Rethink Sans", ui-sans-serif, system-ui, -apple-system, sans-serif;
    -webkit-font-smoothing: antialiased; line-height: 1.5;
    display: grid; place-items: center; padding: clamp(1.25rem, 4vw, 3rem);
    background-image:
      radial-gradient(45rem 28rem at 50% 38%, rgba(201,162,106,.055), transparent 70%);
  }
  ::selection { background: var(--accent); color: var(--bg); }
  main {
    width: min(100%, 23rem);
    transition: opacity .32s ease, transform .32s cubic-bezier(.22,1,.36,1);
  }
  body.is-unlocking main { opacity: 0; transform: translateY(-.75rem); }
  .brand {
    margin: 0 0 3rem; display: flex; align-items: center; gap: .7rem;
    color: var(--fg); font-family: "General Sans", "Rethink Sans", sans-serif;
    font-size: clamp(1.65rem, 6vw, 2.15rem); font-weight: 600;
    letter-spacing: -.055em;
  }
  .brand::before {
    content: ""; width: .45rem; height: .45rem; border-radius: 50%;
    background: var(--accent);
  }
  h1 {
    margin: 0 0 1.25rem; font-family: "General Sans", "Rethink Sans", sans-serif;
    font-size: 1rem; font-weight: 500; letter-spacing: -.01em; color: var(--muted);
  }
  form { display: grid; gap: .65rem; }
  .sr-only {
    position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
    overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0;
  }
  .password-field { position: relative; }
  input[type=password], input[type=text] {
    width: 100%; min-height: 3.25rem; padding: .8rem 3.35rem .8rem 1rem;
    border-radius: .5rem; border: 1px solid var(--line-strong);
    background: var(--elev);
    color: var(--fg); font-size: 1rem; font-family: inherit; outline: none;
    transition: border-color .2s ease, box-shadow .2s ease, background-color .2s ease;
  }
  input::placeholder { color: var(--muted); opacity: 1; }
  input[type=password]:focus, input[type=text]:focus {
    border-color: var(--accent);
    background: color-mix(in srgb, var(--elev) 82%, var(--accent));
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 16%, transparent);
  }
  .password-toggle {
    position: absolute; top: 50%; right: .25rem; translate: 0 -50%;
    width: 2.75rem; height: 2.75rem; margin: 0; padding: 0;
    display: grid; place-items: center; border: 0; border-radius: .45rem;
    background: transparent; color: var(--muted); cursor: pointer;
    transition: color .18s ease, background-color .18s ease;
  }
  .password-toggle:hover {
    background: color-mix(in srgb, var(--fg) 7%, transparent);
    color: var(--fg);
  }
  .password-toggle svg {
    width: 1.25rem; height: 1.25rem; overflow: visible;
    transition: transform .28s cubic-bezier(.22,1,.36,1);
  }
  .password-toggle .eye-open,
  .password-toggle .eye-pupil,
  .password-toggle .eye-closed {
    transform-origin: center;
    transition: opacity .18s ease, transform .28s cubic-bezier(.22,1,.36,1);
  }
  .password-toggle .eye-closed { opacity: 0; transform: scaleX(.65); }
  .password-toggle[aria-pressed="true"] svg { transform: rotate(-4deg); }
  .password-toggle[aria-pressed="true"] .eye-open,
  .password-toggle[aria-pressed="true"] .eye-pupil {
    opacity: 0; transform: scaleY(.15);
  }
  .password-toggle[aria-pressed="true"] .eye-closed {
    opacity: 1; transform: scaleX(1);
  }
  .submit {
    min-height: 3.25rem; padding: .8rem 1rem; border: 0; border-radius: .5rem;
    background: var(--accent); color: var(--bg); font-family: inherit;
    font-size: .95rem; font-weight: 600; cursor: pointer;
    transition: background-color .2s ease, transform .12s ease, opacity .2s ease;
  }
  .submit:hover { background: color-mix(in srgb, var(--accent) 88%, #f6f0e6); }
  .submit:active { transform: translateY(1px); }
  .submit:disabled { cursor: wait; opacity: .82; }
  .loading { display: none; align-items: center; justify-content: center; gap: .28rem; }
  .loading i {
    width: .26rem; height: .26rem; border-radius: 50%; background: currentColor;
    animation: loading-dot .8s ease-in-out infinite alternate;
  }
  .loading i:nth-child(2) { animation-delay: .13s; }
  .loading i:nth-child(3) { animation-delay: .26s; }
  .submit[data-loading="true"] .button-label { display: none; }
  .submit[data-loading="true"] .loading { display: flex; }
  @keyframes loading-dot { to { opacity: .32; transform: translateY(-.16rem); } }
  button:focus-visible, input:focus-visible {
    outline: 2px solid var(--accent); outline-offset: 3px;
  }
  .error {
    margin: .15rem 0 .1rem; color: var(--danger); font-size: .82rem;
  }
  .error[hidden] { display: none; }
  @media (prefers-reduced-motion: reduce) {
    main,
    .password-toggle,
    .password-toggle svg,
    .password-toggle .eye-open,
    .password-toggle .eye-pupil,
    .password-toggle .eye-closed { transition: none; }
    .loading i { animation: none; }
  }
</style>
</head>
<body>
  <main>
    <div class="brand">fhd.xyz</div>
    <h1>Private portfolio</h1>
    <form method="POST" action="/__auth">
      <input type="hidden" name="next" value="${esc(nextPath)}" />
      <label class="sr-only" for="pw">Password</label>
      <div class="password-field">
        <input id="pw" name="password" type="password" required autofocus
               autocomplete="current-password" spellcheck="false" placeholder="Password" />
        <button class="password-toggle" type="button" aria-label="Show password"
                aria-controls="pw" aria-pressed="false">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"
               aria-hidden="true">
            <path class="eye-open" d="M2.5 12s3.4-5.25 9.5-5.25S21.5 12 21.5 12 18.1 17.25 12 17.25 2.5 12 2.5 12Z" />
            <circle class="eye-pupil" cx="12" cy="12" r="2.35" />
            <path class="eye-closed" d="M4 9.5c2.1 2.05 4.75 3.05 8 3.05s5.9-1 8-3.05M7 12l-1.25 2M12 12.55V15M17 12l1.25 2" />
          </svg>
        </button>
      </div>
      <p class="error" id="auth-error" role="alert"${error ? '' : ' hidden'}>Wrong password. Try again.</p>
      <button class="submit" type="submit">
        <span class="button-label">Enter</span>
        <span class="loading" aria-hidden="true"><i></i><i></i><i></i></span>
      </button>
    </form>
  </main>
  <script>
    const passwordInput = document.getElementById('pw');
    const passwordToggle = document.querySelector('.password-toggle');
    const form = document.querySelector('form');
    const submit = document.querySelector('.submit');
    const authError = document.getElementById('auth-error');

    passwordToggle?.addEventListener('click', () => {
      const willShow = passwordInput?.type === 'password';
      if (!passwordInput) return;

      passwordInput.type = willShow ? 'text' : 'password';
      passwordToggle.setAttribute('aria-pressed', String(willShow));
      passwordToggle.setAttribute('aria-label', willShow ? 'Hide password' : 'Show password');
      passwordInput.focus({ preventScroll: true });
    });

    form?.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!submit || !passwordInput) return;

      authError?.setAttribute('hidden', '');
      submit.disabled = true;
      submit.dataset.loading = 'true';
      submit.setAttribute('aria-label', 'Checking password');
      const startedAt = Date.now();

      try {
        const response = await fetch('/__auth', {
          method: 'POST',
          body: new FormData(form),
          headers: { 'x-folio-password': passwordInput.value },
          credentials: 'same-origin',
        });
        const remaining = Math.max(0, 850 - (Date.now() - startedAt));
        await new Promise((resolve) => setTimeout(resolve, remaining));

        if (!response.ok) {
          authError?.removeAttribute('hidden');
          passwordInput.select();
          return;
        }

        try { sessionStorage.setItem('folio-entry', '1'); } catch (error) {}
        document.body.classList.add('is-unlocking');
        await new Promise((resolve) => setTimeout(resolve, 280));
        const destination = new FormData(form).get('next');
        window.location.assign(typeof destination === 'string' ? destination : '/');
      } catch (error) {
        authError.textContent = 'Unable to connect. Try again.';
        authError.removeAttribute('hidden');
      } finally {
        submit.disabled = false;
        submit.dataset.loading = 'false';
        submit.removeAttribute('aria-label');
      }
    });
  </script>
</body>
</html>`;
}
