import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://catasnotradicionales.com',
  trailingSlash: 'never',
  // CSS dentro del HTML: evita una petición que bloquea el primer render en celulares
  // format 'file' → /empresas.html, así Netlify sirve /empresas sin redirigir a /empresas/
  build: { inlineStylesheets: 'always', format: 'file' },
  integrations: [react(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
