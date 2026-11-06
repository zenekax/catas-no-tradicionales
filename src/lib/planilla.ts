/**
 * Lee las fechas desde la planilla de Google Sheets que usa Luciana.
 *
 * - Si GOOGLE_SHEET_ID está definido, baja la primera hoja como CSV al construir el sitio.
 *   (La planilla tiene que estar compartida como "Cualquier persona con el enlace: lector".)
 * - Si hay un error en alguna fila, el build FALLA a propósito: Netlify deja publicada la
 *   versión anterior, así la web nunca muestra datos rotos.
 * - Si GOOGLE_SHEET_ID no está definido, se usa src/data/events.json (útil para desarrollo).
 */
import type { Cata, Estado } from './events';

const COLUMNAS = ['Producto', 'Fecha', 'Hora', 'Barrio', 'Cupos totales', 'Cupos libres', 'Precio', 'Link de Mercado Pago', 'Estado'] as const;

const ESTADOS: Record<string, Estado | 'oculto'> = {
  abierto: 'abierto',
  'ultimos lugares': 'ultimos-lugares',
  agotado: 'agotado',
  proximamente: 'proximamente',
  oculto: 'oculto',
};

const sinAcentos = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
const slug = (s: string) => sinAcentos(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** Parser CSV mínimo (soporta comillas y comas dentro de comillas). */
export function parsearCsv(texto: string): string[][] {
  const filas: string[][] = [];
  let fila: string[] = [];
  let campo = '';
  let comillas = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (comillas) {
      if (c === '"' && texto[i + 1] === '"') { campo += '"'; i++; }
      else if (c === '"') comillas = false;
      else campo += c;
    } else if (c === '"') comillas = true;
    else if (c === ',') { fila.push(campo); campo = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && texto[i + 1] === '\n') i++;
      fila.push(campo); filas.push(fila); fila = []; campo = '';
    } else campo += c;
  }
  if (campo || fila.length) { fila.push(campo); filas.push(fila); }
  return filas;
}

function fechaIso(valor: string): string | null {
  const v = valor.trim();
  let m = v.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
  m = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/); // dd/mm/aaaa
  if (m) {
    const anio = m[3].length === 2 ? `20${m[3]}` : m[3];
    const [d, mes] = [Number(m[1]), Number(m[2])];
    if (mes < 1 || mes > 12 || d < 1 || d > 31) return null;
    return `${anio}-${String(mes).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }
  return null;
}

function hora(valor: string): string | null {
  const m = valor.trim().match(/^(\d{1,2})[:.](\d{2})/);
  if (!m || Number(m[1]) > 23 || Number(m[2]) > 59) return null;
  return `${m[1].padStart(2, '0')}:${m[2]}`;
}

function entero(valor: string): number | null {
  // "$ 25.000,00" o "25,000.00" → 25000 (se descartan los centavos)
  const d = valor.trim().replace(/[.,]\d{1,2}$/, '').replace(/[^\d]/g, '');
  return d ? Number(d) : null;
}

/** Convierte las filas de la planilla en catas. Devuelve también los errores legibles por fila. */
export function filasACatas(filas: string[][]): { catas: Cata[]; errores: string[] } {
  const [encabezado, ...datos] = filas;
  const idx = Object.fromEntries(COLUMNAS.map((c) => [c, encabezado.findIndex((h) => sinAcentos(h) === sinAcentos(c))]));
  const faltan = COLUMNAS.filter((c) => idx[c] < 0);
  if (faltan.length) return { catas: [], errores: [`Faltan columnas en la planilla: ${faltan.join(', ')}`] };

  const catas: Cata[] = [];
  const errores: string[] = [];
  datos.forEach((f, i) => {
    const celda = (c: (typeof COLUMNAS)[number]) => (f[idx[c]] ?? '').trim();
    if (f.every((x) => !x.trim())) return; // fila vacía
    const n = i + 2; // número de fila como lo ve Luciana
    const producto = celda('Producto');
    const estado = ESTADOS[sinAcentos(celda('Estado'))];
    const fecha = fechaIso(celda('Fecha'));
    const h = hora(celda('Hora'));
    const totales = entero(celda('Cupos totales'));
    const libres = entero(celda('Cupos libres'));
    const link = celda('Link de Mercado Pago');

    const problemas = [
      !producto && 'falta el producto',
      !estado && `el estado "${celda('Estado')}" no es válido`,
      !fecha && `la fecha "${celda('Fecha')}" no se entiende (usá dd/mm/aaaa)`,
      !h && `la hora "${celda('Hora')}" no se entiende (usá 16:30)`,
      !celda('Barrio') && 'falta el barrio',
      totales == null && 'faltan los cupos totales',
      libres == null && 'faltan los cupos libres',
      link && !/^https:\/\//.test(link) && 'el link de Mercado Pago tiene que empezar con https://',
    ].filter(Boolean);
    if (problemas.length) { errores.push(`Fila ${n}: ${problemas.join('; ')}`); return; }
    if (estado === 'oculto') return;

    const tipo = sinAcentos(producto).startsWith('cata') ? producto : `Cata de ${producto.charAt(0).toLowerCase()}${producto.slice(1)}`;
    catas.push({
      id: `${slug(producto)}-${fecha}`,
      tipo,
      fecha: fecha!,
      hora: h!,
      barrio: celda('Barrio'),
      lugar: '',
      cupos_totales: totales!,
      cupos_disponibles: Math.min(libres!, totales!),
      precio: entero(celda('Precio')),
      link_mercadopago: link,
      estado: estado as Estado,
    });
  });
  return { catas, errores };
}

export async function catasDesdePlanilla(sheetId: string): Promise<Cata[]> {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
  const r = await fetch(url, { redirect: 'follow' });
  const texto = await r.text();
  if (!r.ok || texto.trimStart().startsWith('<')) {
    throw new Error(`[planilla] No pude leer la planilla (HTTP ${r.status}). ¿Está compartida como "Cualquier persona con el enlace"?`);
  }
  const { catas, errores } = filasACatas(parsearCsv(texto));
  if (errores.length) {
    throw new Error(`[planilla] Hay errores en la planilla, no se publica nada:\n  - ${errores.join('\n  - ')}`);
  }
  console.log(`[planilla] ${catas.length} fechas leídas de Google Sheets`);
  return catas;
}
