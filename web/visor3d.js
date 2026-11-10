/* Visor 3D propio (three.js) para los modelos que todavía no tienen Sketchfab.
   Carga un .glb, deja girar/acercar, y cambia fachada, techo, interior y pisos según el configurador.
   Uso: SBUvisor.abrir(contenedor, modelo, url) · SBUvisor.aplicar({ext, techo, int, pis}) · SBUvisor.vista('ext'|'techo'|'int'|'pis') */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let R = null, S, C, O, root, partes = {}, orig = {}, caja, raf = 0, cache = {};
const GRUPO = { ext: 'Muros exteriores', techo: 'Techo', int: 'Muros interiores', pis: 'Platea y piso' };

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
    const loop = () => { raf = requestAnimationFrame(loop); O.update(); R.render(S, C) }; loop();
    return new Promise(ok => new GLTFLoader().load(url, g => {
      root = g.scene; partes = {}; orig = {};
      root.traverse(o => { if (!o.isMesh) return; o.geometry = uvCaja(o.geometry); o.geometry.computeVertexNormals(); o.castShadow = o.receiveShadow = true;
        const nm = x => String(x || '').replace(/_/g, ' '); const ns = [nm(o.name), nm(o.parent && o.parent.name), nm(o.material && o.material.name)]; const key = Object.values(GRUPO).find(k => ns.some(n => n.startsWith(k)));
        if (key) (partes[key] = partes[key] || []).push(o); orig[o.uuid] = o.material });
      S.add(root); caja = new THREE.Box3().setFromObject(root); encuadre('def', false); ok(true);
    }, undefined, () => { el.innerHTML = '<div class="v3msg">No se pudo cargar el 3D.</div>'; ok(false) }));
  },
  aplicar(cfg, D, m) {
    if (!root) return; const ext = D.exterior.find(e => e.id === cfg.ext);
    pintar(GRUPO.ext, ext && ext.tex ? Object.assign({ _ext: 1 }, ext) : null, 2);
    const op = (lista, id) => { const L = D[lista]; return L && L.activo !== false ? (L.opciones.find(o => o.id === id) || L.opciones[0]) : null };
    if (!m.config || m.config.includes('techo')) pintar(GRUPO.techo, op('techo', cfg.techo), 2);
    if (!m.config || m.config.includes('int')) { const o = op('interior', cfg.int); pintar(GRUPO.int, o && !o.original ? o : null, 1.6) }
    if (!m.config || m.config.includes('pis')) { const o = op('pisos', cfg.pis); pintar(GRUPO.pis, o && !o.original ? o : null, 1.6) }
  },
  vista(k) { encuadre(k) },
  get info() { return Object.fromEntries(Object.entries(partes).map(([k, v]) => [k, v.map(x => x.name)])) },
  cerrar() { cancelAnimationFrame(raf); if (this._ro) this._ro.disconnect(); if (R) { R.dispose(); R.forceContextLoss && R.forceContextLoss() } R = null; root = null; caja = null },
};
window.dispatchEvent(new Event('sbuvisor'));
