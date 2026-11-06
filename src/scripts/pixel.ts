/**
 * Eventos del Meta Pixel. El Pixel sólo se carga si PUBLIC_META_PIXEL_ID está definido
 * (ver Base.astro). Si no está, window.fbq no existe y todo esto no hace nada.
 *
 * - ViewContent: una tarjeta de cata aparece en pantalla (una vez por cata)
 * - InitiateCheckout: click en "Reservar mi lugar"
 * - Contact: click en cualquier otro botón de WhatsApp
 * - Lead: envío del formulario de empresas (se dispara en empresas.astro)
 */
type Fbq = (accion: 'track', evento: string, datos?: Record<string, unknown>) => void;

export function track(evento: string, datos?: Record<string, unknown>) {
  const fbq = (window as unknown as { fbq?: Fbq }).fbq;
  if (typeof fbq === 'function') fbq('track', evento, datos);
}

export function iniciarPixel() {
  if (typeof (window as unknown as { fbq?: Fbq }).fbq !== 'function') return;

  // ViewContent por cada cata vista
  const vistas = new Set<string>();
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        const el = e.target as HTMLElement;
        const id = el.dataset.cata!;
        if (e.isIntersecting && !vistas.has(id)) {
          vistas.add(id);
          track('ViewContent', { content_name: id, content_type: 'product' });
          io.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    document.querySelectorAll<HTMLElement>('article[data-cata]').forEach((el) => io.observe(el));
  }

  // Clicks
  document.addEventListener('click', (e) => {
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[data-accion], a[href^="https://wa.me/"]');
    if (!a) return;
    const accion = a.dataset.accion ?? '';
    if (accion.startsWith('reservar')) {
      track('InitiateCheckout', { content_name: a.dataset.cata, content_category: accion });
    } else if (a.href.startsWith('https://wa.me/')) {
      track('Contact', { content_name: accion || 'whatsapp' });
    }
  });
}
