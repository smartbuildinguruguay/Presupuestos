/* Visor 3D propio (three.js) para los modelos que todavía no tienen Sketchfab.
   Carga un .glb, deja girar/acercar, y cambia fachada, techo, interior y pisos según el configurador.
   Uso: SBUvisor.abrir(contenedor, modelo, url) · SBUvisor.aplicar({ext, techo, int, pis}) · SBUvisor.vista('ext'|'techo'|'int'|'pis') */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { crear } from './param3d.js?v=3';

const PB = crear(THREE);
let MORPH = null;
const limpiar = r => r.traverse(o => { if (o.geometry) o.geometry.dispose() });
let puertas = [], R = null, S, C, O, root, partes = {}, capas = {}, orig = {}, caja, raf = 0, cache = {};
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
/* ---------- módulos que el cliente agrega (extras con forma) ---------- */
const FORMAS = {
  entrepiso: { w: 6, d: 5, tipo: 'entrepiso', res: 1 }, oficina: { w: 3, d: 3, tipo: 'cuarto', res: 1 },
  'bano-extra': { w: 1.6, d: 2, tipo: 'cuarto' }, 'bano-accesible': { w: 2.2, d: 2.2, tipo: 'cuarto' }, vestuario: { w: 3, d: 2, tipo: 'cuarto', res: 1 },
  kitchenette: { w: 2, d: .6, tipo: 'mesada', res: 1 }, escritorio: { w: 1.6, d: .7, tipo: 'mesa', res: 1 }, estanteria: { w: 2, d: .4, tipo: 'estante', res: 1 },
};
let mods = [], sel = null, onCh = null, piso = null, alto = 3, drag = null;
/* modo editar ventanas: VE = { vx: [{m, en, a}], sel: índice, drag } */
let VE = null, marca = null;
const PARED = { S: 'Frente', N: 'Fondo', O: 'Izquierda', E: 'Derecha' };
const MT = c => new THREE.MeshStandardMaterial({ color: c, roughness: .8 });
function bx(g, w, h, d, x, y, z, m) { const b = new THREE.Mesh(new THREE.BoxGeometry(Math.max(w, .01), Math.max(h, .01), Math.max(d, .01)), m); b.position.set(x, y + h / 2, z); b.castShadow = b.receiveShadow = true; g.add(b); return b }
function armar(md) {
  const g = new THREE.Group(), { w, d } = md, F = FORMAS[md.id];
  const acero = MT('#2b2d31'), madera = MT('#b08a62'), blanco = MT('#e9e6df'), gris = MT('#c9cdd2');
  if (F.tipo === 'entrepiso') {
    const hE = Math.min(2.7, alto - 1.3), n = Math.max(8, Math.round(hE / .18)), run = .26;
    bx(g, w, .18, d, 0, hE, 0, madera);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => bx(g, .12, hE, .12, a * (w / 2 - .06), 0, b * (d / 2 - .06), acero));
    const rail = (x0, z0, x1, z1) => { const L = Math.hypot(x1 - x0, z1 - z0), r = bx(g, x0 === x1 ? .05 : L, .05, x0 === x1 ? L : .05, (x0 + x1) / 2, hE + 1.05, (z0 + z1) / 2, acero);
      for (let k = 0; k <= Math.ceil(L / 1.2); k++) { const t = k / Math.ceil(L / 1.2); bx(g, .04, 1, .04, x0 + (x1 - x0) * t, hE + .18, z0 + (z1 - z0) * t, acero) } };
    rail(-w / 2, -d / 2, w / 2, -d / 2); rail(w / 2, -d / 2, w / 2, d / 2); rail(-w / 2 + 1.1, d / 2, w / 2, d / 2);
    for (let i = 0; i < n; i++) bx(g, 1, hE / n, run, -w / 2 + .5, i * hE / n, d / 2 + (n - i) * run - run / 2, acero);
  } else if (F.tipo === 'cuarto') {
    const h = Math.min(2.6, alto - .3), t = .1, pu = Math.min(.9, w - .4);
    bx(g, w - .02, .02, d - .02, 0, 0, 0, MT('#d9d6cf'));  // piso del cuarto: también sirve para tocarlo y arrastrarlo
    bx(g, w, h, t, 0, 0, -d / 2 + t / 2, blanco); bx(g, t, h, d, -w / 2 + t / 2, 0, 0, blanco); bx(g, t, h, d, w / 2 - t / 2, 0, 0, blanco);
    const lado = (w - pu) / 2; bx(g, lado, h, t, -w / 2 + lado / 2, 0, d / 2 - t / 2, blanco); bx(g, lado - .0, h, t, w / 2 - lado / 2 + 0, 0, d / 2 - t / 2, blanco);
    bx(g, pu, h - 2.05, t, 0, 2.05, d / 2 - t / 2, blanco);
    if (md.id.startsWith('bano') || md.id === 'vestuario') { bx(g, .4, .4, .6, -w / 2 + .35, 0, -d / 2 + .45, gris); bx(g, .5, .85, .4, w / 2 - .4, 0, -d / 2 + .3, gris) }
    else bx(g, Math.min(1.4, w - .4), .75, .7, 0, 0, -d / 2 + .5, madera);
  } else if (F.tipo === 'mesada') { bx(g, w, .86, d, 0, 0, 0, blanco); bx(g, w, .04, d + .02, 0, .86, 0, madera) }
  else if (F.tipo === 'mesa') { bx(g, w, .04, d, 0, .72, 0, madera); [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => bx(g, .04, .72, .04, a * (w / 2 - .05), 0, b * (d / 2 - .05), acero)) }
  else { [0, .45, .9, 1.35, 1.8].forEach(y => bx(g, w, .03, d, 0, y, 0, madera)); [-1, 1].forEach(a => bx(g, .03, 1.85, d, a * (w / 2 - .015), 0, 0, acero)) }
  g.userData.md = md; g.traverse(o => { if (o.isMesh) { o.material = o.material.clone(); o.userData.mod = g } });
  return g;
}
function colocar(g) { const md = g.userData.md; g.position.set(md.x, piso.y, md.z); g.rotation.y = (md.rot || 0) * Math.PI / 2 }
function limitar(md) {
  const rw = (md.rot || 0) % 2 ? md.d : md.w, rd = (md.rot || 0) % 2 ? md.w : md.d;
  md.x = Math.round(Math.min(piso.x1 - rw / 2, Math.max(piso.x0 + rw / 2, md.x)) * 10) / 10;
  md.z = Math.round(Math.min(piso.z1 - rd / 2, Math.max(piso.z0 + rd / 2, md.z)) * 10) / 10;
}
function resaltar() { mods.forEach(g => g.traverse(o => { if (o.isMesh && o.material.emissive) o.material.emissive.set(g === sel ? '#7a4a00' : '#000000') })) }
function layout() { const L = {}; mods.forEach(g => { const md = g.userData.md; (L[md.id] = L[md.id] || []).push({ x: md.x, z: md.z, w: md.w, d: md.d, rot: md.rot || 0 }) }); return L }

