/**
 * Atribución de campañas.
 * 1) Guarda los parámetros utm_* con los que llegó la persona (dura lo que dura la pestaña).
 * 2) Al tocar cualquier link de WhatsApp, agrega al final del mensaje una referencia corta,
 *    ej. "(ref: instagram · cata-alfajores-oct)", para saber de qué campaña vino la reserva.
 * Todo con try/catch: el navegador de Instagram a veces bloquea sessionStorage.
 */
const CLAVES = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;
const STORAGE = 'cnt_utm';

type Utm = Partial<Record<(typeof CLAVES)[number], string>>;

function leerDeUrl(): Utm {
  const params = new URLSearchParams(location.search);
  const utm: Utm = {};
  for (const k of CLAVES) {
    const v = params.get(k);
    if (v) utm[k] = v.slice(0, 60);
  }
  return utm;
}

let memoria: Utm = {};

export function obtenerUtm(): Utm {
  return memoria;
}

export function referenciaUtm(): string {
  const u = memoria;
  const partes = [u.utm_source, u.utm_campaign, u.utm_content].filter(Boolean);
  return partes.length ? `(ref: ${partes.join(' · ')})` : '';
}

export function iniciarUtm() {
  const nuevos = leerDeUrl();
  try {
    if (Object.keys(nuevos).length) sessionStorage.setItem(STORAGE, JSON.stringify(nuevos));
    memoria = JSON.parse(sessionStorage.getItem(STORAGE) || '{}');
  } catch {
    memoria = nuevos;
  }
  if (!referenciaUtm()) return;

  // Se modifica el link recién al tocarlo, así el HTML queda limpio.
  document.addEventListener('click', (e) => {
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="https://wa.me/"]');
    if (!a || a.dataset.utm === '1') return;
    const url = new URL(a.href);
    const texto = url.searchParams.get('text') ?? '';
    // encodeURIComponent (y no searchParams.set) para que los espacios vayan como %20 y no como "+"
    a.href = `${url.origin}${url.pathname}?text=${encodeURIComponent(`${texto}\n\n${referenciaUtm()}`.trim())}`;
    a.dataset.utm = '1';
  }, { capture: true });
}
