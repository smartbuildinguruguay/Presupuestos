/* Visor 3D propio (three.js) para los modelos que todavía no tienen Sketchfab.
   Carga un .glb, deja girar/acercar, y cambia fachada, techo, interior y pisos según el configurador.
   Uso: SBUvisor.abrir(contenedor, modelo, url) · SBUvisor.aplicar({ext, techo, int, pis}) · SBUvisor.vista('ext'|'techo'|'int'|'pis') */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let R = null, S, C, O, root, partes = {}, capas = {}, orig = {}, caja, raf = 0, cache = {};
// estado animado: opacidad y elevación del techo, opacidad de muros y aberturas
const ST = { techoOp: 1, techoLift: 0, murosOp: 1 }, TG = { techoOp: 1, techoLift: 0, murosOp: 1 };
const GRUPO = { ext: 'ext', techo: 'techo', int: 'int', pis: 'pis' };

// UV por proyección de caja: cada cara toma el plano según su normal (1 unidad = 1 m)
function uvCaja(g) {
  g = g.index ? g.toNonIndexed() : g; const p = g.attributes.position, n = new THREE.Vector3(), uv = new Float32Array(p.count * 2);
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
  for (let i = 0; i < p.count; i += 3) {
    a.fromBufferAttribute(p, i); b.fromBufferAttribute(p, i + 1); c.fromBufferAttribute(p, i + 2);
    n.copy(c).sub(b).cross(a.clone().sub(b)).normalize(); const ax = Math.abs(n.x), ay = Math.abs(n.y), az = Math.abs(n.z);
    for (let k = 0; k < 3; k++) { const v = [a, b, c][k];
      const [u, w] = ay >= ax && ay >= az ? [v.x, v.z] : ax >= az ? [v.z, v.y] : [v.x, v.y];
      uv[(i + k) * 2] = u; uv[(i + k) * 2 + 1] = w }
  }
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); return g;
}
function textura(op, metros) {
  const key = op.tex + (op.tam || 1) + (op.dir || 'h') + (op.color || '') + metros; if (cache[key]) return cache[key];
  const cv = window.SBUtex(op.tex, 512, op.tam || 1, op.dir || 'h');
  if (op.color && !op._ext) { const g = cv.getContext('2d'); g.globalAlpha = .7; g.fillStyle = op.color; g.fillRect(0, 0, 512, 512) }
  const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1 / metros, 1 / metros); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return cache[key] = t;
}
function pintar(grupo, op, metros) {
  const ms = partes[grupo] || []; ms.forEach(mesh => {
    const m0 = orig[mesh.uuid]; if (!op || (!op.tex && !op.color)) { mesh.material = m0; return }
    const m = m0.clone(); m.map = op.tex ? textura(op, metros) : null; m.color = new THREE.Color(op.tex ? '#ffffff' : op.color); m.needsUpdate = true; mesh.material = m });
}
function encuadre(k, suave = true) {
  if (!caja) return; const z = caja.getSize(new THREE.Vector3()), c = caja.getCenter(new THREE.Vector3()), R0 = Math.max(z.x, z.z);
  const P = { ext: [c.x + R0 * .35, c.y + z.y * .25, c.z + R0 * 1.35], techo: [c.x + R0 * .9, c.y + R0 * 1.3, c.z + R0 * .9], int: [c.x + R0 * .2, c.y + R0 * 1.6, c.z + R0 * .25], pis: [c.x + R0 * .2, c.y + R0 * 1.6, c.z + R0 * .25], def: [c.x + R0 * .9, c.y + R0 * .55, c.z + R0 * 1.15] }[k] || null;
  const to = new THREE.Vector3(...(P || [c.x + R0 * .9, c.y + R0 * .55, c.z + R0 * 1.15]));
  if (!suave) { C.position.copy(to); O.target.copy(c); O.update(); return }
  const from = C.position.clone(), t0 = O.target.clone(), t1 = c.clone(); let t = 0;
  const step = () => { t = Math.min(1, t + .04); const e = t * t * (3 - 2 * t); C.position.lerpVectors(from, to, e); O.target.lerpVectors(t0, t1, e); O.update(); if (t < 1) requestAnimationFrame(step) }; step();
}
window.SBUvisor = {
  abrir(el, modelo, url) {
    this.cerrar(); el.innerHTML = '<div class="v3msg">Cargando 3D…</div>';
    R = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true }); R.setPixelRatio(Math.min(2, devicePixelRatio)); R.outputColorSpace = THREE.SRGBColorSpace;
    R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.05; R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap;
    S = new THREE.Scene(); S.background = new THREE.Color('#9aa3ab'); S.fog = new THREE.Fog('#9aa3ab', 60, 160);
    C = new THREE.PerspectiveCamera(38, 1, .1, 500);
    S.add(new THREE.HemisphereLight('#eef3f7', '#59604f', 1.6));
    const sol = new THREE.DirectionalLight('#fff4e2', 2.4); sol.position.set(14, 22, 12); sol.castShadow = true; sol.shadow.mapSize.set(2048, 2048);
    Object.assign(sol.shadow.camera, { left: -25, right: 25, top: 25, bottom: -25, far: 80 }); S.add(sol);
    const suelo = new THREE.Mesh(new THREE.CircleGeometry(80, 48), new THREE.MeshStandardMaterial({ color: '#7d8a6b', roughness: 1 })); suelo.rotation.x = -Math.PI / 2; suelo.position.y = -.01; suelo.receiveShadow = true; S.add(suelo);
    el.innerHTML = ''; el.appendChild(R.domElement); R.domElement.style.cssText = 'width:100%;height:100%;display:block;touch-action:none';
    O = new OrbitControls(C, R.domElement); O.enableDamping = true; O.maxPolarAngle = Math.PI * .495; O.autoRotate = true; O.autoRotateSpeed = .6;
    R.domElement.addEventListener('pointerdown', () => { O.autoRotate = false }, { once: true });
    const fit = () => { const w = el.clientWidth, h = el.clientHeight || w * .6; R.setSize(w, h, false); C.aspect = w / h; C.updateProjectionMatrix() };
    this._ro = new ResizeObserver(fit); this._ro.observe(el); fit();
    const fade = (ms, op, lift) => (ms || []).forEach(mesh => { const m = mesh.material; if (!m) return;
      const t = op < .995; if (m.transparent !== t) { m.transparent = t; m.needsUpdate = true } m.opacity = op; m.depthWrite = op > .9; mesh.visible = op > .02; mesh.castShadow = op > .9;
      if (lift != null) { if (mesh.userData.y0 == null) mesh.userData.y0 = mesh.position.y; mesh.position.y = mesh.userData.y0 + lift } });
    const loop = () => { raf = requestAnimationFrame(loop); let mov = false;
      for (const k in ST) { const d = TG[k] - ST[k]; if (Math.abs(d) > .001) { ST[k] += d * .12; mov = true } else ST[k] = TG[k] }
      if (root && (mov || this._dirty)) { this._dirty = false; fade(capas['Techo'], ST.techoOp, ST.techoLift); fade(capas['Muros exteriores'], ST.murosOp); fade(capas['Aberturas'], Math.max(ST.murosOp, .25)) }
      O.update(); R.render(S, C) }; loop();
    return new Promise(ok => new GLTFLoader().load(url, g => {
      root = g.scene; partes = {}; orig = {}; capas = {};
      root.traverse(o => { if (!o.isMesh) return; o.geometry = uvCaja(o.geometry); o.geometry.computeVertexNormals(); o.castShadow = o.receiveShadow = true;
        const nm = x => String(x || '').replace(/_/g, ' '), mn = nm(o.material && o.material.name), anc = []; for (let q = o; q; q = q.parent) anc.push(nm(q.name));
        const bajo = k => anc.some(n => n.startsWith(k));
        // grupo para pintar (por material) y capa para transparentar (por categoría)
        const key = mn === 'Interior blanco' ? GRUPO.int : mn === 'Piso' ? GRUPO.pis : bajo('Techo') ? GRUPO.techo : bajo('Muros exteriores') ? GRUPO.ext : null;
        if (key) (partes[key] = partes[key] || []).push(o);
        ['Muros exteriores', 'Techo', 'Aberturas'].forEach(k => { if (bajo(k)) (capas[k] = capas[k] || []).push(o) });
        orig[o.uuid] = o.material });
      S.add(root); caja = new THREE.Box3().setFromObject(root); encuadre('def', false);
      const bar = document.createElement('div'); bar.className = 'v3bar';
      const grp = (t, k, ops) => `<div class="v3g"><span>${t}</span>${ops.map(([v, l]) => `<button type="button" data-${k}="${v}">${l}</button>`).join('')}</div>`;
      bar.innerHTML = grp('Techo', 't', [['ver', 'visible'], ['trans', 'transparente'], ['subir', 'levantar'], ['off', 'sacar']]) + grp('Muros', 'm', [['ver', 'sólidos'], ['trans', 'rayos X']]);
      bar.addEventListener('click', ev => { const b = ev.target.closest('[data-t],[data-m]'); if (!b) return; if (b.dataset.t) this.techo(b.dataset.t); else this.muros(b.dataset.m) });
      el.appendChild(bar); this._bar = bar; this.techo('ver'); this.muros('ver'); ok(true);
    }, undefined, () => { el.innerHTML = '<div class="v3msg">No se pudo cargar el 3D.</div>'; ok(false) }));
  },
  aplicar(cfg, D, m) {
    if (!root) return; this._dirty = true; const ext = D.exterior.find(e => e.id === cfg.ext);
    pintar(GRUPO.ext, ext && ext.tex ? Object.assign({ _ext: 1 }, ext) : null, 2);
    const op = (lista, id) => { const L = D[lista]; return L && L.activo !== false ? (L.opciones.find(o => o.id === id) || L.opciones[0]) : null };
    if (!m.config || m.config.includes('techo')) pintar(GRUPO.techo, op('techo', cfg.techo), 2);
    if (!m.config || m.config.includes('int')) { const o = op('interior', cfg.int); pintar(GRUPO.int, o && !o.original ? o : null, 1.6) }
    if (!m.config || m.config.includes('pis')) { const o = op('pisos', cfg.pis); pintar(GRUPO.pis, o && !o.original ? o : null, 1.6) }
  },
  vista(k) { encuadre(k); this.techo(k === 'int' || k === 'pis' ? 'trans' : 'ver'); if (k === 'ext' || k === 'techo') this.muros('ver') },
  // techo: 'ver' | 'trans' | 'subir' | 'off' · muros: 'ver' | 'trans' (animado)
  techo(modo) {
    this._techo = modo; const h = caja ? caja.getSize(new THREE.Vector3()).y : 3;
    TG.techoOp = { ver: 1, trans: .16, subir: 1, off: 0 }[modo]; TG.techoLift = modo === 'subir' ? Math.min(h * .35, 2.2) : 0; this._dirty = true;
    if (this._bar) this._bar.querySelectorAll('[data-t]').forEach(b => b.setAttribute('aria-pressed', b.dataset.t === modo));
  },
  muros(modo) {
    TG.murosOp = modo === 'trans' ? .14 : 1; this._dirty = true;
    if (this._bar) this._bar.querySelectorAll('[data-m]').forEach(b => b.setAttribute('aria-pressed', b.dataset.m === modo));
  },
  get info() { return Object.fromEntries(Object.entries(partes).map(([k, v]) => [k, v.map(x => x.name)])) },
  cerrar() { cancelAnimationFrame(raf); Object.assign(ST, { techoOp: 1, techoLift: 0, murosOp: 1 }); Object.assign(TG, ST); if (this._ro) this._ro.disconnect(); if (R) { R.dispose(); R.forceContextLoss && R.forceContextLoss() } R = null; root = null; caja = null },
};
window.dispatchEvent(new Event('sbuvisor'));
