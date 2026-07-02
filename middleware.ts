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
    const provided = String(form.get('password') ?? '');
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
<title>Private — François-Henri Dupuich</title>
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Rethink+Sans:wght@400;500;700&family=JetBrains+Mono:wght@400;500&display=swap" />
<style>
  :root {
    --bg: #0b0e12; --elev: #12161c; --fg: #e7ecf1; --muted: #8a95a3;
    --faint: #5b6573; --accent: #46e0b0; --accent-dim: #2a8d6f;
    --line: rgba(231,236,241,.08); --line-strong: rgba(231,236,241,.16);
    color-scheme: dark;
  }
  * { box-sizing: border-box; }
  html, body { height: 100%; }
  body {
    margin: 0; background: var(--bg); color: var(--fg);
    font-family: "Rethink Sans", ui-sans-serif, system-ui, -apple-system, sans-serif;
    -webkit-font-smoothing: antialiased; line-height: 1.5;
    display: grid; place-items: center; padding: 1.5rem;
    background-image:
      radial-gradient(60rem 40rem at 50% -10%, rgba(70,224,176,.06), transparent 60%);
  }
  ::selection { background: var(--accent); color: var(--bg); }
  main {
    width: min(100%, 27rem);
    border: 1px solid var(--line-strong); border-radius: .9rem;
    background: color-mix(in srgb, var(--elev) 80%, transparent);
    padding: clamp(1.5rem, 4vw, 2.25rem);
    box-shadow: 0 2rem 6rem rgba(0,0,0,.5);
  }
  .kicker {
    font-family: "JetBrains Mono", ui-monospace, monospace;
    font-size: .72rem; letter-spacing: .12em; text-transform: uppercase;
    color: var(--accent); display: flex; align-items: center; gap: .5rem;
  }
  .kicker::before {
    content: ""; width: .5rem; height: .5rem; border-radius: 50%;
    background: var(--accent); box-shadow: 0 0 .6rem var(--accent);
  }
  h1 { margin: 1rem 0 .3rem; font-size: 1.5rem; font-weight: 700; letter-spacing: -.01em; }
  p.role {
    margin: 0 0 1.05rem; font-family: "JetBrains Mono", ui-monospace, monospace;
    font-size: .72rem; letter-spacing: .03em; color: var(--faint);
  }
  p.sub { margin: 0 0 1.5rem; color: var(--muted); font-size: .95rem; }
  form { display: grid; gap: .75rem; }
  label {
    font-family: "JetBrains Mono", ui-monospace, monospace;
    font-size: .68rem; letter-spacing: .08em; text-transform: uppercase; color: var(--faint);
  }
  input[type=password] {
    width: 100%; padding: .8rem .9rem; border-radius: .55rem;
    border: 1px solid var(--line-strong); background: rgba(0,0,0,.25);
    color: var(--fg); font-size: 1rem; font-family: inherit; outline: none;
    transition: border-color .2s ease, box-shadow .2s ease;
  }
  input[type=password]:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 22%, transparent);
  }
  button {
    margin-top: .25rem; padding: .8rem 1rem; border: 0; border-radius: .55rem;
    background: var(--accent); color: var(--bg); font-family: inherit;
    font-size: .95rem; font-weight: 700; cursor: pointer;
    transition: background-color .2s ease, transform .05s ease;
  }
  button:hover { background: color-mix(in srgb, var(--accent) 88%, #fff); }
  button:active { transform: translateY(1px); }
  button:focus-visible, input:focus-visible {
    outline: 2px solid var(--accent); outline-offset: 3px;
  }
  .error {
    margin: 0; padding: .6rem .8rem; border-radius: .5rem;
    border: 1px solid color-mix(in srgb, #ff6b6b 40%, var(--line-strong));
    background: color-mix(in srgb, #ff6b6b 10%, transparent);
    color: #ffb4b4; font-size: .85rem;
  }
  footer {
    margin-top: 1.5rem; color: var(--faint); font-size: .75rem;
    font-family: "JetBrains Mono", ui-monospace, monospace; letter-spacing: .03em;
  }
</style>
</head>
<body>
  <main>
    <div class="kicker">Private</div>
    <h1>François-Henri Dupuich</h1>
    <p class="role">Product Designer · AI-native / dOps</p>
    <p class="sub">Private portfolio. Enter the password to continue.</p>
    <form method="POST" action="/__auth" autocomplete="off">
      <input type="hidden" name="next" value="${esc(nextPath)}" />
      ${error ? '<p class="error">Wrong password — try again.</p>' : ''}
      <label for="pw">Password</label>
      <input id="pw" name="password" type="password" required autofocus
             autocomplete="current-password" spellcheck="false" />
      <button type="submit">Enter</button>
    </form>
    <footer>// access on request</footer>
  </main>
</body>
</html>`;
}
