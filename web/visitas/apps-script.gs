/**
 * Registro de visitas de la web de Smart Building Uruguay.
 * Va pegado en Extensiones → Apps Script de una planilla de Google.
 * Guarda cada evento en la hoja "eventos" y se lo devuelve al panel con la clave.
 *
 * CAMBIÁ ESTA CLAVE por una tuya (la misma que vas a poner en el panel).
 */
const CLAVE = 'cambiar-esta-clave';

const COLS = ['fecha', 'visitante', 'sesion', 'evento', 'detalle', 'modelo', 'valor',
  'origen', 'campana', 'dispositivo', 'ciudad', 'region', 'pais', 'pagina'];

function hoja_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName('eventos');
  if (!sh) {
    sh = ss.insertSheet('eventos');
    sh.appendRow(COLS);
    sh.setFrozenRows(1);
  }
  return sh;
}

// La web manda los eventos acá (POST, texto JSON). No devuelve nada útil.
function doPost(e) {
  try {
    const lote = JSON.parse(e.postData.contents);
    const evs = Array.isArray(lote) ? lote : [lote];
    const filas = evs.slice(0, 50).map(ev => COLS.map(c =>
      c === 'fecha' ? new Date() : String(ev[c] == null ? '' : ev[c]).slice(0, 300)));
    if (filas.length) {
      const sh = hoja_();
      sh.getRange(sh.getLastRow() + 1, 1, filas.length, COLS.length).setValues(filas);
    }
  } catch (err) {
    // queda anotado en la hoja "errores" para poder ver qué pasó
    console.error(err);
    try { const ss = SpreadsheetApp.getActiveSpreadsheet(); const h = ss.getSheetByName('errores') || ss.insertSheet('errores');
      h.appendRow([new Date(), String(err), String(e && e.postData && e.postData.contents || '').slice(0, 300)]); } catch (x) { }
  }
  return ContentService.createTextOutput('ok');
}

// El panel lee los eventos acá, con la clave. ?clave=...&dias=30
function doGet(e) {
  const p = e.parameter || {};
  if (p.clave !== CLAVE) {
    return ContentService.createTextOutput(JSON.stringify({ error: 'clave' }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  // diagnóstico: cuántas filas hay y las últimas, tal cual están en la planilla
  if (p.diag) {
    const ss = SpreadsheetApp.getActiveSpreadsheet(), sh = hoja_(), er = ss.getSheetByName('errores');
    const ult = (h, n) => { const r = h ? h.getLastRow() : 0; return r > 1 ? h.getRange(Math.max(2, r - n + 1), 1, Math.min(n, r - 1), h.getLastColumn()).getValues().map(f => f.map(String)) : [] };
    return ContentService.createTextOutput(JSON.stringify({ planilla: ss.getName(), hojas: ss.getSheets().map(h => h.getName()), filas: sh.getLastRow() - 1, ultimas: ult(sh, 3), errores: ult(er, 3), version: 2 }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  const dias = Math.min(+p.dias || 30, 365);
  const desde = new Date(Date.now() - dias * 864e5);
  const sh = hoja_();
  const n = sh.getLastRow() - 1;
  let filas = n > 0 ? sh.getRange(2, 1, n, COLS.length).getValues() : [];
  filas = filas.map(f => { if (!(f[0] instanceof Date)) f[0] = new Date(f[0]); return f }).filter(f => !isNaN(f[0]) && f[0] >= desde).slice(-20000);
  const out = filas.map(f => {
    const o = {};
    COLS.forEach((c, i) => { o[c] = c === 'fecha' ? f[i].toISOString() : f[i]; });
    return o;
  });
  return ContentService.createTextOutput(JSON.stringify({ eventos: out }))
    .setMimeType(ContentService.MimeType.JSON);
}
