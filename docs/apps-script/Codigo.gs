/**
 * Catas No Tradicionales — panel de fechas en Google Sheets.
 *
 * Se pega en la planilla: Extensiones → Apps Script → reemplazar todo por este código → Guardar.
 * Después, una sola vez: elegir la función "configurar" arriba y tocar ▶ Ejecutar (pide permisos).
 *
 * IMPORTANTE: pegá abajo la URL del "Deploy Hook" de Cloudflare (Workers & Pages → catasnotradicionales →
 * Settings → Builds → Deploy Hooks). No la subas a GitHub.
 */
const BUILD_HOOK = 'PEGAR_ACA_LA_URL_DEL_DEPLOY_HOOK_DE_CLOUDFLARE';
const WEB = 'https://catasnotradicionales.com';

const COLUMNAS = ['Producto', 'Fecha', 'Hora', 'Barrio', 'Cupos totales', 'Cupos libres', 'Precio', 'Link de Mercado Pago', 'Estado'];
const ESTADOS = ['Abierto', 'Últimos lugares', 'Agotado', 'Próximamente', 'Oculto'];
const PRODUCTOS = ['Alfajores', 'Medialunas', 'Sándwiches de miga', 'Chipá clásico', 'Chipá saborizados', 'Churros', 'Empanadas regionales', 'Frambuesas bañadas en chocolate', 'Dulce de leche', 'Helados'];

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🍫 Web')
    .addItem('Publicar en la web', 'publicar')
    .addItem('Revisar si hay errores', 'revisar')
    .addSeparator()
    .addItem('Abrir la web', 'abrirWeb')
    .addToUi();
}

/** Deja la planilla lista: formatos, listas desplegables y colores. Se corre UNA vez. */
function configurar() {
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  libro.setSpreadsheetLocale('es_AR');
  libro.setSpreadsheetTimeZone('America/Argentina/Buenos_Aires');

  const hoja = libro.getSheets()[0]; // la web lee siempre la PRIMERA hoja
  hoja.setName('Fechas');

  // Encabezado
  hoja.getRange(1, 1, 1, COLUMNAS.length).setValues([COLUMNAS])
    .setFontWeight('bold').setBackground('#2e2017').setFontColor('#f4ebdd').setVerticalAlignment('middle');
  hoja.setRowHeight(1, 36);
  hoja.setFrozenRows(1);

  // Datos de ejemplo cargados con fechas "de verdad" (evita confusiones día/mes al importar)
  if (!PropertiesService.getDocumentProperties().getProperty('configurada')) {
    hoja.getRange(2, 1, Math.max(hoja.getMaxRows() - 1, 1), COLUMNAS.length).clearContent();
    hoja.getRange(2, 1, 4, COLUMNAS.length).setValues([
      ['Alfajores', new Date(2026, 9, 25), '16:30', 'Almagro', 12, 7, '', '', 'Abierto'],
      ['Medialunas', new Date(2026, 10, 1), '10:30', 'Caballito', 12, 2, 25000, '', 'Últimos lugares'],
      ['Sándwiches de miga', new Date(2026, 10, 8), '17:00', 'Colegiales', 16, 0, '', '', 'Agotado'],
      ['Dulce de leche', new Date(2026, 10, 22), '16:00', 'Almagro', 12, 12, '', '', 'Próximamente'],
    ]);
  }

  const filas = 200;
  const col = (n) => hoja.getRange(2, n, filas, 1);

  col(1).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(PRODUCTOS, true).setAllowInvalid(true)
    .setHelpText('Elegí de la lista o escribí otro producto.').build());
  col(2).setNumberFormat('dd/mm/yyyy').setDataValidation(SpreadsheetApp.newDataValidation().requireDate().setAllowInvalid(false)
    .setHelpText('Fecha en formato día/mes/año, por ejemplo 25/10/2026.').build());
  col(3).setNumberFormat('HH:mm').setHorizontalAlignment('center');
  [5, 6].forEach((n) => col(n).setNumberFormat('0').setHorizontalAlignment('center')
    .setDataValidation(SpreadsheetApp.newDataValidation().requireNumberGreaterThanOrEqualTo(0).setAllowInvalid(false)
      .setHelpText('Un número, por ejemplo 12.').build()));
  col(7).setNumberFormat('"$" #,##0');
  col(9).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(ESTADOS, true).setAllowInvalid(false).build());

  // Colores según el estado
  const rangoFilas = hoja.getRange(2, 1, filas, COLUMNAS.length);
  const regla = (texto, fondo) => SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied(`=$I2="${texto}"`).setBackground(fondo).setRanges([rangoFilas]).build();
  hoja.setConditionalFormatRules([
    regla('Abierto', '#e3f0dc'), regla('Últimos lugares', '#fde3d6'), regla('Agotado', '#e6e0da'),
    regla('Próximamente', '#f8ecd8'), regla('Oculto', '#f1f1f1'),
  ]);

  [150, 110, 70, 130, 110, 100, 100, 260, 140].forEach((w, i) => hoja.setColumnWidth(i + 1, w));

  PropertiesService.getDocumentProperties().setProperty('configurada', 'si');
  SpreadsheetApp.getUi().alert('Listo ✅ La planilla quedó configurada. Recargá la página para ver el menú "🍫 Web".');
}

