// Worker mínimo: sirve el sitio estático y hace dos redirecciones.
//  - http  → https
//  - www.catasnotradicionales.com → catasnotradicionales.com
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    let cambio = false;
    if (url.protocol === 'http:') { url.protocol = 'https:'; cambio = true; }
    if (url.hostname.startsWith('www.')) { url.hostname = url.hostname.slice(4); cambio = true; }
    if (cambio) return Response.redirect(url.toString(), 301);
    return env.ASSETS.fetch(request);
  },
};