window.SBUvisor = {
  abrir(el, modelo, url) {
    this._escena(el); this._modo = 'glb'; el.insertAdjacentHTML('beforeend', '<div class="v3msg">Cargando 3D…</div>');
    return new Promise(ok => new GLTFLoader().load(url, g => {
      const msg = el.querySelector('.v3msg'); if (msg) msg.remove();
      if (!R) return ok(false); this._montar(g.scene, null); encuadre('def', false); this._barra(); ok(true);
    }, undefined, () => { el.innerHTML = '<div class="v3msg">No se pudo cargar el 3D.</div>'; ok(false) }));
  },
  /* modelos configurables (Pod / Galpón): se arman acá mismo; al cambiar de medida "saltan" de una a la otra */
  param(el, m, cfg, D) {
    const SBP = window.SBUparam; this._D = D; this._cfg = cfg;
    if (!R || this._modo !== 'param' || this._mid !== m.id || !el.contains(R.domElement)) {
      this._escena(el); this._modo = 'param'; this._mid = m.id; this._m = m;
      this._montar(...this._armar(m, cfg)); encuadre('def', false); this._barra(); this.aplicar(cfg, D, m); return Promise.resolve(true);
    }
    const a = this._m._P, b = m._P;
    if ((Math.abs(a.ancho - b.ancho) > .01 || Math.abs(a.prof - b.prof) > .01) && VE) this.ventanas(false);
    this._m = m;
    if (Math.abs(a.ancho - b.ancho) > .01 || Math.abs(a.prof - b.prof) > .01) return new Promise(ok => {
      if (MORPH) MORPH.ok(false);
      const [r] = this._armar(m, cfg); caja = new THREE.Box3().setFromObject(r); limpiar(r); encuadre('def');
      MORPH = { t: 0, w0: root.userData.w || a.ancho, l0: root.userData.l || a.prof, w1: b.ancho, l1: b.prof, m, cfg, ok, hop: m.param === 'galpon' ? .9 : .45 };
      this.aplicar(cfg, D, m);
    });
    this._montar(...this._armar(m, cfg), true); this.aplicar(cfg, D, m); return Promise.resolve(true);
  },
  _armar(m, cfg) { const r = PB.construir(m, cfg, window.SBUparam); r.root.userData.w = m._P.ancho; r.root.userData.l = m._P.prof; return [r.root, r] },
  _escena(el) {
    this.cerrar(); el.innerHTML = '';
    R = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true }); R.setPixelRatio(Math.min(2, devicePixelRatio)); R.outputColorSpace = THREE.SRGBColorSpace;
    R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.05; R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap;
    S = new THREE.Scene(); S.background = new THREE.Color('#9aa3ab'); S.fog = new THREE.Fog('#9aa3ab', 60, 160);
    C = new THREE.PerspectiveCamera(38, 1, .1, 500);
    S.add(new THREE.HemisphereLight('#eef3f7', '#59604f', 1.6));
    const sol = new THREE.DirectionalLight('#fff4e2', 2.4); sol.position.set(14, 22, 12); sol.castShadow = true; sol.shadow.mapSize.set(2048, 2048);
    Object.assign(sol.shadow.camera, { left: -25, right: 25, top: 25, bottom: -25, far: 80 }); S.add(sol);
    const suelo = new THREE.Mesh(new THREE.CircleGeometry(80, 48), new THREE.MeshStandardMaterial({ color: '#7d8a6b', roughness: 1 })); suelo.rotation.x = -Math.PI / 2; suelo.position.y = -.01; suelo.receiveShadow = true; S.add(suelo);
    el.appendChild(R.domElement); R.domElement.style.cssText = 'width:100%;height:100%;display:block;touch-action:none'; this._el = el;
    O = new OrbitControls(C, R.domElement); O.enableDamping = true; O.maxPolarAngle = Math.PI * .495; O.autoRotate = true; O.autoRotateSpeed = .6;
    R.domElement.addEventListener('pointerdown', () => { O.autoRotate = false }, { once: true });
    const fit = () => { const w = el.clientWidth, h = el.clientHeight || w * .6; R.setSize(w, h, false); C.aspect = w / h; C.updateProjectionMatrix() };
    this._ro = new ResizeObserver(fit); this._ro.observe(el); fit();
    const fade = (ms, op, lift) => (ms || []).forEach(mesh => { const m = mesh.material; if (!m) return; const o0 = m.userData.op0 ?? 1;
      const t = op < .995 || o0 < 1; if (m.transparent !== t) { m.transparent = t; m.needsUpdate = true } m.opacity = op * o0; m.depthWrite = op > .9 && o0 >= 1; mesh.visible = op > .02; mesh.castShadow = op > .9 && o0 >= 1;
      if (lift != null) { if (mesh.userData.y0 == null) mesh.userData.y0 = mesh.position.y; mesh.position.y = mesh.userData.y0 + lift } });
    const loop = () => { raf = requestAnimationFrame(loop); let mov = false;
      if (MORPH && root) { const M = MORPH; M.t = Math.min(1, M.t + 1 / 42); const c1 = 1.5, c3 = c1 + 1, u = M.t - 1, k = 1 + c3 * u * u * u + c1 * u * u;
        const mm = M.t < 1 ? window.SBUparam.virtual(M.m, M.m.p, null, { w: M.w0 + (M.w1 - M.w0) * k, l: M.l0 + (M.l1 - M.l0) * k }) : M.m;
        this._montar(...this._armar(mm, M.cfg), true); root.position.y = Math.sin(Math.PI * Math.min(1, M.t * 1.15)) * M.hop;
        if (M.t >= 1) { MORPH = null; root.position.y = 0; caja = new THREE.Box3().setFromObject(root); M.ok(true) } }
      for (const k in ST) { const d = TG[k] - ST[k]; if (Math.abs(d) > .001) { ST[k] += d * .12; mov = true } else ST[k] = TG[k] }
      if (root && (mov || this._dirty)) { this._dirty = false; fade(capas['Techo'], ST.techoOp, ST.techoLift); fade(capas['Muros exteriores'], ST.murosOp); fade(capas['Aberturas'], Math.max(ST.murosOp, .25)) }
      puertas.forEach(d => { const dd = d.tg - d.t; if (Math.abs(dd) > .002) { d.t += dd * .09; d.aplicar() } });
      O.update(); R.render(S, C) }; loop();
    const pnl = document.createElement('div'); pnl.className = 'v3sel'; pnl.hidden = true; el.appendChild(pnl); this._sel = pnl;
    pnl.addEventListener('click', ev => { const v = ev.target.closest('[data-ve]'); if (v) return this._veAcc(v.dataset.ve); const b = ev.target.closest('[data-d]'); if (b) this._dim(b.dataset.d) });
    const ray = new THREE.Raycaster(), pt = new THREE.Vector2(); let down = null;
    const plano = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), tmp = new THREE.Vector3();
    const rayDe = ev => { const r = R.domElement.getBoundingClientRect(); pt.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(pt, C) };
    const vGrupos = () => { const L = []; if (root) root.traverse(o => { if (o.userData && o.userData.vi != null) L.push(o) }); return L };
    const vHit = ev => { rayDe(ev); const h = ray.intersectObjects(vGrupos(), true)[0]; if (!h) return null; let g = h.object; while (g && g.userData.vi == null) g = g.parent; return g };
    const enDe = (k, ev) => { const P = this._m._P, pl = k === 'S' ? new THREE.Plane(new THREE.Vector3(0, 0, 1), -P.prof) : k === 'N' ? new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)
      : k === 'E' ? new THREE.Plane(new THREE.Vector3(1, 0, 0), -P.ancho) : new THREE.Plane(new THREE.Vector3(1, 0, 0), 0);
      rayDe(ev); const q = new THREE.Vector3(); if (!ray.ray.intersectPlane(pl, q)) return null; return k === 'S' || k === 'N' ? q.x : q.z };
    R.domElement.addEventListener('pointerdown', ev => { if (!VE) return; down = [ev.clientX, ev.clientY]; const g = vHit(ev); if (!g) return;
      ev.stopImmediatePropagation(); const i = g.userData.vi, v = VE.vx[i]; VE.sel = i; this._veMarca(); this._panel();
      const u = enDe(v.m, ev); VE.drag = { i, off: u == null ? 0 : v.en - u, movio: false }; O.enabled = false; R.domElement.setPointerCapture(ev.pointerId) }, { capture: true });
    R.domElement.addEventListener('pointermove', ev => { if (!VE) return; if (!VE.drag) { if (!ev.buttons) R.domElement.style.cursor = vHit(ev) ? 'grab' : 'default'; return }
      const d = VE.drag, v = VE.vx[d.i], u = enDe(v.m, ev); if (u == null) return; R.domElement.style.cursor = 'grabbing';
      if (this._veMover(d.i, u + d.off)) { d.movio = true; this._veArmar() } }, { capture: true });
    const vFin = ev => { if (!VE) return; const d = VE.drag; VE.drag = null; O.enabled = true;
      if (d) { if (d.movio) this._veGuardar(); return }
      if (down && Math.hypot(ev.clientX - down[0], ev.clientY - down[1]) < 6 && VE.sel != null) { VE.sel = null; this._veMarca(); this._panel() } };
    R.domElement.addEventListener('pointerup', vFin, { capture: true }); R.domElement.addEventListener('pointercancel', vFin, { capture: true });
    R.domElement.addEventListener('pointerdown', ev => { if (!mods.length || !piso || VE) return; rayDe(ev);
      const h = ray.intersectObjects(mods, true)[0]; if (!h) return; let g = h.object; while (g && !g.userData.md) g = g.parent;
      sel = g; resaltar(); this._panel(); O.enabled = false; plano.constant = -piso.y; ray.ray.intersectPlane(plano, tmp);
      drag = { g, dx: g.userData.md.x - tmp.x, dz: g.userData.md.z - tmp.z, movio: false }; R.domElement.setPointerCapture(ev.pointerId) }, { capture: true });
    R.domElement.addEventListener('pointermove', ev => { if (!drag) return; rayDe(ev); if (!ray.ray.intersectPlane(plano, tmp)) return;
      const md = drag.g.userData.md; md.x = tmp.x + drag.dx; md.z = tmp.z + drag.dz; limitar(md); colocar(drag.g); drag.movio = true });
    const fin = () => { if (!drag) return; const mv = drag.movio; drag = null; O.enabled = true; if (mv && onCh) onCh(layout()) };
    R.domElement.addEventListener('pointerup', fin); R.domElement.addEventListener('pointercancel', fin);
    const hit = ev => { rayDe(ev); const h = ray.intersectObjects(puertas.flatMap(d => d.mallas), false)[0]; return h && h.object.userData.puerta };
    R.domElement.addEventListener('pointerdown', ev => { down = [ev.clientX, ev.clientY] });
    R.domElement.addEventListener('pointerup', ev => { if (VE || (sel && !O.enabled)) return; if (!down || Math.hypot(ev.clientX - down[0], ev.clientY - down[1]) > 6) return; const d = hit(ev); if (d) { d.tg = d.tg ? 0 : 1; this._pbtn() } });
    R.domElement.addEventListener('pointermove', ev => { if (ev.buttons || VE) return; R.domElement.style.cursor = hit(ev) ? 'pointer' : 'grab' });
  },
  // pone un modelo en escena: grupos para pintar y transparentar, puertas y ventanas que se abren, piso para los módulos
  _montar(r, proc, rearmar) {
    const prev = {}; if (rearmar) puertas.forEach(d => { prev[d.el] = [d.t, d.tg] });
    if (root) { S.remove(root); if (proc) limpiar(root) }
    root = r; partes = {}; orig = {}; capas = {};
    root.traverse(o => { if (!o.isMesh) return; if (!proc) { o.geometry = uvCaja(o.geometry); o.geometry.computeVertexNormals(); o.castShadow = o.receiveShadow = true }
      const nm = x => String(x || '').replace(/_/g, ' '), mn = nm(o.material && o.material.name), anc = []; for (let q = o; q; q = q.parent) anc.push(nm(q.name));
      const bajo = k => anc.some(n => n.startsWith(k));
      const key = mn === 'Interior blanco' ? GRUPO.int : mn === 'Piso' ? GRUPO.pis : bajo('Techo') ? GRUPO.techo : bajo('Muros exteriores') ? GRUPO.ext : null;
      if (key) (partes[key] = partes[key] || []).push(o);
      ['Muros exteriores', 'Techo', 'Aberturas'].forEach(k => { if (bajo(k)) (capas[k] = capas[k] || []).push(o) });
      orig[o.uuid] = o.material });
    S.add(root); if (!rearmar) caja = new THREE.Box3().setFromObject(root);
    if (proc) {
      puertas = proc.anim; piso = proc.piso; alto = proc.alto;
      puertas.forEach(d => { d.mallas.forEach(x => { x.userData.puerta = d }); const q = prev[d.el]; if (q) { d.t = q[0]; d.tg = q[1] } if (d.t) d.aplicar() });
    } else {
      // puertas y portones del .glb: la hoja gira sobre su bisagra; el portón se enrolla hacia arriba
      puertas = []; const hojas = [];
      root.traverse(o => { if (!o.isMesh) return; const anc = []; for (let q = o; q; q = q.parent) anc.push(String(q.name || '').replace(/_/g, ' '));
        const el = anc.find(n => /^(Puerta|Portón) /.test(n)); const mn = String(o.material && o.material.name || '').replace(/_/g, ' ');
        if (el && /^(Puerta|Puerta madera|Vidrio)$/.test(mn)) hojas.push([o, el]) });
      hojas.forEach(([o, el]) => {
        const b = new THREE.Box3().setFromObject(o), z = b.getSize(new THREE.Vector3()), porton = el.startsWith('Portón');
        const enX = z.x >= z.z, piv = new THREE.Object3D(), c = b.getCenter(new THREE.Vector3());
        if (porton) piv.position.set(c.x, b.max.y, c.z);
        else piv.position.set(enX ? b.min.x : c.x, b.min.y, enX ? c.z : b.max.z);
        root.add(piv); piv.attach(o);
        const d = { el, porton, piv, t: 0, tg: 0, mallas: [o],
          aplicar() { if (this.porton) { this.piv.scale.y = 1 - .94 * this.t } else this.piv.rotation.y = (enX ? -1 : 1) * this.t * Math.PI * .55 } };
        o.userData.puerta = d; puertas.push(d) });
      const pm = partes[GRUPO.pis] && partes[GRUPO.pis][0]; const b = new THREE.Box3().setFromObject(pm || root); piso = { x0: b.min.x + .15, x1: b.max.x - .15, z0: b.min.z + .15, z1: b.max.z - .15, y: pm ? b.max.y : 0 };
      alto = 3; const em = (capas['Muros exteriores'] || [])[0]; if (em) { const be = new THREE.Box3().setFromObject(em); alto = Math.max(2.5, be.max.y - piso.y) }
    }
    this._dirty = true; if (VE) this._veMarca();
  },
  _barra() {
    if (this._bar) this._bar.remove();
    const bar = document.createElement('div'), vent = puertas.some(d => /^Ventana/.test(d.el)); bar.className = 'v3bar';
    const grp = (t, k, ops) => `<div class="v3g"><span>${t}</span>${ops.map(([v, l]) => `<button type="button" data-${k}="${v}">${l}</button>`).join('')}</div>`;
    bar.innerHTML = grp('Techo', 't', [['ver', 'visible'], ['trans', 'transparente'], ['subir', 'levantar'], ['off', 'sacar']]) + grp('Muros', 'm', [['ver', 'sólidos'], ['trans', 'rayos X']]) +
      (puertas.length ? grp(vent ? 'Puertas y ventanas' : 'Puertas', 'p', [['0', 'cerradas'], ['1', 'abiertas']]) : '') +
      (this._modo === 'param' && this.vxCb ? `<div class="v3g"><span>Ventanas</span><button type="button" data-vedit="1" aria-pressed="${!!VE}">✎ editar</button></div>` : '');
    bar.addEventListener('click', ev => { if (ev.target.closest('[data-vedit]')) return this.ventanas(!VE); const b = ev.target.closest('[data-t],[data-m],[data-p]'); if (!b) return; if (b.dataset.p) { puertas.forEach(d => d.tg = +b.dataset.p); this._pbtn() } else if (b.dataset.t) this.techo(b.dataset.t); else this.muros(b.dataset.m) });
    this._el.appendChild(bar); this._bar = bar; this._pbtn(); this.techo(this._techo && this._modo === 'param' ? this._techo : 'ver'); this.muros('ver');
  },
  // dibuja los extras con forma y deja moverlos/dimensionarlos. cb(layout) al cambiar.
  modulos(cfg, D, m, cb) {
    if (!root || !piso) return; onCh = cb; mods.forEach(g => root.parent.remove(g)); mods = []; const lay = cfg.layout || {}; let cx = piso.x0 + .3, cz = piso.z0 + .3, fila = 0;
    Object.entries(cfg.extras || {}).forEach(([id, n]) => { const F = FORMAS[id]; if (!F) return;
      for (let i = 0; i < (+n || 0); i++) { const p = (lay[id] || [])[i] || {};
        const md = { id, nombre: ((D.extras || []).find(x => x.id === id) || {}).nombre || id, w: p.w || F.w, d: p.d || F.d, rot: p.rot || 0,
          x: p.x, z: p.z };
        if (p.x == null) { // acomoda los nuevos uno al lado del otro, contra el fondo
          if (cx + md.w > piso.x1) { cx = piso.x0 + .3; cz += fila + .5; fila = 0 } md.x = cx + md.w / 2; md.z = cz + md.d / 2; cx += md.w + .5; fila = Math.max(fila, md.d + (id === 'entrepiso' ? 3.6 : 0)) }
        limitar(md); const g = armar(md); colocar(g); S.add(g); mods.push(g) } });
    if (sel && !mods.includes(sel)) sel = null; resaltar(); this._panel();
  },
  _panel() {
    if (!this._sel) return; if (VE) return this._vePanel(); const md = sel && sel.userData.md, F = md && FORMAS[md.id];
    if (!md) { this._sel.hidden = !mods.length; this._sel.innerHTML = mods.length ? '<small>Tocá un módulo para moverlo o cambiarle la medida</small>' : ''; return }
    this._sel.hidden = false;
    this._sel.innerHTML = `<b>${md.nombre}</b>${F.res ? `<div class="v3dim"><span>Ancho</span><button type="button" data-d="w-">−</button><b>${md.w.toFixed(1)} m</b><button type="button" data-d="w+">+</button></div>
      <div class="v3dim"><span>Largo</span><button type="button" data-d="d-">−</button><b>${md.d.toFixed(1)} m</b><button type="button" data-d="d+">+</button></div><small>${(md.w * md.d).toFixed(1)} m²</small>` : ''}
      <div class="v3dim"><button type="button" data-d="rot">Girar</button><button type="button" data-d="ok">Listo</button></div><small>Arrastralo para moverlo</small>`;
  },
  _dim(a) {
    if (!sel) return; const md = sel.userData.md;
    if (a === 'ok') { sel = null; resaltar(); this._panel(); return }
    if (a === 'rot') md.rot = ((md.rot || 0) + 1) % 4;
    else { const k = a[0], st = md.id === 'entrepiso' || md.id === 'oficina' ? .5 : .1; md[k] = Math.max(st * 2, Math.round((md[k] + (a[1] === '+' ? st : -st)) * 10) / 10);
      const mx = k === 'w' ? piso.x1 - piso.x0 : piso.z1 - piso.z0; md[k] = Math.min(md[k], mx) }
    limitar(md); const i = mods.indexOf(sel), g = armar(md); S.remove(sel); colocar(g); S.add(g); mods[i] = g; sel = g; resaltar(); this._panel(); onCh && onCh(layout());
  },
  /* ---------- editar ventanas (Pod y Galpón) ---------- */
  ventanas(on) {
    if (this._modo !== 'param' || !root || !this._m) return false;
    if (on && !VE) { const P = this._m._P; VE = { vx: P.ventanas.map(v => ({ m: v.m, en: v.en, a: v.a, ...(v.vidriera ? { vidriera: true } : {}) })), sel: null, drag: null };
      O.autoRotate = false; this.puertas(false); this.techo('trans'); encuadre('def') }
    if (!on && VE) { VE = null; this.techo('ver') }
    this._veMarca(); this._panel(); if (this._bar) this._bar.querySelectorAll('[data-vedit]').forEach(b => { b.setAttribute('aria-pressed', !!VE); b.textContent = VE ? '✓ listo' : '✎ editar' });
    if (this.vxFin) this.vxFin(!!VE); return true;
  },
  get editandoVentanas() { return !!VE },
  _veLibre(k, en, a, menos) { // ¿entra una ventana de ancho a centrada en en, en la pared k?
    const P = this._m._P, Lp = window.SBUparam.largoPared(k, P.ancho, P.prof);
    if (en - a / 2 < .15 || en + a / 2 > Lp - .15) return false;
    const otras = [...P.puertas.filter(p => p.m === k), ...VE.vx.filter((v, j) => v.m === k && j !== menos)];
    return otras.every(o => Math.abs(o.en - en) >= (o.a + a) / 2 + .1);
  },
  _veMover(i, en) { const v = VE.vx[i], P = this._m._P, Lp = window.SBUparam.largoPared(v.m, P.ancho, P.prof);
    en = Math.round(Math.max(v.a / 2 + .15, Math.min(Lp - v.a / 2 - .15, en)) * 20) / 20; if (Math.abs(en - v.en) < .01 || !this._veLibre(v.m, en, v.a, i)) return false; v.en = en; return true },
  _veHueco(k, a, menos) { const P = this._m._P, Lp = window.SBUparam.largoPared(k, P.ancho, P.prof);
    for (let d = 0; d <= Lp / 2; d += .05) for (const s of [1, -1]) { const en = Math.round((Lp / 2 + s * d) * 20) / 20; if (this._veLibre(k, en, a, menos)) return en } return null },
  _veArmar() { if (this._veRaf) return; this._veRaf = requestAnimationFrame(() => { this._veRaf = 0; if (!VE || !this._m) return;
    const mm = window.SBUparam.virtual(this._m, Object.assign({}, this._m.p, { vx: VE.vx }), null); this._montar(...this._armar(mm, this._cfg), true); this.aplicar(this._cfg, this._D, mm) }) },
  _veGuardar() { if (this.vxCb) this.vxCb(VE.vx.map(v => Object.assign({}, v))) },
  _veMarca() { if (marca) { S.remove(marca); marca = null } if (!VE || VE.sel == null || !root) return; let g = null; root.traverse(o => { if (o.userData && o.userData.vi === VE.sel) g = o });
    if (!g) return; const b = new THREE.Box3().setFromObject(g).expandByScalar(.06); marca = new THREE.Box3Helper(b, new THREE.Color('#ffb347')); S.add(marca) },
  _veAcc(a) {
    if (!VE) return; const P = this._m._P, i = VE.sel, v = i != null ? VE.vx[i] : null, gal = this._m.param === 'galpon';
    if (a === 'ok') return this.ventanas(false);
    if (a === 'fab') { if (this.vxCb) this.vxCb(null); VE.sel = null; setTimeout(() => { if (VE) { VE.vx = this._m._P.ventanas.map(x => ({ m: x.m, en: x.en, a: x.a, ...(x.vidriera ? { vidriera: true } : {}) })); this._veMarca(); this._panel() } }, 60); return }
    if (a === 'add') { const k = v ? v.m : 'S', w0 = gal ? 2 : 1; let ok = null;
      for (const kk of [k, 'S', 'E', 'O', 'N']) for (const ww of [w0, .8, .6]) { const en = this._veHueco(kk, ww); if (en != null) { ok = { m: kk, en, a: ww }; break } } 
      if (!ok) { this._veMsg = 'No entra otra ventana'; return this._panel() }
      VE.vx.push(ok); VE.sel = VE.vx.length - 1 }
    else if (!v) return;
    else if (a === 'del') { VE.vx.splice(i, 1); VE.sel = null }
    else if (a === 'izq' || a === 'der') { if (!this._veMover(i, v.en + (a === 'der' ? .1 : -.1))) { this._veMsg = 'Ahí choca con otra abertura'; return this._panel() } }
    else if (a === 'w-' || a === 'w+') { const na = Math.round((v.a + (a === 'w+' ? .1 : -.1)) * 10) / 10; if (na < .4) return;
      const Lp = window.SBUparam.largoPared(v.m, P.ancho, P.prof), en = Math.max(na / 2 + .15, Math.min(Lp - na / 2 - .15, v.en));
      if (!this._veLibre(v.m, en, na, i)) { this._veMsg = 'No hay lugar para más ancho'; return this._panel() } v.a = na; v.en = en }
    else if (a.startsWith('m:')) { const k = a.slice(2); if (k === v.m) return; let aa = v.a, en = null; while (aa >= .4 && (en = this._veHueco(k, aa, i)) == null) aa = Math.round((aa - .2) * 10) / 10;
      if (en == null) { this._veMsg = 'En esa pared no hay lugar'; return this._panel() } v.m = k; v.en = en; v.a = aa }
    this._veMsg = ''; this._veArmar(); this._veGuardar(); setTimeout(() => { this._veMarca(); this._panel() }, 30);
  },
  _vePanel() {
    const v = VE.sel != null ? VE.vx[VE.sel] : null, msg = this._veMsg ? `<small style="color:#ffb347">${this._veMsg}</small>` : ''; this._veMsg = '';
    this._sel.hidden = false;
    this._sel.innerHTML = `<b>Editando ventanas · ${VE.vx.length}</b>` + (v ? `<div class="v3dim"><span>Pared</span>${Object.entries(PARED).map(([k, n]) => `<button type="button" data-ve="m:${k}" aria-pressed="${v.m === k}">${n}</button>`).join('')}</div>
      <div class="v3dim"><span>Ancho</span><button type="button" data-ve="w-">−</button><b>${v.a.toFixed(2).replace('.', ',')} m</b><button type="button" data-ve="w+">+</button></div>
      <div class="v3dim"><span>Mover</span><button type="button" data-ve="izq">◀</button><button type="button" data-ve="der">▶</button><button type="button" data-ve="del">Borrar</button></div>
      <small>Arrastrala por la pared para moverla</small>` : `<small>Tocá una ventana para elegirla y arrastrala por la pared</small>`) + msg +
      `<div class="v3dim"><button type="button" data-ve="add">+ Agregar ventana</button><button type="button" data-ve="ok">Listo</button></div><div class="v3dim"><button type="button" data-ve="fab">Volver a las originales</button></div>`;
  },
  aplicar(cfg, D, m) {
    if (!root) return; this._dirty = true;
    if (this._modo === 'param') return this._pintarP(cfg, D, m);
    const ext = D.exterior.find(e => e.id === cfg.ext);
    pintar(GRUPO.ext, ext && ext.tex ? Object.assign({ _ext: 1 }, ext) : null, 2);
    const op = (lista, id) => { const L = D[lista]; return L && L.activo !== false ? (L.opciones.find(o => o.id === id) || L.opciones[0]) : null };
    if (!m.config || m.config.includes('techo')) pintar(GRUPO.techo, op('techo', cfg.techo), 2);
    if (!m.config || m.config.includes('int')) { const o = op('interior', cfg.int); pintar(GRUPO.int, o && !o.original ? o : null, 1.6) }
    if (!m.config || m.config.includes('pis')) { const o = op('pisos', cfg.pis); pintar(GRUPO.pis, o && !o.original ? o : null, 1.6) }
  },
  _pintarP(cfg, D, m) {
    const op = (lista, id) => { const L = D[lista]; return L && L.activo !== false ? (L.opciones.find(o => o.id === id) || L.opciones[0]) : null };
    const pin = (k, o, metros) => PB.PINTA[k].forEach(n => { const mt = PB.MAT[n]; if (!mt) return; const u = mt.userData;
      if (!u.def) u.def = { c: mt.color.clone(), map: mt.map };
      if (!o || (!o.tex && !o.color)) { mt.color.copy(u.def.c); mt.map = u.def.map } else { mt.map = o.tex ? textura(o, metros) : u.def.map; mt.color.set(o.tex ? '#ffffff' : o.color) }
      mt.needsUpdate = true });
    const on = k => m.config && m.config.includes(k);
    if (on('ext')) { const ext = D.exterior.find(e => e.id === cfg.ext) || D.exterior.find(e => e.id === m.revOriginal); pin('ext', ext && ext.tex ? Object.assign({ _ext: 1 }, ext) : null, 2) }
    if (on('techo')) pin('techo', op('techo', cfg.techo), 2);
    if (on('int')) { const o = op('interior', cfg.int); pin('int', o && !o.original ? o : null, 1.6) }
    if (on('pis')) { const o = op('pisos', cfg.pis); pin('pis', o && !o.original ? o : null, 1.6) }
  },
  vista(k) { if (k === 'conf') k = 'def'; encuadre(k === 'extra' ? 'int' : k); this.techo(k === 'int' || k === 'pis' || k === 'extra' ? 'trans' : 'ver'); if (k === 'ext' || k === 'techo') this.muros('ver') },
  // techo: 'ver' | 'trans' | 'subir' | 'off' · muros: 'ver' | 'trans' (animado)
  techo(modo) {
    this._techo = modo; const h = caja ? caja.getSize(new THREE.Vector3()).y : 3;
    TG.techoOp = { ver: 1, trans: .16, subir: 1, off: 0 }[modo]; TG.techoLift = modo === 'subir' ? Math.min(h * .35, 2.2) : 0; this._dirty = true;
    if (this._bar) this._bar.querySelectorAll('[data-t]').forEach(b => b.setAttribute('aria-pressed', b.dataset.t === modo));
  },
  _pbtn() { if (!this._bar) return; const ab = puertas.length && puertas.every(d => d.tg === 1), ce = puertas.every(d => d.tg === 0);
    this._bar.querySelectorAll('[data-p]').forEach(b => b.setAttribute('aria-pressed', b.dataset.p === '1' ? ab : ce)) },
  puertas(abrir) { puertas.forEach(d => d.tg = abrir ? 1 : 0); this._pbtn() },
  muros(modo) {
    TG.murosOp = modo === 'trans' ? .14 : 1; this._dirty = true;
    if (this._bar) this._bar.querySelectorAll('[data-m]').forEach(b => b.setAttribute('aria-pressed', b.dataset.m === modo));
  },
  _scr() { return puertas.map(d => { const b = new THREE.Box3().setFromObject(d.mallas[0]), v = b.getCenter(new THREE.Vector3()).project(C), r = R.domElement.getBoundingClientRect(); return [d.el, r.left + (v.x + 1) / 2 * r.width, r.top + (1 - v.y) / 2 * r.height, d.tg] }) },
  _scrM() { return mods.map(g => { const v = new THREE.Box3().setFromObject(g).getCenter(new THREE.Vector3()).project(C), r = R.domElement.getBoundingClientRect(); return [g.userData.md.id, r.left + (v.x + 1) / 2 * r.width, r.top + (1 - v.y) / 2 * r.height] }) },
  get info() { return Object.fromEntries(Object.entries(partes).map(([k, v]) => [k, v.map(x => x.name)])) },
  cerrar() { cancelAnimationFrame(raf); if (VE && this.vxFin) this.vxFin(false); VE = null; marca = null; if (MORPH) { MORPH.ok(false); MORPH = null } this._modo = null; this._mid = null; this._bar = null; puertas = []; mods = []; sel = null; piso = null; drag = null; Object.assign(ST, { techoOp: 1, techoLift: 0, murosOp: 1 }); Object.assign(TG, ST); if (this._ro) this._ro.disconnect(); if (R) { R.dispose(); R.forceContextLoss && R.forceContextLoss() } R = null; root = null; caja = null },
};
window.dispatchEvent(new Event('sbuvisor'));
