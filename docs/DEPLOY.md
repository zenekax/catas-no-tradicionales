# Cómo se publica el sitio

- **Hosting:** Cloudflare Workers (archivos estáticos). Worker `catasnotradicionales`.
- **Publicación automática:** cada `git push` a `main` dispara un build en Cloudflare (Workers Builds).
- **Botón "Publicar" de la planilla:** llama a un *Deploy Hook* de Cloudflare (Worker → Settings → Builds → Deploy Hooks).
- **Variables de build** (Worker → Settings → Builds → Variables and secrets):
  `GOOGLE_SHEET_ID`, `PUBLIC_META_PIXEL_ID`, `PUBLIC_FORM_URL`, `NODE_VERSION=22`.
- **Formulario de /empresas:** envía a una aplicación web de Google Apps Script que guarda la consulta
  en la hoja "Consultas" de la planilla y manda un mail (ver `docs/apps-script/Codigo.gs`).
- **Publicar a mano desde la compu:** `npm run build && npx wrangler deploy`.
- Netlify ya no se usa (queda `docs/netlify.toml.viejo` solo como referencia).
