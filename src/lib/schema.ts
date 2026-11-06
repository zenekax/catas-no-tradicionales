// Datos estructurados (schema.org) para que Google entienda el negocio y las fechas.
import site from '../data/site.json';
import { type Cata, estadoEfectivo, inicioISO } from './events';

export function schemaOrganizacion() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${site.url}/#negocio`,
    name: site.nombre,
    alternateName: site.nombreCorto,
    description: 'Catas a ciegas de clásicos argentinos (alfajores, medialunas, sándwiches de miga, chipá, churros, empanadas) en Buenos Aires.',
    url: site.url,
    image: `${site.url}/og.jpg`,
    telephone: `+${site.whatsapp}`,
    areaServed: { '@type': 'City', name: 'Ciudad Autónoma de Buenos Aires' },
    address: { '@type': 'PostalAddress', addressLocality: 'Ciudad Autónoma de Buenos Aires', addressCountry: 'AR' },
    sameAs: [`https://instagram.com/${site.instagram}`],
  };
}

const disponibilidad = {
  abierto: 'https://schema.org/InStock',
  'ultimos-lugares': 'https://schema.org/LimitedAvailability',
  agotado: 'https://schema.org/SoldOut',
  proximamente: 'https://schema.org/PreOrder',
} as const;

export function schemaEventos(catas: Cata[]) {
  return catas.map((c) => {
    const inicio = new Date(inicioISO(c));
    const fin = new Date(inicio.getTime() + 2 * 60 * 60 * 1000); // las catas duran unas 2 horas
    const evento: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: `${c.tipo} a ciegas en ${c.barrio}`,
      description: `${c.tipo} a ciegas: probá sin ver la marca, elegí tu favorito y descubrí cuál era cuál. Grupo reducido de hasta ${c.cupos_totales} personas.`,
      startDate: inicioISO(c),
      endDate: fin.toISOString(),
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      location: {
        '@type': 'Place',
        name: `${c.barrio}, CABA`,
        address: { '@type': 'PostalAddress', addressLocality: `${c.barrio}, Ciudad Autónoma de Buenos Aires`, addressCountry: 'AR' },
      },
      image: [`${site.url}/og.jpg`],
      organizer: { '@id': `${site.url}/#negocio`, '@type': 'Organization', name: site.nombre, url: site.url },
      url: `${site.url}/#fechas`,
    };
    const offer: Record<string, unknown> = {
      '@type': 'Offer',
      url: c.link_mercadopago || `${site.url}/#fechas`,
      availability: disponibilidad[estadoEfectivo(c)],
      priceCurrency: 'ARS',
    };
    if (c.precio != null) offer.price = c.precio;
    evento.offers = offer;
    return evento;
  });
}

export function schemaPreguntas(items: { pregunta: string; respuesta: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    // Las respuestas con TODO no se publican en el schema.
    mainEntity: items
      .filter((i) => !i.respuesta.includes('TODO'))
      .map((i) => ({ '@type': 'Question', name: i.pregunta, acceptedAnswer: { '@type': 'Answer', text: i.respuesta } })),
  };
}
