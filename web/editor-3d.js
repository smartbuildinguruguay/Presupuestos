/* Panel: pestaña "3D: partes y vistas".
   Para cada modelo: qué partes del 3D cambian con cada terminación y desde dónde mira la cámara. */
(function () {
  const $ = id => document.getElementById(id);
  const A = () => window.SBUadmin;
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const clone = o => JSON.parse(JSON.stringify(o));
  const PARTES = [
    { k: 'fachada', t: 'Fachada', d: 'Paredes exteriores', lista: 'exterior', prueba: [.62, .4, .22] },
    { k: 'interior', t: 'Interior', d: 'Paredes interiores', lista: 'interior', prueba: [.95, .85, .55] },
    { k: 'piso', t: 'Pisos', d: 'Pisos', lista: 'pisos', prueba: [.55, .35, .2] },
    { k: 'techo', t: 'Techo', d: 'Techo', lista: 'techo', prueba: [.1, .1, .12] },
  ];
  let ultimo = { n: '', t: 0 }, modelId = null, parte = 'fachada', api = null, mats = [], orig = {}, tocadas = new Set(), texU = {}, tocar = true, busy = false;

  const modelo = () => A().D.modelos.find(m => m.id === modelId);
  const lista = (m, k) => { if (k === 'fachada') return m.fachadaMat || []; const own = (m.mats || {})[k] || []; if (own.length) return own;
    const base = ((A().D.matsBase || {})[k] || []).map(x => x.toLowerCase()); return mats.filter(q => base.includes(q.name.toLowerCase())).map(q => q.name) };
  const setLista = (m, k, v) => { if (k === 'fachada') m.fachadaMat = v; else { m.mats = m.mats || {}; m.mats[k] = v } A().saveDraft() };
  const opciones = k => { const P = PARTES.find(p => p.k === k), D = A().D; return k === 'fachada' ? D.exterior.filter(e => e.tex) : ((D[P.lista] || {}).opciones || []) };
  const rgb = h => [1, 3, 5].map(i => Math.pow(parseInt(h.substr(i, 2), 16) / 255, 2.2));

  function albedo(mat, uid, color) {
    ['AlbedoPBR', 'DiffusePBR', 'DiffuseColor'].forEach(ch => { const c = mat.channels[ch]; if (!c) return; c.enable = true;
      if (uid) { c.texture = { uid, UVTransforms: { scale: [1, 1], offset: [0, 0], rotation: 0 }, wrapS: 'REPEAT', wrapT: 'REPEAT', magFilter: 'LINEAR', minFilter: 'LINEAR_MIPMAP_LINEAR', texCoordUnit: 0, textureTarget: 'TEXTURE_2D', internalFormat: 'RGB' }; c.factor = 1; c.color = [1, 1, 1] }
      else if (color) { delete c.texture; c.color = color } });
  }

  /* pinta lo marcado de la parte activa con la opción de prueba elegida; lo demás vuelve a su original */
  function pintar() {
    const m = modelo(); if (!api || !m) return;
    const sel = new Set(lista(m, parte));
    tocadas.forEach(n => { if (!sel.has(n) && orig[n]) { api.setMaterial(clone(orig[n])); tocadas.delete(n) } });
    const o = opciones(parte).find(x => x.id === ($('d3o') || {}).value);
    const P = PARTES.find(p => p.k === parte);
    const go = (uid, color) => sel.forEach(n => { if (!orig[n]) return; const x = clone(orig[n]); albedo(x, uid, color); api.setMaterial(x); tocadas.add(n) });
    if (!o) return go(null, P.prueba);
    if (o.deFachada && m.revOriginal === o.deFachada) {
      const src = (m.fachadaMat || []).map(x => orig[x]).find(Boolean), ch = src && ['AlbedoPBR', 'DiffusePBR', 'DiffuseColor'].map(c => src.channels[c]).find(c => c && c.texture);
      if (ch) { const est = $('d3est'); if (est) est.textContent = 'Aplicando…';
        return window.SBUestirar(api, ch.texture.uid, o.largo, o.ancho, texU, (u, why) => {
          if (est) est.textContent = why ? 'No se pudo estirar: ' + why + '. Se ve la original.' : 'Listo: largo ×' + (+o.largo || 1) + ', ancho ×' + (+o.ancho || 1);
          sel.forEach(n => { if (!orig[n]) return; const x = clone(orig[n]); ['AlbedoPBR', 'DiffusePBR', 'DiffuseColor'].forEach(c => { const q = x.channels[c]; if (!q) return; q.enable = true; q.texture = clone(ch.texture); if (u) q.texture.uid = u; q.factor = ch.factor ?? 1; q.color = ch.color || [1, 1, 1] }); api.setMaterial(x); tocadas.add(n) }) }) }
    }
    if (o.tex) {
      const T = parte === 'fachada' ? window.SBUtexDe(o, m) : { tam: +o.ancho || 1, dir: o.dir || 'h', key: o.tex + '@' + (o.dir || 'h') + (o.color || '') + (o.ancho || 1) };
      if (texU[T.key]) return go(texU[T.key]);
      const c = window.SBUtex(o.tex, 512, T.tam, T.dir);
      if (o.color && parte !== 'fachada') { const g = c.getContext('2d'); g.globalAlpha = .78; g.fillStyle = o.color; g.fillRect(0, 0, 512, 512) }
      api.addTexture(c.toDataURL('image/jpeg', .85), (e, uid) => { if (!e) { texU[T.key] = uid; go(uid) } });
    } else go(null, rgb(o.color || '#cccccc'));
  }
  function destellar(n) { if (!api || !orig[n]) return; const x = clone(orig[n]); albedo(x, null, [1, 0, 0]); api.setMaterial(x); setTimeout(pintar, 900) }

  function lado() {
    const m = modelo(); if (!m) return;
    const vistas = m.vistas || {};
    $('d3partes').innerHTML = PARTES.map(P => {
      const n = lista(m, P.k).length, v = vistas[P.k], on = P.k === parte;
      return `<button type="button" class="d3p" data-p="${P.k}" aria-pressed="${on}"><b>${P.t}</b><small>${n ? n + ' parte' + (n > 1 ? 's' : '') : 'sin partes'} · ${v ? 'vista guardada' : 'vista automática'}</small></button>`;
    }).join('');
    const P = PARTES.find(p => p.k === parte), ops = opciones(parte), sel = new Set(lista(m, parte));
    $('d3act').innerHTML = `<h3>${P.d}</h3>
      <label style="display:flex;align-items:center;gap:8px;font-weight:500"><input type="checkbox" id="d3tocar"${tocar ? ' checked' : ''} style="width:auto;margin:0"> Tocar el modelo marca o desmarca partes</label>
      <label>Probar con<select id="d3o">${ops.map(o => `<option value="${o.id}">${esc(o.nombre)}</option>`).join('')}<option value="">color de prueba</option></select></label>
      <div id="d3tab" style="display:grid;gap:6px"></div>
      <div class="d3m">${mats.length ? mats.map((x, i) => `<label><input type="checkbox" data-i="${i}"${sel.has(x.name) ? ' checked' : ''}>${esc(x.name)}<button type="button" data-v="${i}">ver</button></label>`).join('') : '<p class="note">Abrí el modelo para ver sus partes.</p>'}</div>
      <div style="display:grid;gap:6px;border-top:1px solid var(--line);padding-top:10px"><b style="font-size:.9rem">Vista de la cámara</b>
       <span class="note">Girá y acercá el 3D hasta el encuadre que querés que vea el cliente al elegir ${P.t.toLowerCase()}, y guardala.</span>
       <div style="display:flex;gap:6px;flex-wrap:wrap"><button type="button" class="btn" id="d3vs">Guardar esta vista</button><button type="button" class="btn ghost" id="d3vg"${vistas[parte] ? '' : ' disabled'}>Ir a la guardada</button><button type="button" class="btn ghost" id="d3vb"${vistas[parte] ? '' : ' disabled'}>Borrar</button></div>
       <span class="note" id="d3vm">${vistas[parte] ? 'Hay una vista guardada.' : 'Sin vista guardada: la web usa una aproximada.'}</span></div>`;
    $('d3tocar').onchange = () => { tocar = $('d3tocar').checked };
    const tabla = () => { const o = ops.find(x => x.id === $('d3o').value), box = $('d3tab');
      if (!o || !(o.tex || o.deFachada) || parte === 'fachada') { box.innerHTML = ''; return }
      box.innerHTML = `<b style="font-size:.9rem">Medida de las tablas · ${esc(o.nombre)}</b>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><label>Largo<input type="number" id="d3L" min="0.25" max="8" step="0.25" value="${+o.largo || 1}"><small>2 = el doble de largas</small></label>
        <label>Ancho<input type="number" id="d3A" min="0.25" max="8" step="0.25" value="${+o.ancho || 1}"><small>2 = el doble de anchas</small></label></div>
        <span class="note" id="d3est"></span><span class="note">Vale para todos los modelos. Se guarda con "Subir a la web".</span>`;
      let t; const upd = () => { const L = +$('d3L').value, W = +$('d3A').value; if (!(L > 0 && W > 0)) return; o.largo = L; o.ancho = W; A().saveDraft(); clearTimeout(t); t = setTimeout(pintar, 350) };
      $('d3L').oninput = upd; $('d3A').oninput = upd };
    $('d3o').onchange = () => { tabla(); pintar() }; tabla();
    $('d3act').querySelectorAll('[data-i]').forEach(cb => cb.onchange = () => { setLista(m, parte, [...$('d3act').querySelectorAll('[data-i]:checked')].map(c => mats[+c.dataset.i].name)); pintar(); refrescarCabecera() });
    $('d3act').querySelectorAll('[data-v]').forEach(b => b.onclick = ev => { ev.preventDefault(); destellar(mats[+b.dataset.v].name) });
    $('d3vs').onclick = () => { if (!api) return; api.getCameraLookAt((e, c) => { if (e || !c) return; m.vistas = m.vistas || {}; m.vistas[parte] = { p: c.position.map(v => +v.toFixed(3)), t: c.target.map(v => +v.toFixed(3)) }; A().saveDraft(); lado() }) };
    $('d3vg').onclick = () => { const v = (m.vistas || {})[parte]; if (api && v) api.setCameraLookAt(v.p, v.t, 1.2) };
    $('d3vb').onclick = () => { if (m.vistas) { delete m.vistas[parte]; A().saveDraft(); lado() } };
  }
  function refrescarCabecera() { const m = modelo(); $('d3partes').querySelectorAll('[data-p]').forEach(b => { const k = b.dataset.p, n = lista(m, k).length, v = (m.vistas || {})[k]; b.querySelector('small').textContent = `${n ? n + ' parte' + (n > 1 ? 's' : '') : 'sin partes'} · ${v ? 'vista guardada' : 'vista automática'}` }) }

  function abrir() {
    const m = modelo(); if (!m) return;
    if (!m.uid) { $('d3stage').innerHTML = '<div class="msg">Este modelo no tiene código de Sketchfab.</div>'; return }
    if (!window.Sketchfab) { $('d3stage').innerHTML = '<div class="msg">Cargando visor…</div>'; setTimeout(abrir, 400); return }
    api = null; mats = []; orig = {}; tocadas = new Set(); texU = {};
    $('d3stage').innerHTML = '<iframe title="Modelo 3D" allow="autoplay; fullscreen"></iframe><div class="msg" id="d3msg">Cargando el modelo…</div>';
    const c = new Sketchfab($('d3stage').querySelector('iframe'));
    c.init(m.uid, { autostart: 1, preload: 1, ui_infos: 0, ui_watermark: 0, ui_watermark_link: 0, ui_inspector: 0, ui_settings: 0, ui_help: 0, ui_vr: 0, ui_ar: 0, ui_annotations: 0, ui_stop: 0, ui_hint: 0, dnt: 1,
      success(a) { a.start(); a.addEventListener('viewerready', () => { a.getMaterialList((e, l) => {
        if (m.id !== modelId) return; api = a; mats = (l || []).slice().sort((p, q) => p.name.localeCompare(q.name)); mats.forEach(x => orig[x.name] = clone(x));
        const s = $('d3msg'); if (s) s.remove(); lado(); pintar();
        // tocar el modelo: marca o desmarca el material tocado en la parte activa
        try { a.addEventListener('click', info => {
          if (!tocar || !info || !info.material) return; const n = info.material.name; if (!n) return;
          const t = Date.now(); if (n === ultimo.n && t - ultimo.t < 700) return; ultimo = { n, t };
          const L = new Set(lista(m, parte)); if (L.has(n)) L.delete(n); else L.add(n);
          setLista(m, parte, [...L]); lado(); pintar(); destellar(n) }, { pick: 'slow' }) } catch (e) { }
      }) }) },
      error() { $('d3stage').innerHTML = '<div class="msg">No se pudo abrir el modelo.</div>' } });
  }

  let listo = false;
  window.SBUeditor3d = {
    render(id) {
      if (!listo) {
        listo = true;
        $('d3model').onchange = () => { modelId = $('d3model').value; api = null; $('d3stage').innerHTML = '<div class="msg">Tocá "Abrir modelo"</div>'; lado() };
        $('d3open').onclick = abrir;
        $('d3partes').addEventListener('click', e => { const b = e.target.closest('[data-p]'); if (!b) return;
          // al cambiar de parte, lo pintado de la anterior vuelve a su original
          if (api) tocadas.forEach(n => orig[n] && api.setMaterial(clone(orig[n]))); tocadas = new Set();
          parte = b.dataset.p; lado(); pintar();
          const v = (modelo().vistas || {})[parte]; if (api && v) api.setCameraLookAt(v.p, v.t, 1.2) });
      }
      if (id && id !== modelId) { modelId = id; api = null; $('d3stage').innerHTML = '<div class="msg">Tocá "Abrir modelo"</div>' }
      if (!modelId || !A().D.modelos.some(m => m.id === modelId)) modelId = (A().D.modelos[0] || {}).id;
      $('d3model').innerHTML = A().D.modelos.map(m => `<option value="${m.id}"${m.id === modelId ? ' selected' : ''}>${esc(m.nombre)}</option>`).join('');
      lado();
    }
  };
})();
