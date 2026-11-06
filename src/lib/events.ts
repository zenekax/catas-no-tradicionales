import eventosJson from '../data/events.json';
import site from '../data/site.json';
import { catasDesdePlanilla } from './planilla';

export type Estado = 'abierto' | 'ultimos-lugares' | 'agotado' | 'proximamente';

export interface Cata {
  id: string;
  tipo: string;
  fecha: string; // YYYY-MM-DD
  hora: string; // HH:MM
  barrio: string;
  lugar: string;
  cupos_totales: number;
  cupos_disponibles: number;
  precio: number | null;
  link_mercadopago: string;
  estado: Estado;
}

export const ULTIMOS_LUGARES_UMBRAL = 3;

/** Inicio de la cata como ISO con huso de Buenos Aires (UTC-3, sin horario de verano). */
export function inicioISO(c: Cata): string {
  return `${c.fecha}T${c.hora || '00:00'}:00-03:00`;
}

/**
 * Estado que se muestra. Luciana puede escribir "abierto" y olvidarse:
 * si los cupos llegan a 0 pasa a "agotado", y si quedan pocos a "ultimos-lugares".
 * "proximamente" y "agotado" escritos a mano siempre se respetan.
 */
export function estadoEfectivo(c: Cata): Estado {
  if (c.estado === 'proximamente' || c.estado === 'agotado') return c.estado;
  if (c.cupos_disponibles <= 0) return 'agotado';
  if (c.cupos_disponibles <= ULTIMOS_LUGARES_UMBRAL) return 'ultimos-lugares';
  return c.estado;
}

// Fuente de las fechas: la planilla de Google Sheets si GOOGLE_SHEET_ID está definido; si no, events.json.
const sheetId = import.meta.env.GOOGLE_SHEET_ID?.trim();
const todasLasCatas: Cata[] = sheetId ? await catasDesdePlanilla(sheetId) : (eventosJson as Cata[]);

/** Catas futuras ordenadas por fecha. En el navegador se vuelve a filtrar por si el sitio no se reconstruyó. */
export function proximasCatas(now = new Date()): Cata[] {
  return todasLasCatas
    .filter((c) => new Date(inicioISO(c)).getTime() > now.getTime())
    .sort((a, b) => inicioISO(a).localeCompare(inicioISO(b)));
}

const tz = 'America/Argentina/Buenos_Aires';

/** "sáb 25 de octubre" */
export function fechaLarga(c: Cata): string {
  return new Intl.DateTimeFormat('es-AR', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    timeZone: tz,
  }).format(new Date(inicioISO(c)));
}

/** "25/10" — para el mensaje de WhatsApp */
export function fechaCorta(c: Cata): string {
  const [, m, d] = c.fecha.split('-');
  return `${Number(d)}/${Number(m)}`;
}

export function precioTexto(c: Cata): string {
  if (c.precio == null) return 'Consultá el valor';
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(c.precio);
}

/** Nombre en minúscula para frases: "Cata de alfajores" → "cata de alfajores" */
function enFrase(tipo: string): string {
  return tipo.charAt(0).toLowerCase() + tipo.slice(1);
}

export function whatsappUrl(texto: string): string {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(texto)}`;
}

export function mensajeReserva(c: Cata): string {
  return `Hola! Quiero reservar para la ${enFrase(c.tipo)} del ${fechaCorta(c)} (${c.barrio}).`;
}

export function mensajeListaEspera(c: Cata): string {
  return `Hola! Vi que la ${enFrase(c.tipo)} del ${fechaCorta(c)} está agotada. ¿Me anotan en lista de espera?`;
}

export function mensajeProximamente(c: Cata): string {
  return `Hola! Quiero que me avisen cuando abran la ${enFrase(c.tipo)} del ${fechaCorta(c)}.`;
}
