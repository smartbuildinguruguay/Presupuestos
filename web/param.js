/* Modelos paramétricos: un Pod y un Galpón que se configuran (medida, uso, cerramiento, ventanas...).
   SBUparam.virtual(base, p, D) arma el "modelo" concreto (m², planta, fachada, datos y líneas de precio)
   a partir de la ficha base de datos.json y de las elecciones p. Lo usan la web, el precio y el 3D. */
(function () {
  const G = {
    pod: {
      tam: { t: 'Medida', ops: [{ id: 's', n: 'S', d: '2,4 × 3 m', w: 2.4, l: 3 }, { id: 'm', n: 'M', d: '3 × 4 m', w: 3, l: 4 }, { id: 'l', n: 'L', d: '3,6 × 5 m', w: 3.6, l: 5 }, { id: 'xl', n: 'XL', d: '4,2 × 6 m', w: 4.2, l: 6 }] },
      uso: { t: 'Uso', ops: [
        { id: 'oficina', n: 'Oficina', d: 'escritorio, estantes y buena luz', f: 1.15 },
        { id: 'dormitorio', n: 'Dormitorio', d: 'cama doble y mesas de luz', f: 1.15 },
        { id: 'musica', n: 'Estudio de música', d: 'aislación acústica reforzada', f: 1.35 },
        { id: 'taller', n: 'Taller / arte', d: 'mesa de trabajo y tablero de herramientas', f: 1.0 },
        { id: 'shed', n: 'Galponcito', d: 'sin aislación: herramientas, bicis, tablas', f: .45 },
        { id: 'multi', n: 'Un poco de todo', d: 'sofá cama, escritorio y lugar para guardar', f: 1.2 }] },
      vent: { t: 'Ventanas', ops: [{ id: 'corrediza', n: 'Corrediza', d: 'la hoja se desliza' }, { id: 'batiente', n: 'Batiente', d: 'la hoja abre hacia afuera' }] },
      vidrio: { t: 'Vidrio', ops: [{ id: 'dvh', n: 'Doble vidrio (DVH)', d: 'aísla frío, calor y ruido' }, { id: 'simple', n: 'Vidrio simple', d: 'más económico', usdM2: -120 }] },
    },
    galpon: {
      tam: { t: 'Medida', ops: [{ id: 's', n: '8 × 10', d: '80 m²', w: 8, l: 10 }, { id: 'm', n: '10 × 15', d: '150 m²', w: 10, l: 15 }, { id: 'l', n: '12 × 20', d: '240 m²', w: 12, l: 20 }, { id: 'xl', n: '15 × 30', d: '450 m²', w: 15, l: 30 }] },
      uso: { t: 'Uso', ops: [
        { id: 'deposito', n: 'Depósito / industria', d: 'nave libre con portón grande' },
        { id: 'locales', n: 'Locales', d: 'frentes vidriados para alquilar' },
        { id: 'taller', n: 'Taller', d: 'portón, banco de trabajo y ventanas altas' },
        { id: 'mixto', n: 'Mixto', d: 'dos locales al frente y depósito' }] },
      cerr: { t: 'Cerramiento', ops: [{ id: 'chapa', n: 'Chapa', d: 'acanalada prepintada', f: .45 }, { id: 'panel', n: 'Isopanel', d: 'panel aislado, liso', f: .58 }] },
      color: { t: 'Color', ops: [{ id: 'negro', n: 'Negro', c: '#2a2c2f' }, { id: 'grafito', n: 'Grafito', c: '#5b6066' }, { id: 'blanco', n: 'Blanco', c: '#e8e8e4' }, { id: 'verde', n: 'Verde inglés', c: '#2f4a3c' }] },
      base: { t: 'Base', ops: [{ id: 'platea', n: 'Con platea', d: 'hormigón alisado' }, { id: 'sin', n: 'Sin platea', d: 'balasto compactado; la platea se hace después', usdM2: -45 }] },
      banos: { t: 'Baños', ops: [{ id: '0', n: 'Sin baño', d: '' }, { id: '1', n: '1 baño', d: 'inodoro, lavatorio y su instalación' }, { id: '2', n: '2 baños', d: 'uno accesible' }] },
    },
  };
  const DEF = { pod: { tam: 'm', uso: 'oficina', vent: 'corrediza', vidrio: 'dvh' }, galpon: { tam: 'm', uso: 'deposito', cerr: 'chapa', color: 'negro', base: 'platea', banos: '1' } };
  const op = (tipo, k, id) => (G[tipo][k].ops.find(o => o.id === String(id)) || G[tipo][k].ops[0]);

  // alturas de cada vano (las mismas que usa el 3D)
  function alturas(tipo, o, pared, H) {
    if (o._t === 'p') return o.a >= 3 ? [0, Math.min(4.2, H - .4)] : [0, tipo === 'galpon' && pared === 'S' ? 2.6 : 2.05];
    if (o.vidriera) return [.05, Math.min(3.1, H - .5)];
    if (tipo === 'pod' && pared === 'S' && o.a >= 1.6) return [.45, Math.min(2.25, H - .3)];
    if (H > 3.8 && pared !== 'S') return [H - 1.6, H - .6];
    if (o.a <= .7) return [1.5, 2.05];
    return [.9, 2.05];
  }

  // las aberturas se piensan por su comienzo y se guardan por su centro (como las dibuja la planta)
  const centrar = P => { P.ventanas.concat(P.puertas).forEach(o => { o.en = +(o.en + o.a / 2).toFixed(3) }); return P };
  // muebles según el uso (en planta; el 3D usa los mismos)
  function mueblesPod(w, l, uso) {
    const q = [];
    if (uso === 'dormitorio') q.push({ t: 'cama', x: w / 2 - .7, y: .1, w: 1.4, h: 1.9, rot: 0 });
    if (uso === 'oficina') q.push({ t: 'isla', k: 'escritorio', x: .25, y: .1, w: Math.min(1.6, w - 1.2), h: .65 }, { t: 'isla', k: 'estante', x: w - .45, y: .3, w: .35, h: Math.min(1.8, l - 1.6) });
    if (uso === 'musica') q.push({ t: 'isla', k: 'piano', x: .3, y: .15, w: 1.4, h: .45 }, { t: 'sofa', x: w - 1, y: l - 2.4, w: .85, h: 1.8 });
    if (uso === 'taller') q.push({ t: 'mesada', k: 'banco', x: .2, y: .1, w: Math.min(2.2, w - .4), h: .7 }, { t: 'isla', k: 'mesa', x: w / 2 - .6, y: l / 2 - .2, w: 1.2, h: .8 });
    if (uso === 'shed') q.push({ t: 'isla', k: 'estante', x: .15, y: .3, w: .45, h: l - .9 }, { t: 'isla', k: 'bici', x: w - .55, y: .4, w: .35, h: 1.7 });
    if (uso === 'multi') q.push({ t: 'sofa', k: 'sofacama', x: .15, y: .5, w: .9, h: Math.min(2, l - 1.4) }, { t: 'isla', k: 'escritorio', x: w - 1.45, y: .1, w: 1.3, h: .6 });
    return q;
  }
  function planPod(w, l, p) {
    const shed = p.uso === 'shed', H = shed ? 2.3 : 2.6;
    const ventanas = [], puertas = [];
    if (shed) { puertas.push({ m: 'S', en: Math.max(.3, w / 2 - .8), a: 1.6, giro: 1 }); ventanas.push({ m: 'E', en: l / 2 - .3, a: .6 }) }
    else {
      const pa = .85, vw = Math.max(.9, w - pa - .9);
      ventanas.push({ m: 'S', en: .3, a: vw }); puertas.push({ m: 'S', en: .3 + vw + .3, a: pa, giro: -1 });
      ventanas.push({ m: 'E', en: Math.max(.4, l / 2 - .6), a: 1.2 }); if (l >= 4) ventanas.push({ m: 'O', en: l / 2 - .5, a: 1 });
      if (p.uso !== 'musica') ventanas.push({ m: 'N', en: w / 2 - .4, a: .8 });
    }
    return centrar({ ancho: w, prof: l, eExt: .14, eInt: .1, muros: [], ventanas, puertas, equip: mueblesPod(w, l, p.uso), locales: [{ n: G.pod.uso.ops.find(o => o.id === p.uso).n, x: w / 2, y: l / 2, a: +(w * l).toFixed(1) }], cotasX: [0, w], cotasY: [0, l], _H: H });
  }

  function planGal(w, l, p) {
    const H = w >= 12 ? 5 : 4.5, back = 2.4, ventanas = [], puertas = [], muros = [], locales = [], equip = [];
    const nb = +p.banos || 0;
    const loc = (x0, x1, nom) => { const a = x1 - x0; ventanas.push({ m: 'S', en: x0 + .4, a: Math.max(1, a - 1.9), vidriera: true }); puertas.push({ m: 'S', en: x1 - 1.3, a: 1.1, giro: -1 }); locales.push({ n: nom, x: (x0 + x1) / 2, y: (back + l) / 2, a: +(a * (l - back)).toFixed(0) }) };
    if (p.uso === 'locales' || p.uso === 'mixto') {
      const ancho = p.uso === 'mixto' ? w / 2 : w, n = Math.max(2, Math.round(ancho / 5)), lw = ancho / n;
      for (let i = 0; i < n; i++) { loc(i * lw, (i + 1) * lw, 'Local ' + (i + 1)); if (i) muros.push([i * lw, back, i * lw, l]) }
      muros.push([0, back, ancho - (ancho >= w - .01 ? nb * 2.2 : 0), back]);
      if (p.uso === 'mixto') { muros.push([ancho, 0, ancho, l]); puertas.push({ m: 'S', en: ancho + (w - ancho) / 2 - 1.75, a: 3.5, giro: 1 }); locales.push({ n: 'Depósito', x: ancho + (w - ancho) / 2, y: l / 2, a: +((w - ancho) * l).toFixed(0) }) }
    } else {
      const pw = p.uso === 'taller' ? 3 : Math.min(4.5, w - 3);
      puertas.push({ m: 'S', en: w / 2 - pw / 2, a: pw, giro: 1 }); puertas.push({ m: 'S', en: w - 1.4, a: .9, giro: -1 });
      for (let y = 2; y < l - 2; y += 5) { ventanas.push({ m: 'E', en: y, a: 2.4 }); ventanas.push({ m: 'O', en: y, a: 2.4 }) }
      locales.push({ n: p.uso === 'taller' ? 'Taller' : 'Nave', x: w / 2, y: l / 2, a: +(w * l).toFixed(0) });
      if (p.uso === 'taller') equip.push({ t: 'mesada', x: .2, y: l / 2 - 2, w: .8, h: 4 });
    }
    // baños al fondo, contra la esquina noreste
    for (let i = 0; i < nb; i++) {
      const x1 = w - i * 2.2, x0 = x1 - 2.2;
      muros.push([x0, 0, x0, back, .1, 2.7], [x0, back, x1, back, .1, 2.7]);
      puertas.push({ m: [x0, back, x1, back], en: .3, a: i === 1 ? .9 : .75, giro: 1 });
      equip.push({ t: 'inodoro', x: x0 + 1.4, y: .1 }, { t: 'lav', x: x0 + .3, y: .15 });
      locales.push({ n: i === 1 ? 'Baño accesible' : 'Baño', x: x0 + 1.1, y: back / 2, a: +(2.2 * back).toFixed(1) });
    }
    return centrar({ ancho: w, prof: l, eExt: .15, eInt: .1, muros, ventanas, puertas, equip, locales, cotasX: [0, w], cotasY: [0, l], _H: H });
  }

  // fachada sur derivada de la planta, para el dibujo
  function fachada(tipo, P, p, base) {
    const H = P._H, e = P.eExt, w = P.ancho, gal = tipo === 'galpon', X = 1.2;
    const ab = [];
    P.ventanas.filter(v => v.m === 'S').forEach(v => { const [zb, zc] = alturas(tipo, Object.assign({ _t: 'v' }, v), 'S', H); ab.push({ tipo: v.vidriera || v.a >= 1.6 ? 'fija' : 'ventana', x: X + e + v.en - v.a / 2, y: zb, w: v.a, h: zc - zb, div: v.a > 2 ? 2 : 0, calido: true }) });
    P.puertas.filter(d => d.m === 'S').forEach(d => { const [zb, zc] = alturas(tipo, Object.assign({ _t: 'p' }, d), 'S', H); ab.push({ tipo: 'puerta', x: X + e + d.en - d.a / 2, y: zb, w: d.a, h: zc - zb }) });
    const vol = gal ? { x: X, w: w + 2 * e, muro: H, piso: .15, techo: 'frente', cumbrera: H + Math.max(1, w * .12), revest: 'chapa', alero: .4 }
      : { x: X, w: w + 2 * e, muro: H, piso: .3, techo: 'plano', revest: base.revOriginal === 'chapa' ? 'chapa' : 'madera' };
    return { ancho: w + 2 * e + 2 * X, titulo: 'el frente', volumenes: [vol], aberturas: ab, plantas: [{ x: .1, w: .9 }], arboles: [{ x: w + 2 * e + 2 * X - .5, h: gal ? 8 : 5, k: gal ? 'eucalipto' : 'redondo' }],
      personas: gal ? [X + w * .3] : [], decks: !gal && p.uso !== 'shed' ? [{ x: X - .2, w: w + 2 * e + .4, h: .3 }] : [] };
  }

  window.SBUparam = {
    G, DEF,
    grupos(tipo) { return Object.keys(G[tipo]) },
    grupo(tipo, k) { return G[tipo][k] },
    norm(tipo, p) { const q = Object.assign({}, DEF[tipo], p || {}); Object.keys(G[tipo]).forEach(k => { q[k] = op(tipo, k, q[k]).id }); return q },
    /* modelo concreto. dims = {w, l} opcional para las animaciones entre medidas */
    virtual(base, p0, D, dims) {
      const tipo = base.param, p = this.norm(tipo, p0), T = op(tipo, 'tam', p.tam), w = dims ? dims.w : T.w, l = dims ? dims.l : T.l;
      const P = tipo === 'pod' ? planPod(w, l, p) : planGal(w, l, p);
      const key = '~' + base.id; if (D && !dims) D.plantas[key] = P;
      const m2 = Math.round(w * l * 10) / 10, uso = op(tipo, 'uso', p.uso);
      const m = Object.assign({}, base, { p, m2, planta: key, _P: P, fachada: fachada(tipo, P, p, base) });
      const L = []; // líneas propias (costo directo, sin margen)
      if (tipo === 'pod') {
        m.factor = uso.f; m.plazo = m2 <= 8 ? .5 : m2 <= 13 ? 1.5 : 2; m.deck = p.uso === 'shed' ? 0 : Math.round(w * 1.5);
        m.etiqueta = 'Pod ' + T.n; m.config = p.uso === 'shed' ? ['conf', 'ext', 'techo', 'extra'] : ['conf', 'ext', 'int', 'pis', 'techo', 'extra'];
        const vid = op('pod', 'vidrio', p.vidrio); if (vid.usdM2 && p.uso !== 'shed') { const a = P.ventanas.reduce((t, v) => t + v.a * (v.m === 'S' ? 1.8 : 1.15), 0); L.push({ id: 'p-vidrio', t: vid.n, det: `${a.toFixed(1)} m² de vidrio × USD ${vid.usdM2}`, costo: a * vid.usdM2 }) }
        m.datos = [['Medida', T.d], ['Superficie', m2 + ' m²'], ['Uso', uso.n], ['Ventanas', `${op('pod', 'vent', p.vent).n} · ${op('pod', 'vidrio', p.vidrio).n.replace(' (DVH)', '')}`]];
        m.dorm = p.uso === 'dormitorio' || p.uso === 'multi' ? 1 : 0; m.banos = 0;
      } else {
        const ce = op('galpon', 'cerr', p.cerr), ba = op('galpon', 'base', p.base), nb = +p.banos || 0;
        m.factor = ce.f; m.plazo = m2 <= 100 ? 2.5 : m2 <= 200 ? 3.5 : 5; m.deck = 0; m.etiqueta = 'Galpón ' + T.n; m.config = ['conf', 'techo', 'extra'];
        if (ba.usdM2) L.push({ id: 'p-base', t: 'Sin platea (balasto compactado)', det: `${m2} m² × USD ${ba.usdM2}`, costo: m2 * ba.usdM2 });
        const nl = P.ventanas.filter(v => v.vidriera).length; if (nl) L.push({ id: 'p-frentes', t: `Frentes vidriados × ${nl}`, det: `${nl} × USD 1.800`, costo: nl * 1800 });
        if (nb) L.push({ id: 'p-banos', t: `${nb === 1 ? 'Baño' : nb + ' baños (uno accesible)'}`, det: `USD 2.600${nb > 1 ? ' + 3.200 accesible' : ''}`, costo: nb > 1 ? 2600 + 3200 : 2600 });
        m.datos = [['Medida', T.n + ' m'], ['Superficie', m2 + ' m²'], ['Uso', uso.n], ['Cerramiento', ce.n + ' ' + op('galpon', 'color', p.color).n.toLowerCase()], ['Base', ba.n], ['Baños', String(nb)]];
        m.banos = nb; m.dorm = 0; m.locales = nl;
      }
      m.paramLineas = L;
      return m;
    },
    alturas,
  };
})();
