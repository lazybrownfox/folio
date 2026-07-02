# Astro Starter Kit: Minimal

```sh
npm create astro@latest -- --template minimal
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
├── src/
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 🔒 Password protection

The site can be gated behind a single shared password by a Vercel Edge Middleware
(`middleware.ts` at the repo root). It runs at the edge before anything is served,
so the site stays 100% static/CDN behind the gate — the password is checked at the
edge and never reaches the client. Visitors get an on-brand `/login` page; a valid
password sets a signed (HMAC-SHA256), HttpOnly session cookie that lasts 30 days.

**This is a Vercel platform middleware, not Astro's `src/middleware.ts`.** It is
compiled by Vercel at deploy time and is not part of `astro build`.

### Enabling it

Set the environment variable in **Vercel → Project → Settings → Environment
Variables** (choose the environments to protect — e.g. Production and/or Preview):

| Variable        | Required | Purpose                                                              |
| :-------------- | :------- | :------------------------------------------------------------------ |
| `SITE_PASSWORD` | yes      | The shared password visitors must enter.                            |
| `AUTH_SECRET`   | no       | Random string used to sign the session cookie. Defaults to `SITE_PASSWORD` if unset. |

The gate is **opt-in and fails open**: with no `SITE_PASSWORD` set, the site stays
public (so a forgotten env var can never lock you out). Changing `SITE_PASSWORD`
(or `AUTH_SECRET`) invalidates all existing sessions.

- Log out: visit `/__logout`.
- Local: `SITE_PASSWORD` only applies under `vercel dev` (edge middleware); plain
  `astro dev` does not run it, so the local dev site is never gated.

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
