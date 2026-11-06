# Catas No Tradicionales

Sitio web de una experiencia social de **catas a ciegas** de comidas clásicas argentinas (alfajores, medialunas, empanadas, sándwiches de miga…) en Buenos Aires. Grupos chicos prueban el mismo producto de distintas marcas con los ojos tapados, puntúan, y al final se revela cuál era cuál.

🔗 **En producción:** [catasnotradicionales.com](https://catasnotradicionales.com)

## El problema

El negocio vende por Instagram y Meta Ads: tráfico frío, más del 90 % desde celular y muchas veces dentro del navegador in-app de Instagram. La anfitriona **no es técnica** y necesita publicar fechas sin tocar código.

El sitio tiene un solo objetivo: convertir ese tráfico en reservas y captar consultas de empresas (team building).

## Decisiones técnicas

| Decisión | Por qué |
|---|---|
| **Astro estático + islas de React** | Carga rápida en celular. Solo se hidrata lo animado. |
| **Fechas en una Google Sheet** | La anfitriona las edita en una planilla y publica con un botón. No hay panel de administración que mantener. |
| **El build falla si la planilla tiene datos rotos** | El sitio nunca muestra datos corruptos: queda la versión anterior. |
| **Cloudflare Workers con assets estáticos** | Hosting, dominio y DNS en un solo lugar. Un `git push` publica. |
| **Reserva por Mercado Pago o WhatsApp** | Si hay link de pago, va al pago. Si no, abre WhatsApp con el mensaje ya armado (cata, fecha, barrio). |
| **Atribución con UTM** | Los `utm_*` se guardan en `sessionStorage` y viajan en el mensaje de WhatsApp, para saber qué anuncio trajo cada reserva. Todo con `try/catch` porque el navegador de Instagram a veces bloquea el storage. |
| **Formulario B2B sin backend propio** | Un Google Apps Script recibe la consulta, la guarda en una hoja y avisa por mail. Tiene honeypot anti-spam, topes de largo y `LockService`. |

## Cómo funciona

```
Google Sheet (fechas)  ──botón "Publicar"──▶  Deploy Hook  ──▶  Build (Astro)  ──▶  Cloudflare Workers
        ▲                                                           │
   la anfitriona edita                                   valida datos; si fallan,
                                                          no se publica nada
```

- **Estados automáticos:** sin cupos → agotado; 3 o menos → últimos lugares. Las fechas pasadas desaparecen solas, al construir y también en el navegador.
- **Eventos del Pixel de Meta:** `ViewContent`, `InitiateCheckout`, `Contact` y `Lead`. Sin la variable de entorno el Pixel no se carga.
- **Worker mínimo:** sirve el sitio y hace dos redirecciones (http → https, www → raíz).

## Stack

Astro · Tailwind 4 · React 19 (islas) · [React Bits](https://reactbits.dev) · `motion` · `ogl` · Cloudflare Workers · Google Apps Script

Fuentes: Instrument Serif e Inter Tight. Requiere Node 22.12 o superior.

## Correrlo localmente

```bash
npm install
cp .env.example .env
npm run dev      # http://localhost:4321
npm run build    # genera /dist
```

Sin `GOOGLE_SHEET_ID` usa `src/data/events.json` como fallback local.

## Estructura

| Qué | Dónde |
|---|---|
| Páginas (inicio, empresas, regala, términos, privacidad) | `src/pages/` |
| Lectura y validación de la planilla | `src/lib/planilla.ts`, `src/lib/schema.ts` |
| Estados, fechas y links de WhatsApp | `src/lib/events.ts` |
| Componentes animados adaptados de React Bits | `src/components/reactbits/` |
| Envoltorios con la marca | `src/components/islas/` |
| Script del formulario y la planilla | `docs/apps-script/Codigo.gs` |
| Worker de Cloudflare | `worker/index.js` |
| Deploy y dominio | `docs/DEPLOY.md`, `docs/DOMINIO.md` |

## Variables de entorno

Ver `.env.example`: `GOOGLE_SHEET_ID`, `PUBLIC_META_PIXEL_ID`, `PUBLIC_FORM_URL`.

## Resultados de rendimiento

Lighthouse mobile sobre el dominio real: rendimiento 90–96, accesibilidad 100, SEO 100.

---

Hecho por [Ignacio Basso](https://github.com/zenekax)