/** Revisa las filas y devuelve la lista de problemas (vacía si está todo bien). */
function problemas_() {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  const datos = hoja.getDataRange().getValues();
  const errores = [];
  let publicables = 0;
  datos.slice(1).forEach((f, i) => {
    if (f.every((c) => c === '' || c === null)) return;
    const n = i + 2;
    const [producto, fecha, hora, barrio, totales, libres, , link, estado] = f;
    const p = [];
    if (!producto) p.push('falta el producto');
    if (!(fecha instanceof Date)) p.push('la fecha no es válida');
    if (hora === '' || hora === null) p.push('falta la hora');
    if (!barrio) p.push('falta el barrio');
    if (totales === '' || isNaN(totales)) p.push('faltan los cupos totales');
    if (libres === '' || isNaN(libres)) p.push('faltan los cupos libres');
    if (Number(libres) > Number(totales)) p.push('hay más cupos libres que totales');
    if (link && !String(link).startsWith('https://')) p.push('el link de Mercado Pago tiene que empezar con https://');
    if (ESTADOS.indexOf(estado) < 0) p.push('elegí un estado de la lista');
    if (p.length) errores.push(`Fila ${n}: ${p.join(', ')}`);
    else if (estado !== 'Oculto') publicables++;
  });
  return { errores, publicables };
}

function revisar() {
  const { errores, publicables } = problemas_();
  SpreadsheetApp.getUi().alert(errores.length
    ? `Hay que corregir esto antes de publicar:\n\n${errores.join('\n')}`
    : `Todo bien 👌 Hay ${publicables} fechas para mostrar en la web.`);
}

function publicar() {
  const ui = SpreadsheetApp.getUi();
  const { errores, publicables } = problemas_();
  if (errores.length) {
    ui.alert(`No publiqué nada porque hay que corregir esto:\n\n${errores.join('\n')}`);
    return;
  }
  const ok = ui.alert('Publicar en la web', `Se van a mostrar ${publicables} fechas. ¿Publicamos?`, ui.ButtonSet.YES_NO);
  if (ok !== ui.Button.YES) return;

  SpreadsheetApp.flush();
  const r = UrlFetchApp.fetch(BUILD_HOOK, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({}),
    muteHttpExceptions: true,
  });
  if (r.getResponseCode() >= 200 && r.getResponseCode() < 300) {
    ui.alert('¡Listo! 🎉 En 1 o 2 minutos los cambios se ven en ' + WEB + '\n\n(Si no los ves, recargá la página.)');
  } else {
    ui.alert('Uy, algo falló al publicar (código ' + r.getResponseCode() + '). Avisale a Nacho.');
  }
}

function abrirWeb() {
  const html = HtmlService.createHtmlOutput(`<script>window.open('${WEB}','_blank');google.script.host.close();</script>`);
  SpreadsheetApp.getUi().showModalDialog(html, 'Abriendo la web…');
}

/* ------------------------------------------------------------------
 * Formulario de /empresas: recibe la consulta, la guarda en la hoja "Consultas"
 * y manda un mail. Se publica como Aplicación web (Implementar → Nueva implementación).
 * ------------------------------------------------------------------ */
const ID_PLANILLA = 'PEGAR_ACA_EL_ID_DE_LA_PLANILLA';
const AVISAR_A = ['PEGAR_ACA_MAIL_1', 'PEGAR_ACA_MAIL_2'];

function doPost(e) {
  const salida = (ok) => ContentService.createTextOutput(JSON.stringify({ ok })).setMimeType(ContentService.MimeType.JSON);
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const d = JSON.parse(e.postData.contents);
    if (d.bot) return salida(true); // trampa para robots: se ignora en silencio
    const corto = (v, n) => String(v == null ? '' : v).slice(0, n);
    const fila = [
      new Date(), corto(d.empresa, 120), corto(d.nombre, 120), corto(d.personas, 10), corto(d.fecha, 120),
      corto(d.modalidad, 60), corto(d.email, 120), corto(d.telefono, 60), corto(d.mensaje, 1500), corto(d.utm, 200),
    ];
    if (!fila[1] || !fila[2]) return salida(false);

    const libro = SpreadsheetApp.openById(ID_PLANILLA);
    let hoja = libro.getSheetByName('Consultas');
    if (!hoja) {
      hoja = libro.insertSheet('Consultas'); // queda DESPUÉS de "Fechas": la web lee siempre la primera hoja
      hoja.appendRow(['Recibida', 'Empresa', 'Nombre', 'Personas', 'Fecha tentativa', 'Modalidad', 'Email', 'Teléfono', 'Mensaje', 'Campaña']);
      hoja.getRange(1, 1, 1, 10).setFontWeight('bold').setBackground('#2e2017').setFontColor('#f4ebdd');
      hoja.setFrozenRows(1);
    }
    hoja.appendRow(fila);

    MailApp.sendEmail({
      to: AVISAR_A.join(','),
      subject: `Nueva consulta de empresa: ${fila[1]} (${fila[3]} personas)`,
      body: [
        'Llegó una consulta desde catasnotradicionales.com/empresas', '',
        `Empresa: ${fila[1]}`, `Nombre: ${fila[2]}`, `Personas: ${fila[3]}`, `Fecha tentativa: ${fila[4]}`,
        `Modalidad: ${fila[5]}`, `Email: ${fila[6]}`, `Teléfono: ${fila[7]}`, `Mensaje: ${fila[8]}`, '',
        fila[9] ? `Campaña: ${fila[9]}` : '', '', 'Está guardada en la planilla, hoja "Consultas".',
      ].join('\n'),
    });
    return salida(true);
  } catch (err) {
    return salida(false);
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}

/** Se corre UNA vez a mano para dar los permisos (planilla + mail) a la aplicación web del formulario. */
function autorizar() {
  SpreadsheetApp.openById(ID_PLANILLA).getName();
  MailApp.getRemainingDailyQuota();
  Logger.log('Permisos OK');
}
