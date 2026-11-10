/* Constructor 3D de los modelos configurables (Pod y Galpón).
   Arma un THREE.Group con los mismos grupos que los .glb (Muros exteriores, Techo, Aberturas...) para que
   el visor los pinte, los transparente y anime puertas y ventanas. Todo en metros:
   x de la planta → X, y de la planta → Z (el frente, lado S, mira a +Z), el piso terminado en y0. */
export function crear(THREE) {
  const MAT = {};
  const mat = (k, o = {}) => MAT[k] || (MAT[k] = Object.assign(new THREE.MeshStandardMaterial(Object.assign({ roughness: .8 }, o)), { name: k }));
  const vidrio = () => { const m = mat('Vidrio', { color: '#a9c3cc', roughness: .05, metalness: .2, transparent: true, opacity: .32, depthWrite: false }); m.userData.op0 = .32; return m };
  // qué materiales pinta cada categoría del configurador
  const PINTA = { ext: ['Revestimiento'], int: ['Interior blanco', 'Interior tabiques', 'Cielorraso'], pis: ['Piso'], techo: ['Chapa techo'] };

  /* texturas propias: chapa acanalada, isopanel, techo y balasto */
  const texCache = {};
  function lienzo(key, dib, rep = 2) {
    if (texCache[key]) return texCache[key];
    const c = document.createElement('canvas'); c.width = c.height = 512; dib(c.getContext('2d'));
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1 / rep, 1 / rep); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
    return texCache[key] = t;
  }
  const mezcla = (hex, k) => { const c = new THREE.Color(hex); c.offsetHSL(0, 0, k); return '#' + c.getHexString() };
  const chapa = (col, vert = true) => lienzo('chapa' + col + vert, g => {
    g.fillStyle = col; g.fillRect(0, 0, 512, 512); const n = 26, p = 512 / n;
    for (let i = 0; i < n; i++) { const gr = vert ? g.createLinearGradient(i * p, 0, (i + 1) * p, 0) : g.createLinearGradient(0, i * p, 0, (i + 1) * p);
      gr.addColorStop(0, mezcla(col, .1)); gr.addColorStop(.35, mezcla(col, -.04)); gr.addColorStop(.7, mezcla(col, -.09)); gr.addColorStop(1, mezcla(col, .06));
      g.fillStyle = gr; vert ? g.fillRect(i * p, 0, p, 512) : g.fillRect(0, i * p, 512, p) }
  });
  const panel = col => lienzo('panel' + col, g => {
    g.fillStyle = col; g.fillRect(0, 0, 512, 512);
    for (let y = 0; y < 512; y += 16) { g.fillStyle = y % 32 ? 'rgba(255,255,255,.035)' : 'rgba(0,0,0,.035)'; g.fillRect(0, y, 512, 8) }
    g.fillStyle = 'rgba(0,0,0,.35)'; [0, 256].forEach(y => g.fillRect(0, y, 512, 3)); g.fillStyle = 'rgba(255,255,255,.18)'; [3, 259].forEach(y => g.fillRect(0, y, 512, 2));
  });
  /* Isoroof: chapa trapezoidal (valle ancho, nervio alto), 4 nervios por metro */
  const trapecio = (col, vert = true) => lienzo('trap' + col + vert, g => {
    const n = 8, p = 512 / n, L = (x, w, c) => vert ? (g.fillStyle = c, g.fillRect(x, 0, w, 512)) : (g.fillStyle = c, g.fillRect(0, x, 512, w));
    L(0, 512, col);
    for (let i = 0; i < n; i++) { const x = i * p;
      L(x + p * .16, p * .04, mezcla(col, -.05));            // pliegue del valle
      L(x + p * .55, p * .1, mezcla(col, .09));             // ala que recibe luz
      L(x + p * .65, p * .2, mezcla(col, .05));             // cresta del nervio
      L(x + p * .85, p * .1, mezcla(col, -.13));            // ala en sombra
      L(x + p * .95, p * .02, mezcla(col, -.2)) }
  });
  const ripio = () => lienzo('ripio', g => {
    g.fillStyle = '#a39d92'; g.fillRect(0, 0, 512, 512); let s = 7; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 9000; i++) { const v = 120 + r() * 90 | 0; g.fillStyle = `rgb(${v},${v - 6},${v - 14})`; g.fillRect(r() * 512, r() * 512, 2 + r() * 5, 2 + r() * 4) }
  }, 1.5);
  const tablas = () => lienzo('deck', g => {
    for (let i = 0; i < 16; i++) { const v = (i * 37) % 7; g.fillStyle = ['#8d6646', '#97704e', '#86603f', '#9a7350', '#8a6243', '#92694a', '#7f5b3d'][v]; g.fillRect(0, i * 32, 512, 30); g.fillStyle = '#4a3322'; g.fillRect(0, i * 32 + 30, 512, 2) }
  }, 2);

  /* UV por proyección de caja (1 unidad = 1 m), igual que el visor */
  function uv(g) {
    g = g.index ? g.toNonIndexed() : g; const p = g.attributes.position, uvs = new Float32Array(p.count * 2);
    const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), n = new THREE.Vector3(), t = new THREE.Vector3();
    for (let i = 0; i < p.count; i += 3) {
      a.fromBufferAttribute(p, i); b.fromBufferAttribute(p, i + 1); c.fromBufferAttribute(p, i + 2);
      n.copy(c).sub(b).cross(t.copy(a).sub(b)).normalize(); const ax = Math.abs(n.x), ay = Math.abs(n.y), az = Math.abs(n.z);
      [a, b, c].forEach((v, k) => { const [u, w] = ay >= ax && ay >= az ? [v.x, v.z] : ax >= az ? [v.z, v.y] : [v.x, v.y]; uvs[(i + k) * 2] = u; uvs[(i + k) * 2 + 1] = w });
    }
    g.setAttribute('uv', new THREE.BufferAttribute(uvs, 2)); g.computeVertexNormals(); return g;
  }
  function malla(g, geo, m, x = 0, y = 0, z = 0) { const o = new THREE.Mesh(uv(geo), m); o.position.set(x, y, z); o.castShadow = !m.transparent; o.receiveShadow = true; g.add(o); return o }
  // caja apoyada: (x, z) es el centro en planta, y la base
  const bx = (g, w, h, d, x, y, z, m) => malla(g, new THREE.BoxGeometry(Math.max(w, .005), Math.max(h, .005), Math.max(d, .005)), m, x, y + h / 2, z);
  const grupo = (padre, n) => { const g = new THREE.Group(); g.name = n; padre.add(g); return g };

  /* una hoja de ventana o puerta vidriada: marco de aluminio + 1 o 2 vidrios (DVH) */
  function hoja(w, h, dvh, alu) {
    const g = new THREE.Group(), f = .045, V = vidrio();
    bx(g, w, f, .045, w / 2, 0, 0, alu); bx(g, w, f, .045, w / 2, h - f, 0, alu); bx(g, f, h, .045, f / 2, 0, 0, alu); bx(g, f, h, .045, w - f / 2, 0, 0, alu);
    const vs = (dvh ? [-.009, .009] : [0]).map(z => bx(g, w - 2 * f, h - 2 * f, .004, w / 2, f, z, V));
    return { g, vs };
  }

  function construir(m, cfg, SBP) {
    const P = m._P, gal = m.param === 'galpon', p = m.p || {}, w = P.ancho, l = P.prof, e = P.eExt, H = P._H;
    const y0 = gal ? .15 : .5, Hc = gal ? H + Math.max(1, w * .12) : H, shed = !gal && p.uso === 'shed';
    const xs = (cfg && cfg.extras) || {}, anim = [];
    const root = new THREE.Group(); root.name = m.id;
    const gMur = grupo(root, 'Muros exteriores'), gTec = grupo(root, 'Techo'), gAb = grupo(root, 'Aberturas'), gPis = grupo(root, 'Platea y piso'),
      gInt = grupo(root, 'Muros interiores'), gMue = grupo(root, 'Muebles'), gEst = grupo(root, 'Estructura'), gExt = grupo(root, 'Exterior');
    const alu = mat('Aluminio', { color: '#2b2d31', roughness: .45, metalness: .4 }), acero = mat('Acero', { color: '#2e3034', roughness: .5, metalness: .5 });
    const madera = mat('Madera muebles', { color: '#b08a62' }), blanco = mat('Blanco muebles', { color: '#ebe8e1' }), tela = mat('Tela', { color: '#7d8a8f', roughness: 1 });
    const loza = mat('Loza', { color: '#f4f4f2', roughness: .3 }), lapacho = mat('Lapacho', { color: '#7e5236', roughness: .7 });

    /* ---------- base y piso ---------- */
    if (gal) {
      const pl = p.base !== 'sin';
      bx(gPis, w + 2 * e + .3, y0 - (pl ? .01 : .1), l + 2 * e + .3, w / 2, 0, l / 2, mat('Hormigón', { color: '#a9a59c', roughness: .95 }));
      const fl = pl ? mat('Piso', { color: '#bdb8ae', roughness: .55 }) : mat('Balasto', { color: '#ffffff', roughness: 1, map: ripio() });
      bx(gPis, w, .01, l, w / 2, pl ? y0 - .01 : y0 - .09, l / 2, fl);
      bx(gExt, w + 2 * e + .3, .1, 3, w / 2, 0, l + e + 1.65, mat('Vereda', { color: '#b3aea4', roughness: .95 }));
    } else {
      bx(gPis, w + 2 * e, .22, l + 2 * e, w / 2, y0 - .22, l / 2, mat('Base', { color: '#3a3c40' }));
      bx(gPis, w, .01, l, w / 2, y0 - .005, l / 2, mat('Piso', { color: '#cdbb9c', roughness: .6 }));
      const hor = mat('Pilote', { color: '#9d9890', roughness: 1 }), nx = Math.max(2, Math.ceil(w / 1.8) + 1), nz = Math.max(2, Math.ceil(l / 1.8) + 1);
      for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) bx(gPis, .2, y0 - .22, .2, i * w / (nx - 1), 0, j * l / (nz - 1), hor);
    }

    /* ---------- muros exteriores, con sus vanos ---------- */
    const rev = gal ? (() => { let c = (SBP.G.galpon.color.ops.find(o => o.id === p.color) || SBP.G.galpon.color.ops[0]).c;
      if (p.cerr === 'panel') c = '#5b6066'; return mat('Cerramiento ' + p.cerr + c, { color: '#ffffff', map: p.cerr === 'panel' ? trapecio(c) : chapa(c), roughness: p.cerr === 'panel' ? .5 : .45, metalness: .25 }) })() : mat('Revestimiento', { color: '#b98f62' });
    const intM = gal ? mat('Interior galpón ' + p.cerr, { color: p.cerr === 'panel' ? '#eceae4' : '#b7bbbf', map: p.cerr === 'panel' ? null : chapa('#c4c8cc'), metalness: p.cerr === 'panel' ? 0 : .3, side: THREE.DoubleSide })
      : shed ? mat('Interior OSB', { color: '#c8a774', side: THREE.DoubleSide }) : mat('Interior blanco', { color: '#efece6', side: THREE.DoubleSide });
    const lados = [
      { k: 'S', L: w + 2 * e, pos: [-e, y0, l], rot: 0, u: o => e + o.en, gable: gal, c: [e, w + e] },
      { k: 'N', L: w + 2 * e, pos: [w + e, y0, 0], rot: Math.PI, u: o => w + e - o.en, gable: gal, c: [e, w + e] },
      { k: 'E', L: l, pos: [w, y0, l], rot: Math.PI / 2, u: o => l - o.en, c: [0, l] },
      { k: 'O', L: l, pos: [0, y0, 0], rot: -Math.PI / 2, u: o => o.en, c: [0, l] },
    ];
    const ops = [...P.ventanas.map((o, i) => Object.assign({ _t: 'v', _i: i }, o)), ...P.puertas.map(o => Object.assign({ _t: 'p' }, o))];
    let nv = 0, nd = 0;
    lados.forEach(L => {
      const alto = u => L.gable ? H + (Hc - H) * Math.max(0, 1 - Math.abs(u - L.L / 2) / (L.L / 2)) : H;
      const mias = ops.filter(o => o.m === L.k).map(o => { const [zb, zc] = SBP.alturas(m.param, o, L.k, H), c = L.u(o); return { o, a: c - o.a / 2, b: c + o.a / 2, zb, zc } }).sort((q, r) => q.a - r.a);
      const forma = (u0, u1) => {
        const s = new THREE.Shape(); s.moveTo(u0, 0);
        mias.filter(q => q.zb < .02).forEach(q => { s.lineTo(q.a, 0); s.lineTo(q.a, q.zc); s.lineTo(q.b, q.zc); s.lineTo(q.b, 0) });
        s.lineTo(u1, 0); s.lineTo(u1, alto(u1)); if (L.gable && u0 < L.L / 2 && L.L / 2 < u1) s.lineTo(L.L / 2, alto(L.L / 2)); s.lineTo(u0, alto(u0)); s.closePath();
        mias.filter(q => q.zb >= .02).forEach(q => { const h = new THREE.Path(); h.moveTo(q.a, q.zb); h.lineTo(q.b, q.zb); h.lineTo(q.b, q.zc); h.lineTo(q.a, q.zc); h.closePath(); s.holes.push(h) });
        return s;
      };
      const g = grupo(gMur, 'Muro ' + L.k); g.position.set(...L.pos); g.rotation.y = L.rot;
      malla(g, new THREE.ExtrudeGeometry(forma(0, L.L), { depth: e - .01, bevelEnabled: false }), rev, 0, 0, .01);
      malla(g, new THREE.ShapeGeometry(forma(L.c[0], L.c[1])), intM, 0, 0, -.004).castShadow = false;
      // carpinterías del muro
      const gaM = grupo(gAb, 'Aberturas ' + L.k); gaM.position.set(...L.pos); gaM.rotation.y = L.rot;
      mias.forEach(q => {
        const { o, a, b, zb, zc } = q, W = b - a, Hh = zc - zb, f = .05, zm = e / 2;
        let ga = gaM; if (o._t === 'v') { ga = new THREE.Group(); ga.name = 'Ventana ' + (o._i + 1); ga.userData.vi = o._i; gaM.add(ga) }
        bx(ga, f, Hh, .07, a + f / 2, zb, zm, alu); bx(ga, f, Hh, .07, b - f / 2, zb, zm, alu); bx(ga, W, f, .07, (a + b) / 2, zc - f, zm, alu);
        if (o._t === 'v') {
          bx(ga, W + .08, .03, e + .06, (a + b) / 2, zb - .03, zm + .02, alu); // alféizar
          const iw = W - 2 * f, ih = Hh - 2 * f, dvh = gal || p.vidrio !== 'simple', nom = 'Ventana ' + (++nv);
          if (o.vidriera) { // vidriera de local: paños fijos con parantes
            const n = Math.max(1, Math.round(iw / 1.2)); bx(ga, W, f, .07, (a + b) / 2, zb, zm, alu);
            for (let i = 0; i < n; i++) { const h = hoja(iw / n, ih, true, alu); h.g.position.set(a + f + i * iw / n, zb + f, zm); ga.add(h.g) }
            return;
          }
          bx(ga, W, f, .07, (a + b) / 2, zb, zm, alu);
          if (gal || p.vent !== 'batiente') { // corrediza: la hoja exterior se desliza sobre la otra
            const sw = iw / 2 + .03, h1 = hoja(sw, ih, dvh, alu), h2 = hoja(sw, ih, dvh, alu);
            h1.g.position.set(a + f, zb + f, zm - .025); h2.g.position.set(b - f - sw, zb + f, zm + .025); ga.add(h1.g, h2.g);
            const x0 = h2.g.position.x, d = { el: nom, t: 0, tg: 0, mallas: [...h2.vs, ...h1.vs], aplicar() { h2.g.position.x = x0 - this.t * (sw - .07) } }; anim.push(d);
          } else { // batiente: una o dos hojas que abren hacia afuera
            const dos = iw > 1.25, hw = dos ? iw / 2 : iw, hs = [];
            [0, 1].slice(0, dos ? 2 : 1).forEach(i => { const h = hoja(hw, ih, dvh, alu), piv = new THREE.Group();
              piv.position.set(i ? b - f : a + f, zb + f, zm + .03); h.g.position.x = i ? -hw : 0; piv.add(h.g); ga.add(piv); hs.push([piv, i, h]) });
            const d = { el: nom, t: 0, tg: 0, mallas: hs.flatMap(x => x[2].vs), aplicar() { hs.forEach(([pv, i]) => { pv.rotation.y = (i ? 1 : -1) * this.t * 1.25 }) } }; anim.push(d);
          }
        } else {
          const nom = (W >= 3 ? 'Portón ' : 'Puerta ') + (++nd);
          if (W >= 3) { // portón seccional: se enrolla hacia arriba
            const piv = new THREE.Group(); piv.position.set((a + b) / 2, zc - f, zm); ga.add(piv);
            const col = gal ? (p.cerr === 'panel' ? '#5b6066' : (SBP.G.galpon.color.ops.find(o => o.id === p.color) || {}).c || '#2a2c2f') : '#2a2c2f';
            const pm = mat('Portón ' + col, { color: '#ffffff', map: chapa(mezcla(col, .06), false), metalness: .3, roughness: .5 });
            const pa = bx(piv, W - 2 * f, Hh - f, .05, 0, -(Hh - f), 0, pm);
            bx(ga, W + .3, .35, .4, (a + b) / 2, zc, zm - .25, alu); // cajón del rollo
            anim.push({ el: nom, porton: 1, t: 0, tg: 0, mallas: [pa], aplicar() { piv.scale.y = 1 - .95 * this.t } });
          } else {
            const vid = !gal || o.giro < 0 || W < 1.2 && ops.some(v => v.vidriera), hw = W - 2 * f, hh = Hh - f, piv = new THREE.Group(), izq = (o.giro || 1) > 0;
            piv.position.set(izq ? a + f : b - f, zb, zm + .03); ga.add(piv); let ms;
            if (vid) { const h = hoja(hw, hh, true, alu); h.g.position.x = izq ? 0 : -hw; piv.add(h.g); ms = h.vs; bx(h.g, .03, .5, .06, izq ? hw - .1 : .1, 1, .04, mat('Manija', { color: '#c9c9c9', metalness: .8, roughness: .3 })) }
            else ms = [bx(piv, hw, hh, .045, izq ? hw / 2 : -hw / 2, 0, 0, mat('Puerta chapa', { color: '#3a3d42', metalness: .3, roughness: .5 }))];
            anim.push({ el: nom, t: 0, tg: 0, mallas: ms, aplicar() { piv.rotation.y = (izq ? -1 : 1) * this.t * 1.5 } });
          }
        }
      });
    });

    /* ---------- tabiques interiores y sus puertas ---------- */
    const tab = mat('Interior tabiques', { color: '#efece6' }), pmad = mat('Puerta madera', { color: '#c49a6c' });
    (P.muros || []).forEach(t => {
      const [x1, z1, x2, z2] = t, ancho = t[4] || P.eInt, hi = t[5] || H, hor = Math.abs(z2 - z1) < .001, L0 = hor ? Math.min(x1, x2) : Math.min(z1, z2), len = hor ? Math.abs(x2 - x1) : Math.abs(z2 - z1);
      const ds = P.puertas.filter(d => Array.isArray(d.m) && d.m.join() === [x1, z1, x2, z2].join()).map(d => [d.en - d.a / 2, d.en + d.a / 2, d]).sort((a, b) => a[0] - b[0]);
      const pz = (u0, u1, yb, yt) => { if (u1 - u0 < .01) return; const c = L0 + (u0 + u1) / 2; hor ? bx(gInt, u1 - u0, yt - yb, ancho, c, y0 + yb, z1, tab) : bx(gInt, ancho, yt - yb, u1 - u0, x1, y0 + yb, c, tab) };
      let u = 0; ds.forEach(([a, b, d]) => {
        pz(u, a, 0, hi); pz(a, b, 2.05, hi); u = b;
        const piv = new THREE.Group(), hw = d.a - .04, pos = L0 + a + .02; piv.position.set(hor ? pos : x1, y0, hor ? z1 : pos); gInt.add(piv);
        const hj = hor ? bx(piv, hw, 2.02, .04, hw / 2, 0, 0, pmad) : bx(piv, .04, 2.02, hw, 0, 0, hw / 2, pmad);
        anim.push({ el: 'Puerta ' + (++nd), t: 0, tg: 0, mallas: [hj], aplicar() { piv.rotation.y = (hor ? 1 : -1) * this.t * 1.4 } });
      });
      pz(u, len, 0, hi);
    });

    /* ---------- techo ---------- */
    const tch = gal && p.cerr === 'panel' ? mat('Isoroof techo', { color: '#ffffff', map: trapecio('#5b6066', false), metalness: .3, roughness: .5 }) : mat('Chapa techo', { color: '#26282b', map: chapa('#d6d6d6', false), metalness: .35, roughness: .5 });
    if (gal) {
      const al = .45, run = w / 2 + e + al, ang = Math.atan2(Hc - H, w / 2), Ls = run / Math.cos(ang), Lz = l + 2 * e + .5;
      [-1, 1].forEach(s => { const g = new THREE.Group(); g.position.set(w / 2, y0 + Hc + .06, l / 2); g.rotation.z = s * -ang; gTec.add(g);
        bx(g, Ls, .06, Lz, s * Ls / 2, 0, 0, tch); bx(g, .12, .14, Lz, s * (Ls - .06), -.12, 0, mat('Canaleta', { color: '#3a3c40', metalness: .4 })) });
      bx(gTec, .3, .06, l + 2 * e + .5, w / 2, y0 + Hc + .1, l / 2, mat('Cumbrera', { color: '#33363a', metalness: .4 }));
      // pórticos metálicos (columnas y vigas a la vista)
      const n = Math.max(2, Math.ceil(l / 5)), st = mat('Estructura', { color: '#3b3f45', metalness: .5, roughness: .45 });
      for (let i = 0; i <= n; i++) { const z = Math.min(l - .15, Math.max(.15, i * l / n));
        [.12, w - .12].forEach(x => bx(gEst, .18, H, .26, x, y0, z, st));
        [-1, 1].forEach(s => { const L2 = (w / 2) / Math.cos(ang), r = new THREE.Group(); r.position.set(w / 2, y0 + Hc - .2, z); r.rotation.z = s * -ang; gEst.add(r); bx(r, L2, .3, .14, s * L2 / 2, -.15, 0, st) }) }
    } else {
      const al = .25;
      bx(gTec, w + 2 * e + 2 * al, .2, l + 2 * e + 2 * al, w / 2, y0 + H, l / 2, tch);
      bx(gTec, w + 2 * e + 2 * al + .02, .06, l + 2 * e + 2 * al + .02, w / 2, y0 + H + .2, l / 2, mat('Babeta', { color: '#2b2d31', metalness: .4 }));
      bx(gTec, w, .01, l, w / 2, y0 + H - .012, l / 2, mat('Cielorraso', { color: '#f2f0ea', side: THREE.DoubleSide }));
    }

    /* ---------- deck y extras de afuera ---------- */
    if (!gal && !shed) {
      const dd = xs['deck-extra'] ? 3 : 1.5, dk = mat('Deck', { color: '#ffffff', map: tablas() }), dw = w + 2 * e + .4;
      bx(gExt, dw, .08, dd, w / 2, y0 - .1, l + e + dd / 2, dk);
      [[.29, .15], [.15, .45]].forEach(([t, dz]) => bx(gExt, 1.2, .06, .3, w / 2, t - .06, l + e + dd + dz, dk));
    }
    if (!gal && xs['surf-rack']) { // rack de surf parado al costado oeste, cerca del frente
      const g = grupo(gExt, 'Rack de surf'), z = l - .55, x = -e - .5;
      bx(g, .5, .08, 1.2, x, 0, z, lapacho); bx(g, .06, 1.8, 1.2, x + .2, 0, z, lapacho); bx(g, .5, .06, .06, x, 1.7, z - .57, lapacho); bx(g, .5, .06, .06, x, 1.7, z + .57, lapacho);
      ['#f4f1e8', '#5fb3b0', '#e8c25b'].forEach((c, i) => { const s = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 12), mat('Tabla ' + c, { color: c, roughness: .35 }));
        s.scale.set(.03, 1.0, .24); s.rotation.z = -.12; s.position.set(x - .02, 1.1, z - .36 + i * .36); s.castShadow = true; g.add(s) });
    }
    if (!gal && xs['ducha-exterior']) { // ducha en el muro este
      const g = grupo(gExt, 'Ducha exterior'), z = Math.max(.55, (l / 2 - .6) / 2), x = w + e;
      for (let i = 0; i < 6; i++) bx(g, .9, .04, .13, x + .5, .02, z - .4 + i * .16, lapacho);
      const cr = mat('Cromo', { color: '#d4d6d8', metalness: .9, roughness: .2 });
      bx(g, .04, 2.15, .04, x + .06, .06, z, cr); bx(g, .3, .03, .03, x + .2, 2.18, z, cr);
      const r = new THREE.Mesh(new THREE.CylinderGeometry(.11, .08, .04, 20), cr); r.position.set(x + .34, 2.16, z); g.add(r);
    }

    /* ---------- muebles según el uso ---------- */
    const mu = (q, f) => f(q.x + q.w / 2, q.y + q.h / 2, q.w, q.h);
    (P.equip || []).forEach(q => {
      const k = q.k || q.t;
      if (k === 'cama') mu(q, (x, z, a, b) => { bx(gMue, a, .32, b, x, y0, z, madera); bx(gMue, a - .06, .2, b - .08, x, y0 + .32, z + .02, blanco); bx(gMue, a, .9, .06, x, y0, z - b / 2 + .03, madera);
        [-1, 1].forEach(s => { bx(gMue, a / 2 - .1, .1, .35, x + s * a / 4, y0 + .52, z - b / 2 + .3, loza); bx(gMue, .42, .5, .38, x + s * (a / 2 + .3), y0, z - b / 2 + .25, madera) });
        bx(gMue, a - .04, .05, b * .55, x, y0 + .52, z + b * .2, tela) });
      if (k === 'escritorio' || k === 'mesa') mu(q, (x, z, a, b) => { bx(gMue, a, .04, b, x, y0 + .72, z, madera); [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([s, t]) => bx(gMue, .04, .72, .04, x + s * (a / 2 - .05), y0, z + t * (b / 2 - .05), acero));
        if (k === 'escritorio') { bx(gMue, .5, .32, .03, x, y0 + .76, z - b / 2 + .15, mat('Pantalla', { color: '#15171a', roughness: .3 })); bx(gMue, .46, .45, .46, x, y0, z + b / 2 + .35, tela); bx(gMue, .46, .5, .06, x, y0 + .45, z + b / 2 + .58, tela) } });
      if (k === 'estante') mu(q, (x, z, a, b) => { const hh = Math.min(1.9, H - .4); [0, .45, .9, 1.35, hh - .03].forEach(y => bx(gMue, a, .03, b, x, y0 + y, z, madera));
        [-1, 1].forEach(s => bx(gMue, a, hh, .03, x, y0, z + s * (b / 2 - .015), acero));
        for (let i = 0; i < Math.floor(b / .3); i++) bx(gMue, a * .7, .28, .2, x, y0 + .48 + (i % 3) * .45, z - b / 2 + .2 + i * .3, mat('Libro' + i % 3, { color: ['#b5523b', '#3f6c80', '#d8b25a'][i % 3] })) });
      if (k === 'piano') mu(q, (x, z, a, b) => { bx(gMue, a, .1, b, x, y0 + .72, z, mat('Teclado', { color: '#1b1c1f', roughness: .4 })); bx(gMue, a - .1, .015, .14, x, y0 + .82, z + b / 2 - .1, loza);
        [-1, 1].forEach(s => bx(gMue, .05, .72, b - .1, x + s * (a / 2 - .1), y0, z, acero));
        // paneles acústicos en las paredes
        const pa = mat('Panel acústico', { color: '#4b5157', roughness: 1 });
        for (let i = 0; i < Math.floor((l - 1) / .7); i++) [['O', .03], ['E', w - .03]].forEach(([sd, px]) => { const pz = .6 + i * .7;
          if (!P.ventanas.some(v => v.m === sd && Math.abs(v.en - pz) < v.a / 2 + .35)) bx(gMue, .05, .6, .6, px, y0 + 1.1, pz, pa) }) });
      if (k === 'sofa' || k === 'sofacama') mu(q, (x, z, a, b) => { const cm = mat('Sofá', { color: k === 'sofa' ? '#5b4a3c' : '#8a9a88', roughness: 1 });
        bx(gMue, a, .42, b, x, y0, z, cm); const back = x < w / 2 ? -1 : 1; bx(gMue, .2, .45, b, x + back * (a / 2 - .1), y0 + .42, z, cm) });
      if (k === 'banco' || k === 'mesada') mu(q, (x, z, a, b) => { bx(gMue, a, .06, b, x, y0 + .86, z, madera); bx(gMue, a - .1, .8, b - .1, x, y0 + .06, z, acero);
        const pg = mat('Tablero', { color: '#c9a979', roughness: .9 }); if (b < a) bx(gMue, a, .9, .02, x, y0 + 1.1, z - b / 2 + .01, pg); else bx(gMue, .02, .9, b, x - a / 2 + .01, y0 + 1.1, z, pg);
        for (let i = 0; i < 5; i++) bx(gMue, .04, .25, .03, b < a ? x - a / 2 + .3 + i * (a - .6) / 4 : x - a / 2 + .04, y0 + 1.4, b < a ? z - b / 2 + .04 : z - b / 2 + .3 + i * (b - .6) / 4, acero) });
      if (k === 'bici') mu(q, (x, z) => { const rm = mat('Goma', { color: '#18191b', roughness: .9 });
        [-.52, .52].forEach(dz => { const r = new THREE.Mesh(new THREE.TorusGeometry(.32, .025, 8, 28), rm); r.rotation.y = Math.PI / 2; r.position.set(x, y0 + .34, z + dz); r.castShadow = true; gMue.add(r) });
        const fr = mat('Cuadro', { color: '#b5523b', metalness: .4 }); bx(gMue, .04, .04, 1.05, x, y0 + .55, z, fr); bx(gMue, .04, .45, .04, x, y0 + .34, z - .1, fr); bx(gMue, .04, .04, .5, x, y0 + .8, z + .35, fr) });
      if (k === 'inodoro') { bx(gMue, .38, .4, .55, q.x + .2, y0, q.y + .3, loza); bx(gMue, .38, .4, .16, q.x + .2, y0 + .4, q.y + .08, loza) }
      if (k === 'lav') { bx(gMue, .5, .15, .4, q.x + .25, y0 + .7, q.y + .2, loza); bx(gMue, .06, .7, .06, q.x + .25, y0, q.y + .15, loza) }
    });
    if (!gal && ['dormitorio', 'multi', 'musica'].includes(p.uso)) bx(gMue, Math.min(2, w - .8), .01, Math.min(1.4, l - 1.6), w / 2, y0 + .006, l / 2 + .2, mat('Alfombra', { color: p.uso === 'musica' ? '#7a3f35' : '#c9bfae', roughness: 1 }));
    if (gal) {
      const loc = P.locales || [], back = 2.4;
      if (p.uso === 'deposito' || p.uso === 'mixto') { // estanterías de pallets contra el muro oeste (o en el depósito del mixto)
        const x0 = p.uso === 'mixto' ? w / 2 + .3 : .35, az = mat('Rack azul', { color: '#2f5d8a', metalness: .4 }), na = mat('Rack naranja', { color: '#d9762b', metalness: .3 }), ca = mat('Cartón', { color: '#b8946a' });
        const hh = Math.min(H - .8, 4), niv = [.15, 1.4, 2.65].filter(y => y < hh - .3);
        for (let z = back + .8; z + 2.7 < l - 3; z += 2.9) {
          [z, z + 2.7].forEach(zz => [x0, x0 + 1].forEach(xx => bx(gEst, .08, hh, .08, xx, y0, zz, az)));
          niv.forEach(y => { [x0, x0 + 1].forEach(xx => bx(gEst, .06, .1, 2.7, xx, y0 + y, z + 1.35, na)); [0, 1, 2].forEach(i => { if ((i + Math.round(z) + y * 10) % 4) bx(gMue, .9, .8, .8, x0 + .5, y0 + y + .1, z + .45 + i * .9, ca) }) });
        }
      }
      loc.filter(L0 => /^Local/.test(L0.n)).forEach(L0 => { bx(gMue, 1.6, 1, .5, L0.x, y0, back + 1.2, mat('Mostrador', { color: '#d9d2c4' })); bx(gMue, 1.6, .04, .55, L0.x, y0 + 1, back + 1.2, madera) });
    }

    // piso libre para los módulos (extras con forma)
    const piso = { x0: .15, x1: w - .15, z0: gal ? .15 : .15, z1: l - .15, y: y0 };
    return { root, anim, piso, alto: H };
  }
  return { construir, MAT, PINTA };
}
