// @ts-check
// Local-only config for content editing: `npm run cms` loads this instead of
// astro.config.mjs. Keeping Keystatic entirely out of the main config avoids
// a build conflict — importing @keystatic/astro there (even unused/dev-only)
// was enough to break `astro build`'s Tailwind CSS resolution.
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import keystatic from '@keystatic/astro';

// https://astro.build/config
export default defineConfig({
  integrations: [react(), keystatic()],

  vite: {
    plugins: [tailwindcss()]
  }
});
