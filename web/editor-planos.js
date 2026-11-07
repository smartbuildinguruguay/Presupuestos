/* Editor de plantas del panel: arrastrar muros, aberturas, muebles y ambientes sobre el dibujo real.
   Usa window.SBUadmin (datos y guardado del panel) y dibujos.js (SBUplanta, SBUplantaGeo). */
(function () {
  const $ = id => document.getElementById(id);
  const A = () => window.SBUadmin;
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const r2 = v => Math.round(v * 100) / 100;
  const clone = o => JSON.parse(JSON.stringify(o));
  const ACC = '#c4703c';
  const TIPOS = { cama: 'Cama', inodoro: 'Inodoro', lav: 'Lavatorio', ducha: 'Ducha', mesada: 'Mesada de cocina', isla: 'Isla / mueble', mesa: 'Mesa con sillas', sofa: 'Sofá', estufa: 'Estufa', parrilla: 'Parrilla', escalera: 'Escalera' };
  const DIM = { inodoro: [.4, .66], lav: [.45, .4] };
  const AREAS = { pisos: 'Piso interior', cubiertos: 'Deck / galería', opcionales: 'Módulo opcional' };
  const NOMBRE = { murosExt: 'Muro exterior', muros: 'Muro interior', ventanas: 'Ventana', puertas: 'Puerta', equip: 'Mueble', locales: 'Ambiente', pisos: 'Piso interior', cubiertos: 'Deck / galería', opcionales: 'Módulo opcional' };

  let modelId = null, nivel = 0, sel = null, undo = [], drag = null, snap = 0.05;

  const modelo = () => A().D.modelos.find(m => m.id === modelId);
  const lista = () => { const m = modelo(); if (!m || !m.planta) return null; const v = A().D.plantas[m.planta]; return v ? [].concat(v) : null };
  const plan = () => { const l = lista(); return l ? l[Math.min(nivel, l.length - 1)] : null };
  const guardar = () => A().saveDraft();
  const sn = v => Math.round(v / snap) * snap;
  function push() { const P = plan(); if (!P) return; undo.push(JSON.stringify(P)); if (undo.length > 80) undo.shift() }
  function deshacer() {
    const P = plan(); if (!P || !undo.length) return;
    const prev = JSON.parse(undo.pop()); Object.keys(P).forEach(k => delete P[k]); Object.assign(P, prev);
    sel = null; guardar(); render();
  }

  // tramo de una abertura en metros
  function tramo(P, mm) {
    if (Array.isArray(mm)) { const [a, b, c, d] = mm; return { x1: Math.min(a, c), y1: Math.min(b, d), x2: Math.max(a, c), y2: Math.max(b, d) } }
    return { N: { x1: 0, y1: 0, x2: P.ancho, y2: 0 }, S: { x1: 0, y1: P.prof, x2: P.ancho, y2: P.prof }, O: { x1: 0, y1: 0, x2: 0, y2: P.prof }, E: { x1: P.ancho, y1: 0, x2: P.ancho, y2: P.prof } }[mm] || { x1: 0, y1: 0, x2: P.ancho, y2: 0 };
  }
  const centroAb = (P, o) => { const s = tramo(P, o.m); return s.y1 === s.y2 ? [s.x1 + o.en, s.y1] : [s.x1, s.y1 + o.en] };

  /* ---------- dibujo + capa de edición ---------- */
  function capa(P) {
    const { S, pad } = window.SBUplantaGeo(P), X = x => pad + x * S, Y = y => pad + y * S;
    const isSel = (k, i) => sel && sel.k === k && sel.i === i;
    let g = '';
    Object.keys(AREAS).forEach(k => (P[k] || []).forEach((r, i) => {
      const on = isSel(k, i);
      g += `<rect data-k="${k}" data-i="${i}" x="${X(r[0])}" y="${Y(r[1])}" width="${r[2] * S}" height="${r[3] * S}" fill="transparent" stroke="${on ? ACC : 'transparent'}" stroke-width="3"/>`;
      if (on) g += `<rect data-k="${k}" data-i="${i}" data-p="br" x="${X(r[0] + r[2]) - 9}" y="${Y(r[1] + r[3]) - 9}" width="18" height="18" fill="${ACC}" style="cursor:nwse-resize"/>`;
    }));
    ['murosExt', 'muros'].forEach(k => (P[k] || []).forEach((w, i) => {
      const on = isSel(k, i);
      g += `<line data-k="${k}" data-i="${i}" x1="${X(w[0])}" y1="${Y(w[1])}" x2="${X(w[2])}" y2="${Y(w[3])}" stroke="${on ? ACC : 'transparent'}" stroke-opacity="${on ? .55 : 1}" stroke-width="16" style="cursor:move"/>`;
      if (on) g += `<circle data-k="${k}" data-i="${i}" data-p="1" cx="${X(w[0])}" cy="${Y(w[1])}" r="10" fill="${ACC}"/><circle data-k="${k}" data-i="${i}" data-p="2" cx="${X(w[2])}" cy="${Y(w[3])}" r="10" fill="${ACC}"/>`;
    }));
    (P.equip || []).forEach((q, i) => {
      const [dw, dh] = DIM[q.t] || [1, 1], w = q.w || dw, h = q.h || dh, on = isSel('equip', i);
      g += `<rect data-k="equip" data-i="${i}" x="${X(q.x)}" y="${Y(q.y)}" width="${w * S}" height="${h * S}" fill="${on ? 'rgba(196,112,60,.15)' : 'transparent'}" stroke="${on ? ACC : 'transparent'}" stroke-width="2" stroke-dasharray="6 4" style="cursor:move"/>`;
      if (on && q.w) g += `<rect data-k="equip" data-i="${i}" data-p="br" x="${X(q.x + w) - 8}" y="${Y(q.y + h) - 8}" width="16" height="16" fill="${ACC}" style="cursor:nwse-resize"/>`;
    });
    ['ventanas', 'puertas'].forEach(k => (P[k] || []).forEach((o, i) => {
      const [cx, cy] = centroAb(P, o), on = isSel(k, i);
      g += `<circle data-k="${k}" data-i="${i}" cx="${X(cx)}" cy="${Y(cy)}" r="${on ? 12 : 9}" fill="${k === 'puertas' ? '#2f6b45' : '#3b6ea8'}" fill-opacity="${on ? .9 : .55}" stroke="#fff" stroke-width="2" style="cursor:ew-resize"/>`;
    }));
    (P.locales || []).forEach((l, i) => {
      const on = isSel('locales', i);
      g += `<rect data-k="locales" data-i="${i}" x="${X(l.x) - 70}" y="${Y(l.y) - 18}" width="140" height="${l.a ? 40 : 24}" rx="4" fill="${on ? 'rgba(196,112,60,.15)' : 'transparent'}" stroke="${on ? ACC : 'transparent'}" stroke-width="2" style="cursor:move"/>`;
    });
    return `<g id="peCapa">${g}</g>`;
  }

  function render() {
    const m = modelo(), box = $('peCanvas');
    if (!box) return;
    // selectores
    $('peModel').innerHTML = A().D.modelos.map(x => `<option value="${x.id}"${x.id === modelId ? ' selected' : ''}>${esc(x.nombre)} · ${x.m2} m²</option>`).join('');
    const l = lista();
    $('peNivel').innerHTML = l ? l.map((p, i) => `<option value="${i}"${i === nivel ? ' selected' : ''}>${esc(p.nivel || (l.length > 1 ? 'Planta ' + (i + 1) : 'Planta'))}</option>`).join('') : '';
    $('peNivel').hidden = !l || l.length < 2;
    const P = plan();
    document.querySelectorAll('#t-planos [data-need]').forEach(b => b.disabled = !P);
    if (!P) {
      box.innerHTML = `<div class="msg" style="padding:40px;text-align:center">Este modelo no tiene planta. <button type="button" class="btn" id="peCrear">Crear planta en blanco</button></div>`;
      $('peCrear').onclick = () => { m.planta = m.id; A().D.plantas[m.id] = { ancho: 10, prof: 6, eExt: .15, eInt: .1, muros: [], ventanas: [], puertas: [], equip: [], locales: [], cotasX: [0, 10], cotasY: [0, 6] }; guardar(); render() };
      $('peSide').innerHTML = ''; return;
    }
    const svg = window.SBUplanta(P, m).replace(/<\/svg>$/, capa(P) + '</svg>');
    box.innerHTML = svg;
    const s = box.querySelector('svg'); s.style.width = '100%'; s.style.height = 'auto'; s.style.display = 'block'; s.style.touchAction = 'none';
    lado(P);
  }

  /* ---------- panel lateral ---------- */
  function lado(P) {
    const f = (lab, key, val, typ = 'number', extra = '') => `<label>${lab}<input data-f="${key}" type="${typ}" ${typ === 'number' ? 'step="0.05"' : ''} value="${esc(val ?? '')}" ${extra}></label>`;
    let h = '';
    if (sel) {
      const o = P[sel.k][sel.i];
      h += `<h3>${NOMBRE[sel.k]}</h3><div class="f">`;
      if (sel.k === 'muros' || sel.k === 'murosExt') {
        h += f('x inicio', '0', o[0]) + f('y inicio', '1', o[1]) + f('x fin', '2', o[2]) + f('y fin', '3', o[3]);
        if (sel.k === 'muros') h += f('Espesor (m)', '4', o[4] ?? '', 'number', `placeholder="${P.eInt}"`);
        h += `<p class="note wide" style="grid-column:1/-1">Los muros van rectos (horizontales o verticales). Arrastrá el muro o sus puntas.</p>`;
      } else if (sel.k === 'ventanas' || sel.k === 'puertas') {
        const ladoTxt = Array.isArray(o.m) ? 'tramo' : o.m;
        h += `<label>Muro<select data-f="m">${['N', 'S', 'O', 'E'].map(s => `<option${s === ladoTxt ? ' selected' : ''}>${s}</option>`).join('')}${Array.isArray(o.m) ? '<option value="tramo" selected>el muro elegido</option>' : ''}</select></label>`;
        h += f('Desde el inicio (m)', 'en', o.en) + f('Ancho (m)', 'a', o.a);
        if (sel.k === 'puertas') h += `<label>Abre hacia<select data-f="giro"><option value="1"${o.giro > 0 ? ' selected' : ''}>un lado</option><option value="-1"${o.giro < 0 ? ' selected' : ''}>el otro</option></select></label>`;
        else h += `<label>Luz hacia<select data-f="in"><option value="1"${(o.in || 1) > 0 ? ' selected' : ''}>un lado</option><option value="-1"${o.in < 0 ? ' selected' : ''}>el otro</option></select></label><label><span><input type="checkbox" data-f="fijo"${o.fijo ? ' checked' : ''} style="width:auto"> Paño fijo</span></label>`;
        h += `<p class="note wide" style="grid-column:1/-1">Arrastrá el punto para correrla sobre el muro. Para pasarla a otro muro: seleccioná el muro y tocá "+ Ventana" o "+ Puerta".</p>`;
      } else if (sel.k === 'equip') {
        h += `<label>Tipo<select data-f="t">${Object.entries(TIPOS).map(([k, v]) => `<option value="${k}"${k === o.t ? ' selected' : ''}>${v}</option>`).join('')}</select></label>`;
        h += f('x', 'x', o.x) + f('y', 'y', o.y);
        if (!DIM[o.t]) h += f('Ancho (m)', 'w', o.w) + f('Largo (m)', 'h', o.h);
        if (o.t === 'inodoro') h += `<label>Mirando<select data-f="rot"><option value="0">hacia abajo</option><option value="180"${o.rot === 180 ? ' selected' : ''}>hacia arriba</option></select></label>`;
        if (o.t === 'cama') h += `<label>Cabecera<select data-f="rot">${[[0, 'arriba'], [180, 'abajo'], [90, 'a la izquierda'], [270, 'a la derecha']].map(([v, t]) => `<option value="${v}"${(o.rot || 0) === v ? ' selected' : ''}>${t}</option>`).join('')}</select><small>Si la ponés de costado, cambiá ancho y largo</small></label>`;
      } else if (sel.k === 'locales') {
        h += f('Nombre', 'n', o.n, 'text') + f('m²', 'a', o.a) + f('x', 'x', o.x) + f('y', 'y', o.y);
      } else {
        h += f('x', '0', o[0]) + f('y', '1', o[1]) + f('Ancho (m)', '2', o[2]) + f('Largo (m)', '3', o[3]);
      }
      h += `</div><div style="display:flex;gap:6px;flex-wrap:wrap"><button type="button" class="btn ghost" id="peDup">Duplicar</button><button type="button" class="btn ghost" id="peDel">Borrar</button><button type="button" class="btn ghost" id="peDesel">Listo</button></div>`;
    } else {
      h += `<h3>Toda la planta</h3><div class="f">
        ${f('Ancho total (m)', 'ancho', P.ancho)}${f('Profundidad total (m)', 'prof', P.prof)}
        ${f('Muro exterior (m)', 'eExt', P.eExt)}${f('Muro interior (m)', 'eInt', P.eInt)}
        ${f('Nombre de la planta', 'nivel', P.nivel || '', 'text', 'placeholder="planta"')}${f('Norte (grados)', 'norte', P.norte || 0)}
        <label class="wide" style="grid-column:1/-1">Cotas horizontales<input data-f="cotasX" value="${esc((P.cotasX || []).join('; '))}"><small>Posiciones en metros separadas por ;</small></label>
        <label class="wide" style="grid-column:1/-1">Cotas verticales<input data-f="cotasY" value="${esc((P.cotasY || []).join('; '))}"></label>
        <label class="wide" style="grid-column:1/-1">Medida en el rótulo<input data-f="medida" value="${esc(P.medida || '')}" placeholder="se calcula sola"></label>
      </div><p class="note">Tocá cualquier cosa del dibujo para editarla. Puntos azules: ventanas · verdes: puertas. Flechas del teclado: mover 5 cm · Suprimir: borrar · Ctrl+Z: deshacer.</p>`;
    }
    $('peSide').innerHTML = h;
    $('peSide').querySelectorAll('[data-f]').forEach(el => el.addEventListener(el.type === 'checkbox' || el.tagName === 'SELECT' ? 'change' : 'input', () => campo(P, el)));
    if (sel) {
      $('peDel').onclick = borrar;
      $('peDup').onclick = () => { const o = clone(P[sel.k][sel.i]); push(); mover(sel.k, o, .3, .3); P[sel.k].push(o); sel = { k: sel.k, i: P[sel.k].length - 1 }; guardar(); render() };
      $('peDesel').onclick = () => { sel = null; render() };
    }
  }

  function campo(P, el) {
    const k = el.dataset.f, num = el.type === 'number';
    let v = el.type === 'checkbox' ? el.checked : num ? (el.value === '' ? null : +el.value) : el.value;
    push();
    if (!sel) {
      if (k === 'cotasX' || k === 'cotasY') P[k] = String(v).split(/[;\s]+/).map(Number).filter(n => !isNaN(n));
      else if (v === null || v === '') delete P[k]; else P[k] = v;
    } else {
      const o = P[sel.k][sel.i];
      if (Array.isArray(o)) { if (v === null) o.splice(+k, 1); else o[+k] = v }
      else if (k === 'm') { if (v !== 'tramo') o.m = v }
      else if (k === 'giro' || k === 'in' || k === 'rot') o[k] = +v;
      else if (k === 'fijo') { if (v) o.fijo = 1; else delete o.fijo }
      else if (v === null || v === '') delete o[k]; else o[k] = v;
    }
    guardar();
    // redibujar sin perder el foco del campo
    const box = $('peCanvas'), m = modelo();
    box.innerHTML = window.SBUplanta(P, m).replace(/<\/svg>$/, capa(P) + '</svg>');
    const s = box.querySelector('svg'); s.style.width = '100%'; s.style.height = 'auto'; s.style.display = 'block'; s.style.touchAction = 'none';
    if (el.tagName === 'SELECT' && sel && sel.k === 'equip' && k === 't') lado(P);
  }

  function mover(k, o, dx, dy) {
    if (k === 'muros' || k === 'murosExt') { o[0] = r2(o[0] + dx); o[1] = r2(o[1] + dy); o[2] = r2(o[2] + dx); o[3] = r2(o[3] + dy) }
    else if (k === 'equip' || k === 'locales') { o.x = r2(o.x + dx); o.y = r2(o.y + dy) }
    else if (AREAS[k]) { o[0] = r2(o[0] + dx); o[1] = r2(o[1] + dy) }
    else if (k === 'ventanas' || k === 'puertas') { const P = plan(), s = tramo(P, o.m), hz = s.y1 === s.y2; o.en = r2(Math.max(0, o.en + (hz ? dx : dy))) }
  }
  function borrar() { const P = plan(); if (!P || !sel) return; push(); P[sel.k].splice(sel.i, 1); sel = null; guardar(); render() }

  /* ---------- agregar ---------- */
  function agregar(k, extra) {
    const P = plan(); if (!P) return;
    push();
    const cx = r2(sn(P.ancho / 2)), cy = r2(sn(P.prof / 2));
    let o;
    const muroSel = sel && (sel.k === 'muros' || sel.k === 'murosExt') ? P[sel.k][sel.i] : null;
    if (k === 'muros') o = [r2(cx - 1.5), cy, r2(cx + 1.5), cy];
    else if (k === 'murosExt') o = [0, cy, 3, cy];
    else if (k === 'ventanas' || k === 'puertas') {
      const m = muroSel ? muroSel.slice(0, 4) : 'N', s = tramo(P, m), largo = (s.x2 - s.x1) + (s.y2 - s.y1);
      o = { m, en: r2(sn(largo / 2)), a: k === 'puertas' ? .8 : 1.2 };
      if (k === 'puertas') o.giro = 1;
      if (Array.isArray(m) && sel.k === 'murosExt') o.e = P.eExt;
    }
    else if (k === 'equip') { const t = extra || 'cama'; o = { t, x: r2(cx - .5), y: r2(cy - .5) }; if (!DIM[t]) { const d = { cama: [1.6, 2], mesada: [2.4, .6], isla: [1.8, .9], mesa: [2.2, .95], sofa: [2.4, .9], estufa: [.8, .8], parrilla: [1.1, .6], escalera: [2.4, .95], ducha: [.9, .9] }[t] || [1, 1]; o.w = d[0]; o.h = d[1] } }
    else if (k === 'locales') o = { n: 'Ambiente', x: cx, y: cy };
    else if (AREAS[k]) o = [r2(cx - 2), r2(cy - 1.5), 4, 3];
    (P[k] = P[k] || []).push(o);
    sel = { k, i: P[k].length - 1 }; guardar(); render();
  }

  /* ---------- arrastrar ---------- */
  function punto(ev) {
    const s = $('peCanvas').querySelector('svg'), P = plan(), { S, pad } = window.SBUplantaGeo(P);
    const pt = s.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY;
    const q = pt.matrixTransform(s.getScreenCTM().inverse());
    return [(q.x - pad) / S, (q.y - pad) / S];
  }
  function down(ev) {
    const t = ev.target.closest('[data-k]'); const P = plan(); if (!P) return;
    if (!t) { if (sel) { sel = null; render() } return }
    ev.preventDefault();
    const k = t.dataset.k, i = +t.dataset.i;
    const nuevo = !sel || sel.k !== k || sel.i !== i;
    sel = { k, i };
    drag = { k, i, p: t.dataset.p || null, start: punto(ev), orig: clone(P[k][i]), antes: JSON.stringify(P), movio: false, refs: [] };
    // aberturas pegadas a este muro: se mueven con él
    if (k === 'muros' || k === 'murosExt') ['ventanas', 'puertas'].forEach(kk => (P[kk] || []).forEach(o => { if (Array.isArray(o.m) && o.m.slice(0, 4).join() === drag.orig.slice(0, 4).join()) drag.refs.push(o) }));
    if (nuevo) render();
  }
  function move(ev) {
    if (!drag) return;
    const P = plan(), o = P[drag.k][drag.i], [x, y] = punto(ev);
    let dx = sn(x - drag.start[0]), dy = sn(y - drag.start[1]);
    if (!dx && !dy && !drag.movio) return;
    drag.movio = true;
    const g = drag.orig;
    if (drag.k === 'muros' || drag.k === 'murosExt') {
      const hz = g[1] === g[3];
      if (drag.p === '1') { if (hz) o[0] = r2(g[0] + dx); else o[1] = r2(g[1] + dy) }
      else if (drag.p === '2') { if (hz) o[2] = r2(g[2] + dx); else o[3] = r2(g[3] + dy) }
      else { o[0] = r2(g[0] + dx); o[1] = r2(g[1] + dy); o[2] = r2(g[2] + dx); o[3] = r2(g[3] + dy) }
      drag.refs.forEach(a => { a.m = [o[0], o[1], o[2], o[3]] });
    } else if (drag.k === 'ventanas' || drag.k === 'puertas') {
      const s = tramo(P, o.m), hz = s.y1 === s.y2, largo = hz ? s.x2 - s.x1 : s.y2 - s.y1;
      o.en = r2(Math.min(largo, Math.max(0, sn((hz ? x - s.x1 : y - s.y1)))));
    } else if (drag.p === 'br') {
      if (Array.isArray(o)) { o[2] = r2(Math.max(.3, g[2] + dx)); o[3] = r2(Math.max(.3, g[3] + dy)) }
      else { o.w = r2(Math.max(.2, g.w + dx)); o.h = r2(Math.max(.2, g.h + dy)) }
    } else if (Array.isArray(o)) { o[0] = r2(g[0] + dx); o[1] = r2(g[1] + dy) }
    else { o.x = r2(g.x + dx); o.y = r2(g.y + dy) }
    render();
  }
  function up() {
    if (!drag) return;
    if (drag.movio) { undo.push(drag.antes); guardar() }
    drag = null;
  }
  function tecla(ev) {
    if (!$('t-planos') || $('t-planos').hidden) return;
    if (/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)) return;
    if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === 'z') { ev.preventDefault(); deshacer(); return }
    if (!sel) return;
    const P = plan(), o = P[sel.k][sel.i];
    if (ev.key === 'Delete' || ev.key === 'Backspace') { ev.preventDefault(); borrar(); return }
    const d = { ArrowLeft: [-snap, 0], ArrowRight: [snap, 0], ArrowUp: [0, -snap], ArrowDown: [0, snap] }[ev.key];
    if (d) { ev.preventDefault(); push(); mover(sel.k, o, d[0], d[1]); guardar(); render() }
    if (ev.key === 'Escape') { sel = null; render() }
  }

  /* ---------- arranque ---------- */
  let listo = false;
  window.SBUeditor = {
    render(id) {
      if (!listo) {
        listo = true;
        $('peModel').onchange = () => { modelId = $('peModel').value; nivel = 0; sel = null; undo = []; render() };
        $('peNivel').onchange = () => { nivel = +$('peNivel').value; sel = null; render() };
        document.querySelectorAll('#t-planos [data-add]').forEach(b => b.onclick = () => agregar(b.dataset.add, b.dataset.add === 'equip' ? $('peTipo').value : null));
        $('peTipo').innerHTML = Object.entries(TIPOS).map(([k, v]) => `<option value="${k}">${v}</option>`).join('');
        $('peUndo').onclick = deshacer;
        $('peNivelAdd').onclick = () => {
          const m = modelo(), l = lista(); if (!m || !l) return;
          const base = clone(l[0]); base.nivel = 'planta alta'; base.muros = []; base.ventanas = []; base.puertas = []; base.equip = []; base.locales = [];
          if (!l[0].nivel) l[0].nivel = 'planta baja';
          A().D.plantas[m.planta] = l.concat([base]); nivel = l.length; sel = null; guardar(); render();
        };
        $('peSnap').onchange = () => { snap = +$('peSnap').value };
        const box = $('peCanvas');
        box.addEventListener('pointerdown', down);
        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', up);
        window.addEventListener('keydown', tecla);
      }
      if (id) modelId = id;
      if (!modelId || !A().D.modelos.some(m => m.id === modelId)) modelId = (A().D.modelos[0] || {}).id;
      render();
    }
  };
})();
