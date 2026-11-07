/* Dibujos de cada modelo: planta y corte con cercha.
   Los usan la web y el panel. Devuelven el SVG como texto. */
(function () {
  /* Paletas: cambian los colores de todos los dibujos de una vez.
     map: color original → nuevo; sat / lum: ajuste general del resto (no toca tintas oscuras). */
  const PALETAS = {
    actual: {},
    sobria: { sat: .5, lum: .03, map: { '#efcf9c': '#ebe0cb', '#e9b9a0': '#e6d6c4', '#a9c6cc': '#d0d8d6', '#e8d7b8': '#efe8d9', '#cfd3c4': '#dcdbd0', '#f1e2c3': '#eee5d4', '#c79664': '#c09c76', '#c18e5b': '#b8946e', '#9fc0d3': '#bfcbd0' } },
    campo: { sat: .85, lum: 0, map: { '#efcf9c': '#eed6ae', '#e9b9a0': '#e3bb9c', '#a9c6cc': '#bccfc8', '#e8d7b8': '#ebdcc2', '#cfd3c4': '#d3d5c0', '#f1e2c3': '#efdfc0', '#9fc0d3': '#a6c3c9', '#95ab76': '#86a06a' } },
    divertida: { sat: 1.35, lum: 0, map: { '#efcf9c': '#f7d27a', '#e9b9a0': '#f2a38a', '#a9c6cc': '#8fd0d6', '#e8d7b8': '#f3e3b8', '#cfd3c4': '#bcdcb4', '#f1e2c3': '#f6e6c2', '#9fc0d3': '#7fb8de', '#95ab76': '#7fb35f', '#c79664': '#d9944f', '#c18e5b': '#cf8746', '#f4d9a6': '#ffe2a0', '#e8b673': '#f7b65f', '#d1924f': '#e8873a', '#d6e3e6': '#cfe6f2' } },
    nordico: { sat: .45, lum: .07, map: { '#efcf9c': '#efe7d8', '#e9b9a0': '#ebdcd6', '#a9c6cc': '#d4e2e6', '#e8d7b8': '#f2ede3', '#cfd3c4': '#e0e2da', '#f1e2c3': '#f2ece0', '#c79664': '#d4b48a', '#c18e5b': '#cdac80', '#9fc0d3': '#c3d8e2', '#f4d9a6': '#f6e8cc', '#e8b673': '#eed4a4', '#d1924f': '#dcb47c' } },
  };
  const hx = h => [1, 3, 5].map(i => parseInt(h.substr(i, 2), 16) / 255);
  const toHsl = ([r, g, b]) => { const M = Math.max(r, g, b), m = Math.min(r, g, b), l = (M + m) / 2; if (M === m) return [0, 0, l]; const d = M - m, s = l > .5 ? d / (2 - M - m) : d / (M + m); let h = M === r ? (g - b) / d + (g < b ? 6 : 0) : M === g ? (b - r) / d + 2 : (r - g) / d + 4; return [h / 6, s, l] };
  const toHex = ([h, s, l]) => { const f = n => { const k = (n + h * 12) % 12, a = s * Math.min(l, 1 - l); return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)) }; return '#' + [f(0), f(8), f(4)].map(v => Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16).padStart(2, '0')).join('') };
  const recolor = svg => {
    const P = PALETAS[window.SBUpaleta || 'divertida'] || {}; if (!P.map && !P.sat) return svg;
    const cache = {};
    return svg.replace(/#[0-9a-fA-F]{6}\b/g, c => { c = c.toLowerCase(); if (cache[c]) return cache[c];
      let out = (P.map || {})[c];
      if (!out) { const [h, s0, l] = toHsl(hx(c)); out = l < .32 ? c : toHex([h, s0 * (P.sat ?? 1), Math.min(.97, l + (P.lum || 0) * (1 - l) * 2)]) }
      return cache[c] = out });
  };
  window.SBUpaletas = Object.keys(PALETAS);
  const INK = '#1d1b18', INK2 = '#4b4842', MUTE = '#8a857b', PAPER = '#f6f0e3', WASH = '#e9dfcc';
  const MONO = "IBM Plex Mono,monospace", ARCH = "Archivo,Arial Narrow,sans-serif", HAND = "Caveat,cursive", SERIF = "Fraunces,Georgia,serif";
  const f2 = v => (+v).toFixed(2).replace('.', ',');
  const MAD = { lapacho: ['#8d5a3b', '#6d4229'], cumaru: ['#9a6a44', '#7a4f30'], eucalipto: ['#c49a6c', '#a57a4f'], pino: ['#dcc08f', '#bf9f6a'] };
  const mad = n => MAD[(n || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').split(' ')[0]] || MAD.pino;

  // papel con grano, común a los dos dibujos
  const papel = (id, VW, VH) => `<defs>
    <filter id="${id}g" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 .45  0 0 0 0 .38  0 0 0 0 .28  0 0 0 .06 0"/></filter>
    <filter id="${id}s" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="5"/></filter>
    <filter id="${id}m" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency=".04" numOctaves="3" seed="7" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -.22 1.05" result="a"/><feComposite in="SourceGraphic" in2="a" operator="in" result="b"/><feMorphology in="SourceAlpha" operator="erode" radius="1.1" result="er"/><feComposite in="SourceAlpha" in2="er" operator="out" result="ed"/><feColorMatrix in="SourceGraphic" type="matrix" values=".78 0 0 0 0  0 .78 0 0 0  0 0 .78 0 0  0 0 0 .55 0" result="dk"/><feComposite in="dk" in2="ed" operator="in" result="rim"/><feMerge><feMergeNode in="b"/><feMergeNode in="rim"/></feMerge></filter>
    <filter id="${id}c" x="-6%" y="-6%" width="112%" height="112%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency=".022" numOctaves="3" seed="9" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="7" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="1" result="bl"/><feTurbulence type="fractalNoise" baseFrequency=".05" numOctaves="3" seed="3" result="n2"/><feColorMatrix in="n2" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -.5 1.15" result="a"/><feComposite in="bl" in2="a" operator="in" result="g"/><feMorphology in="g" operator="erode" radius="2" result="er"/><feComposite in="g" in2="er" operator="out" result="ed"/><feColorMatrix in="ed" type="matrix" values=".72 0 0 0 0  0 .72 0 0 0  0 0 .72 0 0  0 0 0 .38 0" result="rim"/><feColorMatrix in="g" type="matrix" values=".8 0 0 0 .18  0 .8 0 0 .17  0 0 .8 0 .15  0 0 0 .9 0" result="soft"/><feMerge><feMergeNode in="soft"/><feMergeNode in="rim"/></feMerge></filter>
    <filter id="${id}w" x="-2%" y="-2%" width="104%" height="104%"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="3"/><feDisplacementMap in="SourceGraphic" scale="3.5"/></filter>
    <filter id="${id}a" x="-8%" y="-8%" width="116%" height="116%"><feTurbulence type="fractalNoise" baseFrequency=".02" numOctaves="3" seed="8" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="14" result="d"/><feGaussianBlur in="d" stdDeviation="1.6"/></filter>
  </defs><rect width="${VW}" height="${VH}" fill="${PAPER}"/><rect width="${VW}" height="${VH}" filter="url(#${id}g)"/>`;

  // rótulo tipo lámina
  const rotulo = (x, y, w, titulo, sub, k = 1) => `<g transform="translate(${x} ${y}) scale(${k})">
    <line x1="0" y1="0" x2="${w / k}" y2="0" stroke="${INK}" stroke-width="1.4"/>
    <text x="0" y="24" font-family="${ARCH}" font-stretch="75%" font-weight="800" font-size="22" letter-spacing=".5" fill="${INK}">${titulo}</text>
    <text x="0" y="44" font-family="${MONO}" font-size="12" fill="${INK2}">${sub}</text>
    <text x="${w / k}" y="24" text-anchor="end" font-family="${MONO}" font-size="11" letter-spacing="1.5" fill="${MUTE}">SMART BUILDING URUGUAY</text>
  </g>`;

  // árbol a mano alzada (toque de croquis)
  const arbol = (cx, cy, r, k) => { let rays = ''; for (let i = 0; i < 9; i++) { const a = i / 9 * 6.283 + k; rays += `M${cx} ${cy}L${(cx + Math.cos(a) * r * .72).toFixed(1)} ${(cy + Math.sin(a) * r * .72).toFixed(1)}` }
    return `<g><circle cx="${cx + r * .16}" cy="${cy + r * .2}" r="${r}" fill="#8f8270" opacity=".18"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="#a3b88c" filter="url(#plm)"/><circle cx="${cx - r * .22}" cy="${cy - r * .2}" r="${r * .55}" fill="#c3d2ad" opacity=".55"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#5f6f4f" stroke-width=".9"/><path d="${rays}" stroke="#5f6f4f" stroke-width=".6" opacity=".7"/><circle cx="${cx}" cy="${cy}" r="2" fill="#5f6f4f"/></g>` };

  /* ---------------- PLANTA ----------------
     P: ancho, prof (m), eExt, eInt,
        murosExt (opcional: tramos [x1,y1,x2,y2]; si falta, el contorno es el rectángulo),
        muros (interiores), pisos / cubiertos (rectángulos [x,y,w,h]),
        ventanas / puertas: m = 'N'|'S'|'E'|'O' o un tramo; en = distancia desde el inicio; a = ancho;
          e = espesor del muro (tramos); giro = lado hacia donde abre; in = lado de la luz (ventanas en tramos)
        equip: t = mesada|isla|cama|inodoro|ducha|lav|estufa|sofa|mesa|parrilla
        locales: n, x, y, a (m²)  ·  cotasX / cotasY */
  // escala y margen del dibujo (los usa también el editor del panel)
  window.SBUplantaGeo = function (P) { const S = Math.min(100, 1100 / P.ancho); return { S, pad: Math.max(120, 150 * S / 100 + 40) } };
  window.SBUplanta = function (P, m) {
    const { S, pad } = window.SBUplantaGeo(P), k = S / 100;
    const W = P.ancho * S, H = P.prof * S, e = P.eExt * S, ei = P.eInt * S;
    const X = x => pad + x * S, Y = y => pad + y * S;
    const FS = 17, fm = 12;
    let o = '';
    o += `<defs>
      <pattern id="pl-hx" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="7" height="7" fill="${INK}"/><line x1="0" y1="0" x2="0" y2="7" stroke="#5b564d" stroke-width="1.6"/></pattern>
      <pattern id="pl-piso" width="${S * 1.2}" height="${S * .2}" patternUnits="userSpaceOnUse"><rect width="${S * 1.2}" height="${S * .2}" fill="#f4ecdc"/><line x1="0" y1="${S * .2}" x2="${S * 1.2}" y2="${S * .2}" stroke="#e3d5bb" stroke-width="1"/><line x1="${S * .7}" y1="0" x2="${S * .7}" y2="${S * .2}" stroke="#e3d5bb" stroke-width="1"/></pattern>
      <pattern id="pl-deck" width="${S * .14}" height="${S * 2.4}" patternUnits="userSpaceOnUse"><rect width="${S * .14}" height="${S * 2.4}" fill="#e2cfae"/><line x1="0" y1="0" x2="0" y2="${S * 2.4}" stroke="#c4aa80" stroke-width="1"/><line x1="0" y1="${S * 1.1}" x2="${S * .14}" y2="${S * 1.1}" stroke="#c4aa80" stroke-width=".8"/></pattern>
    </defs>`;
    const rects = P.pisos || [[0, 0, P.ancho, P.prof]];
    const rr = (r, extra) => `<rect x="${X(r[0])}" y="${Y(r[1])}" width="${r[2] * S}" height="${r[3] * S}" ${extra}/>`;
    // vegetación alrededor
    o += arbol(X(-0.9) - 10 * k, Y(P.prof * .78), 46 * k + 14, 1) + arbol(X(P.ancho) + e + 150, Y(P.prof * .2), 56 * k + 16, 2) + arbol(X(P.ancho) + e + 130, Y(P.prof * .85), 36 * k + 12, 3);
    // sombra (aguada) de todo lo construido
    o += [...rects, ...(P.cubiertos || [])].map(r => `<rect x="${X(r[0]) + 14}" y="${Y(r[1]) + 16}" width="${r[2] * S}" height="${r[3] * S}" fill="#b9a98c" opacity=".3" filter="url(#pls)"/>`).join('');
    // galerías y parrillero cubiertos: deck
    (P.cubiertos || []).forEach(r => { o += rr(r, `fill="url(#pl-deck)" stroke="${INK2}" stroke-width="1" stroke-dasharray="6 4"`) });
    // módulos opcionales (punteados)
    (P.opcionales || []).forEach(r => { o += rr(r, `fill="#f6f1e6" fill-opacity=".7" stroke="${INK2}" stroke-width="1.6" stroke-dasharray="10 6"`) + `<text x="${X(r[0] + r[2] / 2)}" y="${Y(r[1]) + 22}" text-anchor="middle" font-family="${MONO}" font-size="11" letter-spacing="1.5" fill="${INK2}">OPCIONAL</text>` });
    // piso interior: aguadas por ambiente (manchas recortadas al piso)
    const tono = n => { n = (n || '').toLowerCase(); return /baño|toilette/.test(n) ? '#a9c6cc' : /dorm|suite/.test(n) ? '#e9b9a0' : /lavadero|dep[oó]sito/.test(n) ? '#cfd3c4' : /hall|pasillo|paso|circul|t[uú]nel|vestidor|escalera|placard/.test(n) ? '#e8d7b8' : /galer|deck|alero|patio/.test(n) ? null : '#efcf9c' };
    o += `<clipPath id="pl-clip">${[...rects, ...(P.opcionales || [])].map(r => rr(r, '')).join('')}</clipPath>`;
    o += `<g filter="url(#plm)">${rects.map(r => rr(r, 'fill="#f1e2c3"')).join('')}</g>`;
    o += `<g clip-path="url(#pl-clip)" opacity=".85"><g filter="url(#pla)">${[...(P.locales || [])].sort((a, b) => (+b.a || 8) - (+a.a || 8)).map(l => { const c = tono(l.n); if (!c) return ''; const rad = Math.sqrt(+l.a || 8) * S * .72; return `<ellipse cx="${X(l.x)}" cy="${Y(l.y) - 6}" rx="${rad * 1.25}" ry="${rad}" fill="${c}" opacity=".75"/>` }).join('')}</g></g>`;
    // muros: tinta sepia, trazo a mano
    o += '<g>';
    if (P.murosExt) {
      P.murosExt.forEach(([x1, y1, x2, y2]) => {
        const h = y1 === y2, a = Math.min(x1, x2), b = Math.min(y1, y2);
        o += h ? `<rect x="${X(a) - e / 2}" y="${Y(b) - e / 2}" width="${Math.abs(x2 - x1) * S + e}" height="${e}" fill="#3b2f25"/>`
          : `<rect x="${X(a) - e / 2}" y="${Y(b) - e / 2}" width="${e}" height="${Math.abs(y2 - y1) * S + e}" fill="#3b2f25"/>`;
      });
    } else {
      o += `<path fill-rule="evenodd" fill="#3b2f25" d="M${X(0) - e} ${Y(0) - e}h${W + 2 * e}v${H + 2 * e}h${-W - 2 * e}Z M${X(0)} ${Y(0)}v${H}h${W}v${-H}Z"/>`;
    }
    // muros interiores
    (P.muros || []).forEach(w => {
      const [x1, y1, x2, y2] = w, t = (w[4] || P.eInt) * S;
      if (x1 === x2) o += `<rect x="${X(x1) - t / 2}" y="${Y(Math.min(y1, y2))}" width="${t}" height="${Math.abs(y2 - y1) * S}" fill="#3b2f25"/>`;
      else o += `<rect x="${X(Math.min(x1, x2))}" y="${Y(y1) - t / 2}" width="${Math.abs(x2 - x1) * S}" height="${t}" fill="#3b2f25"/>`;
    });
    o += '</g>';
    const side = mm => {
      if (Array.isArray(mm)) { const [a, b, c, d] = mm; return { x1: Math.min(a, c), y1: Math.min(b, d), x2: Math.max(a, c), y2: Math.max(b, d) } }
      return { N: { x1: 0, y1: 0, x2: P.ancho, y2: 0 }, S: { x1: 0, y1: P.prof, x2: P.ancho, y2: P.prof }, O: { x1: 0, y1: 0, x2: 0, y2: P.prof }, E: { x1: P.ancho, y1: 0, x2: P.ancho, y2: P.prof } }[mm];
    };
    const ext = k => typeof k === 'string';
    // ventanas (con haz de luz hacia adentro)
    (P.ventanas || []).forEach(v => {
      const s = side(v.m), h = s.y1 === s.y2, L = v.a * S;
      let t, off, into;
      if (ext(v.m)) { t = e; off = v.m === 'N' || v.m === 'O' ? -e : 0; into = v.m === 'N' || v.m === 'O' ? 1 : -1 }
      else { t = (v.e || P.eExt) * S; off = -t / 2; into = v.in || 1 }
      const fill = v.fijo ? '#dfe8ea' : PAPER;
      if (h) {
        const x = X(s.x1 + v.en - v.a / 2), y = Y(s.y1) + off, yi = into > 0 ? y + t : y;
        o += `<path d="M${x} ${yi}L${x + L} ${yi}L${x + L * .85} ${yi + into * Math.min(L * .55, 1.6 * S)}L${x + L * .15} ${yi + into * Math.min(L * .55, 1.6 * S)}Z" fill="#f3d58f" opacity=".28"/>`;
        o += `<rect x="${x}" y="${y}" width="${L}" height="${t}" fill="${fill}" stroke="${INK}" stroke-width="1"/><line x1="${x}" y1="${y + t / 2}" x2="${x + L}" y2="${y + t / 2}" stroke="${INK}" stroke-width="1"/>`;
      } else {
        const y = Y(s.y1 + v.en - v.a / 2), x = X(s.x1) + off, xi = into > 0 ? x + t : x;
        o += `<path d="M${xi} ${y}L${xi} ${y + L}L${xi + into * Math.min(L * .55, 1.6 * S)} ${y + L * .85}L${xi + into * Math.min(L * .55, 1.6 * S)} ${y + L * .15}Z" fill="#f3d58f" opacity=".28"/>`;
        o += `<rect x="${x}" y="${y}" width="${t}" height="${L}" fill="${fill}" stroke="${INK}" stroke-width="1"/><line x1="${x + t / 2}" y1="${y}" x2="${x + t / 2}" y2="${y + L}" stroke="${INK}" stroke-width="1"/>`;
      }
    });
    // puertas
    (P.puertas || []).forEach(d => {
      const s = side(d.m), h = s.y1 === s.y2, ex = ext(d.m); const t = (ex ? P.eExt : (d.e || P.eInt)) * S, off = ex ? (d.m === 'N' || d.m === 'O' ? -e : 0) : -t / 2; const r = d.a * S;
      if (h) {
        const x = X(s.x1 + d.en - d.a / 2), y = Y(s.y1) + off; o += `<rect x="${x}" y="${y - 1}" width="${r}" height="${t + 2}" fill="#f4ecdc"/>`;
        const yb = d.giro > 0 ? y : y + t, dir = d.giro > 0 ? -1 : 1;
        o += `<path d="M${x} ${yb}L${x} ${yb + dir * r}A${r} ${r} 0 0 ${dir > 0 ? 0 : 1} ${x + r} ${yb}Z" fill="${WASH}" opacity=".45"/><line x1="${x}" y1="${yb}" x2="${x}" y2="${yb + dir * r}" stroke="${INK}" stroke-width="1.8"/><path d="M${x} ${yb + dir * r}A${r} ${r} 0 0 ${dir > 0 ? 0 : 1} ${x + r} ${yb}" fill="none" stroke="${INK}" stroke-width=".8" stroke-dasharray="4 3"/>`;
      } else {
        const y = Y(s.y1 + d.en - d.a / 2), x = X(s.x1) + off; o += `<rect x="${x - 1}" y="${y}" width="${t + 2}" height="${r}" fill="#f4ecdc"/>`;
        const xb = d.giro < 0 ? x : x + t, dx = d.giro < 0 ? -1 : 1;
        o += `<path d="M${xb} ${y}L${xb + dx * r} ${y}A${r} ${r} 0 0 ${dx > 0 ? 1 : 0} ${xb} ${y + r}Z" fill="${WASH}" opacity=".45"/><line x1="${xb}" y1="${y}" x2="${xb + dx * r}" y2="${y}" stroke="${INK}" stroke-width="1.8"/><path d="M${xb + dx * r} ${y}A${r} ${r} 0 0 ${dx > 0 ? 1 : 0} ${xb} ${y + r}" fill="none" stroke="${INK}" stroke-width=".8" stroke-dasharray="4 3"/>`;
      }
    });
    // equipamiento (todo en metros)
    const st = `fill="#fbf6ec" stroke="#6b5847" stroke-width="1"`;
    const R = (x, y, w, h, extra = st, rx = 0) => `<rect x="${X(x)}" y="${Y(y)}" width="${w * S}" height="${h * S}" rx="${rx * S}" ${extra}/>`;
    const C = (x, y, r, extra = st) => `<circle cx="${X(x)}" cy="${Y(y)}" r="${r * S}" ${extra}/>`;
    o += '<g>';
    (P.equip || []).forEach(q => {
      const { x, y } = q;
      if (q.t === 'mesada') { o += R(x, y, q.w, q.h) + R(x + .25, y + .1, .45, .38, st, .03) + [[1.35, .18], [1.6, .18], [1.35, .42], [1.6, .42]].map(([a, b]) => C(x + a, y + b, .09)).join('') }
      if (q.t === 'isla') { o += R(x, y, q.w, q.h, `fill="#efe7d6" stroke="${INK2}" stroke-width="1.2"`) }
      if (q.t === 'parrilla') { o += R(x, y, q.w, q.h, `fill="#d9d2c4" stroke="${INK2}" stroke-width="1.2"`) + `<path d="M${X(x + .1)} ${Y(y + .12)}h${(q.w - .2) * S}M${X(x + .1)} ${Y(y + .24)}h${(q.w - .2) * S}M${X(x + .1)} ${Y(y + .36)}h${(q.w - .2) * S}" stroke="${INK2}" stroke-width="1"/>` }
      if (q.t === 'cama') {
        // rot: 0 cabecera arriba, 180 abajo, 90 a la izquierda, 270 a la derecha (w × h es lo que ocupa en planta)
        const w = q.w || 1.6, h = q.h || 2, r = q.rot || 0, ver = r === 0 || r === 180, anch = ver ? w : h, n = anch > 1.2 ? 2 : 1, pw = (anch - .24 - (n - 1) * .08) / n;
        o += R(x, y, w, h, st, .04);
        for (let i = 0; i < n; i++) { const o1 = .12 + i * (pw + .08);
          if (r === 0) o += R(x + o1, y + .08, pw, .38, st, .08); else if (r === 180) o += R(x + o1, y + h - .46, pw, .38, st, .08);
          else if (r === 90) o += R(x + .08, y + o1, .38, pw, st, .08); else o += R(x + w - .46, y + o1, .38, pw, st, .08) }
        o += r === 0 ? `<path d="M${X(x)} ${Y(y + .62)}Q${X(x + w / 2)} ${Y(y + .55)} ${X(x + w)} ${Y(y + .62)}" fill="none" stroke="#6b5847"/>`
          : r === 180 ? `<path d="M${X(x)} ${Y(y + h - .62)}Q${X(x + w / 2)} ${Y(y + h - .55)} ${X(x + w)} ${Y(y + h - .62)}" fill="none" stroke="#6b5847"/>`
          : r === 90 ? `<path d="M${X(x + .62)} ${Y(y)}Q${X(x + .55)} ${Y(y + h / 2)} ${X(x + .62)} ${Y(y + h)}" fill="none" stroke="#6b5847"/>`
          : `<path d="M${X(x + w - .62)} ${Y(y)}Q${X(x + w - .55)} ${Y(y + h / 2)} ${X(x + w - .62)} ${Y(y + h)}" fill="none" stroke="#6b5847"/>`;
      }
      if (q.t === 'inodoro') { const r = q.rot === 180; o += R(x, r ? y + .42 : y, .4, .18, st, .02) + `<ellipse cx="${X(x + .2)}" cy="${Y(y + (r ? .18 : .42))}" rx="${.17 * S}" ry="${.24 * S}" ${st}/>` }
      if (q.t === 'ducha') { o += R(x, y, q.w, q.h, `fill="#e4ebec" stroke="${INK2}"`) + C(x + q.w / 2, y + q.h / 2, .05, `fill="none" stroke="${INK2}"`) }
      if (q.t === 'lav') { o += R(x, y, .45, .4, st, .04) + `<ellipse cx="${X(x + .24)}" cy="${Y(y + .2)}" rx="${.14 * S}" ry="${.12 * S}" ${st}/>` }
      if (q.t === 'escalera') { const w = q.w, h = q.h, n = Math.max(3, Math.round(w / .27)); o += R(x, y, w, h, `fill="#efe7d6" stroke="${INK2}" stroke-width="1.2"`); for (let i = 1; i < n; i++) o += `<line x1="${X(x + i * w / n)}" y1="${Y(y)}" x2="${X(x + i * w / n)}" y2="${Y(y + h)}" stroke="${INK2}" stroke-width=".8"/>`; o += `<path d="M${X(x + .15)} ${Y(y + h / 2)}H${X(x + w - .2)}m-8 -5l8 5l-8 5" fill="none" stroke="${INK}" stroke-width="1.2"/>` }
      if (q.t === 'estufa') { o += R(x, y, q.w, q.h, `fill="#d9d2c4" stroke="${INK2}" stroke-width="1.2"`) + C(x + q.w / 2, y + q.h / 2, Math.min(q.w, q.h) * .28, `fill="#e9a36a" fill-opacity=".55" stroke="${INK2}"`) }
      if (q.t === 'sofa') { const w = q.w, h = q.h; o += R(x, y, w, h, `fill="#e7dfcf" stroke="${INK2}"`, .08) + R(x + .12, y + .12, w - .24, h - .24, `fill="#f3ede1" stroke="${INK2}" stroke-width=".8"`, .05) }
      if (q.t === 'mesa') {
        const w = q.w, h = q.h, n = Math.max(2, Math.round(w / .6));
        for (let i = 0; i < n; i++) { const cx = x + (i + .5) * w / n; o += C(cx, y - .22, .17, `fill="#fffdf8" stroke="${INK2}" stroke-width=".8"`) + C(cx, y + h + .22, .17, `fill="#fffdf8" stroke="${INK2}" stroke-width=".8"`) }
        o += R(x, y, w, h, `fill="#d8bf95" stroke="${INK2}" stroke-width="1.2"`, .05);
      }
    });
    o += '</g>';
    // locales
    (P.locales || []).forEach(l => {
      o += `<text x="${X(l.x)}" y="${Y(l.y)}" text-anchor="middle" font-family="${HAND}" font-weight="700" font-size="26" fill="#3b2f25" paint-order="stroke" stroke="#f6eedd" stroke-width="4" stroke-opacity=".8">${l.n.toLowerCase()}</text>` +
        (l.a ? `<text x="${X(l.x)}" y="${Y(l.y) + 20}" text-anchor="middle" font-family="${HAND}" font-size="19" fill="#6b5847" paint-order="stroke" stroke="#f6eedd" stroke-width="3" stroke-opacity=".8">${(+l.a).toFixed(1).replace('.', ',')} m²</text>` : '');
    });
    // cotas
    const chain = (arr, isX) => {
      if (!arr || arr.length < 2) return;
      const off = isX ? Y(P.prof) + e + 36 : X(P.ancho) + e + 36;
      for (let i = 0; i < arr.length; i++) {
        const v = isX ? X(arr[i]) : Y(arr[i]);
        o += isX ? `<line x1="${v}" y1="${off - 9}" x2="${v}" y2="${off + 9}" stroke="#8a7560"/><line x1="${v - 5}" y1="${off + 5}" x2="${v + 5}" y2="${off - 5}" stroke="#3b2f25" stroke-width="1.6"/>`
          : `<line x1="${off - 9}" y1="${v}" x2="${off + 9}" y2="${v}" stroke="#8a7560"/><line x1="${off - 5}" y1="${v + 5}" x2="${off + 5}" y2="${v - 5}" stroke="#3b2f25" stroke-width="1.6"/>`;
        if (i) {
          const a = isX ? X(arr[i - 1]) : Y(arr[i - 1]), mid = (a + v) / 2, txt = f2(arr[i] - arr[i - 1]);
          o += isX ? `<text x="${mid}" y="${off - 7}" text-anchor="middle" font-family="${HAND}" font-size="19" fill="#6b5847">${txt}</text>`
            : `<text x="${off + 7}" y="${mid + 4}" font-family="${HAND}" font-size="19" fill="#6b5847">${txt}</text>`;
        }
      }
      o += isX ? `<line x1="${X(arr[0]) - 12}" y1="${off}" x2="${X(arr[arr.length - 1]) + 12}" y2="${off}" stroke="#8a7560"/>` : `<line x1="${off}" y1="${Y(arr[0]) - 12}" x2="${off}" y2="${Y(arr[arr.length - 1]) + 12}" stroke="#8a7560"/>`;
    };
    chain(P.cotasX, true); chain(P.cotasY, false);
    // norte (P.norte = grados, 0 = arriba)
    o += `<g transform="translate(${pad - 70} ${pad - 62}) rotate(${+P.norte || 0})"><circle r="20" fill="${PAPER}" stroke="${INK}"/><path d="M0 -17 L7 10 L0 5 Z" fill="${INK}"/><path d="M0 -17 L-7 10 L0 5 Z" fill="none" stroke="${INK}"/><text y="-26" text-anchor="middle" font-family="${MONO}" font-size="11" font-weight="500" fill="${INK}">N</text></g>`;
    // escala gráfica + rótulo
    const VW = Math.max(W + pad * 2 + 120, 760), sy = Y(P.prof) + e + 82, paso = S < 60 ? 5 : 1;
    o += `<g font-family="${MONO}" font-size="10" fill="${INK2}"><rect x="${pad}" y="${sy}" width="${S * paso}" height="6" fill="${INK}"/><rect x="${pad + S * paso}" y="${sy}" width="${S * paso}" height="6" fill="none" stroke="${INK}"/><text x="${pad}" y="${sy + 20}">0</text><text x="${pad + S * paso}" y="${sy + 20}" text-anchor="middle">${paso}</text><text x="${pad + 2 * S * paso}" y="${sy + 20}" text-anchor="middle">${2 * paso} m</text></g>`;
    const ry = sy + 40;
    const medida = P.medida || `${f2(P.ancho + (P.murosExt ? 0 : 2 * P.eExt))} × ${f2(P.prof + (P.murosExt ? 0 : 2 * P.eExt))} m`;
    o += `<g transform="translate(${pad} ${ry})"><text x="0" y="30" font-family="${SERIF}" font-style="italic" font-weight="500" font-size="38" fill="#3b2f25">${m.nombre || ''}${P.nivel ? ` <tspan font-size="24" fill="#6b5847">· ${P.nivel}</tspan>` : ''}</text>
      <text x="2" y="58" font-family="${HAND}" font-size="22" fill="#6b5847">${m.m2} m² cubiertos${+m.deck ? ' · ' + m.deck + ' m² de decks' : ''} · ${medida} · cotas en metros</text>
      <text x="${VW - pad * 2}" y="58" text-anchor="end" font-family="${HAND}" font-size="20" fill="#8a7560">Smart Building Uruguay</text></g>`;
    const VH = ry + 76;
    return `<svg viewBox="0 0 ${VW} ${VH}" role="img" aria-label="Planta de ${m.nombre}">${papel('pl', VW, VH)}${o}</svg>`;
  };

  /* ---------------- CORTE CON CERCHA ----------------
     C = { luz, altura, seccion (cm), material, separacion, cantidad, columna, techo } */
  window.SBUcercha = function (C, m) {
    const L = +C.luz, Ht = +C.altura, b = (+C.seccion || 20) / 100, col = +C.columna || 3, alero = 0.5;
    if (!(L > 0 && Ht > 0)) return '';
    const [wood, woodD] = mad(C.material);
    const S = Math.min(120, 1050 / (L + 2 * alero)), padX = 110, top = 70;
    const totH = col + Ht + .35;
    const base = top + totH * S;                 // nivel de piso
    const X = x => padX + alero * S + x * S, Y = y => base - y * S;   // y en metros desde el piso
    const yc = col;                              // apoyo de la cercha
    const ang = Math.atan2(Ht - b * 1.4, L / 2);
    const hh = b * 1.4;                          // talón en los extremos
    const dv = b / Math.cos(ang);
    const yTop = x => yc + hh + (Ht - hh) * (x <= L / 2 ? x : L - x) / (L / 2);
    const yIn = x => yTop(x) - dv;
    let o = `<defs>
      <pattern id="ce-v" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(${(-ang * 180 / Math.PI).toFixed(1)})"><rect width="14" height="14" fill="${wood}"/><path d="M0 4 Q7 2 14 4 M0 10 Q7 12 14 10" stroke="${woodD}" stroke-width=".7" fill="none" opacity=".7"/></pattern>
      <linearGradient id="ce-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bcd4e0" stop-opacity=".75"/><stop offset="1" stop-color="#e6eef0" stop-opacity="0"/></linearGradient>
      <pattern id="ce-t" width="16" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="10" stroke="${INK2}" stroke-width=".8"/></pattern>
    </defs>`;
    // cielo: aguada suave
    o += `<rect x="${X(-alero) - 30}" y="${Y(yc + Ht + .3) - 10}" width="${(L + 2 * alero) * S + 60}" height="${(Ht + .6) * S}" fill="url(#ce-sky)" filter="url(#cem)"/>`;
    // terreno
    o += `<rect x="${X(-alero) - 40}" y="${base}" width="${(L + 2 * alero) * S + 80}" height="16" fill="url(#ce-t)"/><line x1="${X(-alero) - 40}" y1="${base}" x2="${X(L + alero) + 40}" y2="${base}" stroke="${INK}" stroke-width="2"/>`;
    // columnas
    const cw = Math.max(.12, b * .6) * S;
    [0, L].forEach(x => { o += `<rect x="${X(x) - (x ? cw : 0)}" y="${Y(yc)}" width="${cw}" height="${col * S}" fill="#5b5953" stroke="${INK}" stroke-width="1.2"/>` });
    // techo: paquete sobre los pares, con alero
    const tk = .14;
    const rx0 = -alero, rx1 = L + alero;
    const yR = x => yTop(Math.min(Math.max(x, 0), L)) + (x < 0 ? x : x > L ? -(x - L) : 0) * Math.tan(ang);
    o += `<path d="M${X(rx0)} ${Y(yR(rx0))}L${X(L / 2)} ${Y(yTop(L / 2))}L${X(rx1)} ${Y(yR(rx1))}L${X(rx1)} ${Y(yR(rx1) + tk)}L${X(L / 2)} ${Y(yTop(L / 2) + tk / Math.cos(ang))}L${X(rx0)} ${Y(yR(rx0) + tk)}Z" fill="#3b3a37" stroke="${INK}" stroke-width="1.2"/>`;
    o += `<path d="M${X(rx0)} ${Y(yR(rx0) + .03)}L${X(L / 2)} ${Y(yTop(L / 2) + .03)}L${X(rx1)} ${Y(yR(rx1) + .03)}" fill="none" stroke="${wood}" stroke-width="2"/>`;
    // cercha: contorno lleno de madera
    o += `<path d="M${X(0)} ${Y(yc)}L${X(L)} ${Y(yc)}L${X(L)} ${Y(yc + hh)}L${X(L / 2)} ${Y(yc + Ht)}L${X(0)} ${Y(yc + hh)}Z" fill="url(#ce-v)" stroke="#3b2f25" stroke-width="1.8" stroke-linejoin="round"/>`;
    // huecos interiores (dejan ver el pendolón al medio)
    const x0 = (b - hh + dv) * (L / 2) / (Ht - hh), xm = L / 2 - b / 2;
    const hole = (s) => {
      const fx = x => s > 0 ? x : L - x;
      return `<path d="M${X(fx(x0))} ${Y(yc + b)}L${X(fx(xm))} ${Y(yc + b)}L${X(fx(xm))} ${Y(yIn(xm))}Z" fill="#f3e6cc" stroke="#3b2f25" stroke-width="1.4" stroke-linejoin="round"/>`;
    };
    o += hole(1) + hole(-1);
    // diagonales (puntales) del pie del pendolón al cuarto de luz
    const strut = (s) => {
      const fx = x => s > 0 ? x : L - x;
      const xa = L / 4 - b * .6, xb = xa + b * 1.6;
      const p = [[xm, yc + b], [xa, yIn(xa)], [xb, yIn(xb)], [xm, yc + b + b * 1.15]];
      return `<path d="M${p.map(([x, y]) => X(fx(x)) + ' ' + Y(y)).join('L')}Z" fill="url(#ce-v)" stroke="#3b2f25" stroke-width="1.4" stroke-linejoin="round"/>`;
    };
    o += strut(1) + strut(-1);
    // empalme del tirante al medio (planchuela)
    o += `<line x1="${X(L / 2)}" y1="${Y(yc)}" x2="${X(L / 2)}" y2="${Y(yc + b)}" stroke="${INK}" stroke-width="1.6"/><rect x="${X(L / 2) - .25 * S}" y="${Y(yc) - 3}" width="${.5 * S}" height="3" fill="${INK}"/>`;
    // ejes
    o += `<line x1="${X(L / 2)}" y1="${Y(yc + Ht + .45)}" x2="${X(L / 2)}" y2="${base + 4}" stroke="${INK2}" stroke-width=".7" stroke-dasharray="16 4 3 4"/>`;
    // persona para escala (1,75 m)
    const px = X(L * .28), ps = S / 100;
    o += `<g fill="${INK2}" opacity=".75" transform="translate(${px} ${base}) scale(${ps})"><circle cx="0" cy="-163" r="11"/><path d="M-13 -148 Q0 -153 13 -148 L17 -92 L10 -90 L8 -60 L9 0 L2 0 L0 -58 L-2 0 L-9 0 L-8 -60 L-10 -90 L-17 -92Z"/></g>`;
    // un banco/mesa sencilla para darle vida
    const tx = X(L * .62);
    o += `<g stroke="${INK2}" stroke-width="1.2" fill="none" opacity=".75"><line x1="${tx}" y1="${base - .75 * S}" x2="${tx + 1.6 * S}" y2="${base - .75 * S}" stroke-width="3"/><line x1="${tx + .15 * S}" y1="${base - .75 * S}" x2="${tx + .15 * S}" y2="${base}"/><line x1="${tx + 1.45 * S}" y1="${base - .75 * S}" x2="${tx + 1.45 * S}" y2="${base}"/><path d="M${tx + .7 * S} ${base - .75 * S} q8 -30 0 -48 q-8 18 0 48" fill="#c9d1b8" stroke="${INK2}"/></g>`;
    // cotas
    const dim = (x1, y1, x2, y2, txt, side) => {
      const vert = x1 === x2;
      let s = `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${INK2}"/>`;
      [[x1, y1], [x2, y2]].forEach(([x, y]) => { s += `<line x1="${x - 5}" y1="${y + 5}" x2="${x + 5}" y2="${y - 5}" stroke="${INK}" stroke-width="1.6"/>` });
      s += vert ? `<text x="${x1 + (side || 8)}" y="${(y1 + y2) / 2 + 4}" ${side < 0 ? 'text-anchor="end"' : ''} font-family="${HAND}" font-size="24" fill="${INK}">${txt}</text>`
        : `<text x="${(x1 + x2) / 2}" y="${y1 - 8}" text-anchor="middle" font-family="${HAND}" font-size="24" fill="${INK}">${txt}</text>`;
      return s;
    };
    const dy = base + 52;
    o += dim(X(0), dy, X(L), dy, `luz ${f2(L)} m`);
    o += `<line x1="${X(0)}" y1="${base + 6}" x2="${X(0)}" y2="${dy + 8}" stroke="${INK2}" stroke-width=".6"/><line x1="${X(L)}" y1="${base + 6}" x2="${X(L)}" y2="${dy + 8}" stroke="${INK2}" stroke-width=".6"/>`;
    const dx = X(L + alero) + 46;
    o += dim(dx, Y(yc), dx, Y(yc + Ht), f2(Ht), 8) + dim(dx, base, dx, Y(yc), f2(col), 8);
    o += `<line x1="${X(L / 2) + 6}" y1="${Y(yc + Ht)}" x2="${dx + 8}" y2="${Y(yc + Ht)}" stroke="${INK2}" stroke-width=".6" stroke-dasharray="4 4"/>`;
    // ángulo
    const ax = X(0) + 1.1 * S;
    o += `<path d="M${ax} ${Y(yc + hh)}A${1.1 * S} ${1.1 * S} 0 0 0 ${X(0) + 1.1 * S * Math.cos(ang)} ${Y(yc + hh) - 1.1 * S * Math.sin(ang)}" fill="none" stroke="${INK2}" stroke-width=".8"/><text x="${ax + 8}" y="${Y(yc + hh) - 6}" font-family="${HAND}" font-size="24" fill="${INK2}">${(ang * 180 / Math.PI).toFixed(0)}°</text>`;
    // llamadas
    const call = (x, y, tx, ty, txt, izq) => `<circle cx="${x}" cy="${y}" r="3" fill="${INK}"/><path d="M${x} ${y}L${tx} ${ty}" stroke="${INK}" stroke-width=".8" fill="none"/><text x="${tx + ((izq ?? tx < x) ? -6 : 6)}" y="${ty + 4}" ${(izq ?? tx < x) ? 'text-anchor="end"' : ''} font-family="${HAND}" font-size="24" fill="${INK}">${txt}</text>`;
    const mat = (C.material || 'madera').toUpperCase();
    o += call(X(L * .15), Y(yTop(L * .15) - dv / 2), X(L * .1), Y(yc - .55), `par · ${(C.material || 'madera').toLowerCase()} ${C.seccion || 20}×${C.seccion || 20}`, false);
    o += call(X(L * .82), Y(yc + b / 2), X(L + alero) - 10, Y(yc) + 34, 'tirante');
    o += call(X(L * .7), Y(yIn(L * .7) - .25), X(L * .77), Y(yc + Ht * 1.02), 'puntal');
    if (C.techo) o += call(X(L * .38), Y(yTop(L * .38) + .08), X(L * .3), Y(yc + Ht + .55), String(C.techo));
    // rótulo
    const VW = X(L + alero) + 130, ry = dy + 40;
    const sub = [`${mat} ${C.seccion || 20} × ${C.seccion || 20} cm`, +C.separacion ? `una cada ${f2(C.separacion)} m` : '', +C.cantidad ? `${C.cantidad} cerchas a la vista` : '', 'cotas en metros'].filter(Boolean).join(' · ');
    o += `<g transform="translate(${padX} ${ry})"><text x="0" y="34" font-family="${SERIF}" font-style="italic" font-weight="500" font-size="44" fill="#3b2f25">${m.nombre || ''} <tspan font-size="28" fill="#6b5847">· corte por la cercha</tspan></text>
      <text x="2" y="66" font-family="${HAND}" font-size="26" fill="#6b5847">${sub}</text>
      <text x="${VW - padX * 2}" y="34" text-anchor="end" font-family="${HAND}" font-size="24" fill="#8a7560">Smart Building Uruguay</text></g>`;
    const VH = ry + 80;
    return `<svg viewBox="0 0 ${VW} ${VH}" role="img" aria-label="Corte de ${m.nombre} por la cercha de ${C.material || 'madera'}">${papel('ce', VW, VH)}${o}</svg>`;
  };

  /* ---------------- FACHADA ----------------
     Alzado arquitectónico con aguadas. Medidas en metros.
     F = { ancho, titulo, nota, notaX,
           volumenes:[{x,w,muro,piso,techo:'frente'|'lado'|'cuatroAguas'|'plano',cumbrera,alero,revest,marco,zocalo,techoClaro,hip}],
           aberturas:[{x,y,w,h,tipo:'ventana'|'puerta'|'corrediza'|'fija'|'redonda'|'frontonVidrio',div,travesano}],
           cercha:{x,w,piso,muro,cumbrera}, pergolas:[{x,w,h,color}], decks:[{x,w,h,escalera}], barandas:[{x,w,y}],
           chimenea:{x,y0,h}, plantas:[{x,w,c}], arboles:[{x,h|r,k:'redondo'|'eucalipto'|'palmera'|'pino'}], personas:[x] } */
  window.SBUfachada = function (F, m) {
    const S = Math.min(58, 1060 / F.ancho), padX = 70, top = 96;
    const vols = F.volumenes || [];
    const alto = Math.max(...vols.map(v => (v.piso || 0) + (v.techo === 'plano' ? v.muro + .35 : (v.cumbrera || v.muro) + .3)),  ...(F.arboles || []).map(a => (a.h || a.r * 3.2) * .9)) + .3;
    const base = top + alto * S, X = x => padX + x * S, Y = y => base - y * S;
    const VW = Math.round(F.ancho * S + padX * 2), VH = Math.round(base + 150);
    const K = '#2a241e', K2 = '#5a4e42', K3 = '#8a7c6c';
    let sd = 0; for (const c of (m.id || 'x')) sd = (sd * 31 + c.charCodeAt(0)) | 0;
    const rnd = () => { sd |= 0; sd = sd + 0x6D2B79F5 | 0; let t = Math.imul(sd ^ sd >>> 15, 1 | sd); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 };
    const f1 = v => v.toFixed(1);
    // un objeto = aguada (granulada) + líneas (limpias)
    const obj = (wash, lines) => `<g>${wash ? `<g filter="url(#fac)">${wash}</g>` : ''}${lines ? `<g fill="none" stroke="${K}" stroke-linecap="round" stroke-linejoin="round" stroke-opacity=".95">${lines}</g>` : ''}</g>`;
    const ln = (x1, y1, x2, y2, w = .8, c = K) => `<line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}" stroke="${c}" stroke-width="${w}"/>`;
    const poly = (pts, extra) => `<path d="M${pts.map(p => f1(p[0]) + ' ' + f1(p[1])).join('L')}Z" ${extra}/>`;

    /* ---- definiciones ---- */
    const bw = Math.max(5, .14 * S), cw = Math.max(3.4, .076 * S);
    let defs = `
      <linearGradient id="f-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fc0d3" stop-opacity=".8"/><stop offset=".6" stop-color="#d6e3e6" stop-opacity=".45"/><stop offset="1" stop-color="#f6f0e3" stop-opacity="0"/></linearGradient>
      <linearGradient id="f-fadeg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".08" stop-color="#fff"/><stop offset=".92" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
      <mask id="f-fade" maskContentUnits="objectBoundingBox"><rect width="1" height="1" fill="url(#f-fadeg)"/></mask>
      <linearGradient id="f-grass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#95ab76"/><stop offset=".5" stop-color="#b9c79a" stop-opacity=".6"/><stop offset="1" stop-color="#d8dcbc" stop-opacity="0"/></linearGradient>
      <linearGradient id="f-warm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4d9a6"/><stop offset=".7" stop-color="#e8b673"/><stop offset="1" stop-color="#d1924f"/></linearGradient>
      <linearGradient id="f-cool" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e3ecee"/><stop offset=".55" stop-color="#aec5cd"/><stop offset="1" stop-color="#8aa6b1"/></linearGradient>
      <linearGradient id="f-eave" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2e2014" stop-opacity=".42"/><stop offset="1" stop-color="#2e2014" stop-opacity="0"/></linearGradient>
      <pattern id="fr-madera" width="${bw}" height="60" patternUnits="userSpaceOnUse"><rect width="${bw}" height="60" fill="#c79664"/><rect width="${bw / 2}" height="60" fill="#c18e5b" opacity=".6"/><line x1=".4" y1="0" x2=".4" y2="60" stroke="#6e4b2c" stroke-width=".55"/></pattern>
      <pattern id="fr-maderaClara" width="${bw}" height="60" patternUnits="userSpaceOnUse"><rect width="${bw}" height="60" fill="#d8c3a0"/><rect width="${bw / 2}" height="60" fill="#d1b993" opacity=".6"/><line x1=".4" y1="0" x2=".4" y2="60" stroke="#7e6a50" stroke-width=".55"/></pattern>
      <pattern id="fr-chapa" width="${cw}" height="60" patternUnits="userSpaceOnUse"><rect width="${cw}" height="60" fill="#3b3e42"/><rect x="${cw / 2}" width="${cw / 2}" height="60" fill="#2f3235"/><line x1=".3" y1="0" x2=".3" y2="60" stroke="#55595e" stroke-width=".6"/></pattern>
      <pattern id="fr-chapaGris" width="${cw}" height="60" patternUnits="userSpaceOnUse"><rect width="${cw}" height="60" fill="#8f9293"/><rect x="${cw / 2}" width="${cw / 2}" height="60" fill="#7f8283"/><line x1=".3" y1="0" x2=".3" y2="60" stroke="#666a6c" stroke-width=".6"/></pattern>
      <pattern id="fr-blanco" width="60" height="${bw}" patternUnits="userSpaceOnUse"><rect width="60" height="${bw}" fill="#ece6d9"/><line x1="0" y1="${bw - .4}" x2="60" y2="${bw - .4}" stroke="#a89e8b" stroke-width=".55"/></pattern>
      <pattern id="fr-techo" width="${cw}" height="60" patternUnits="userSpaceOnUse"><rect width="${cw}" height="60" fill="#45484c"/><rect x="${cw / 2}" width="${cw / 2}" height="60" fill="#383b3f"/><line x1=".3" y1="0" x2=".3" y2="60" stroke="#5f6368" stroke-width=".5"/></pattern>
      <pattern id="fr-techoG" width="${cw}" height="60" patternUnits="userSpaceOnUse"><rect width="${cw}" height="60" fill="#c3c5c5"/><rect x="${cw / 2}" width="${cw / 2}" height="60" fill="#b1b4b5"/><line x1=".3" y1="0" x2=".3" y2="60" stroke="#8e9294" stroke-width=".5"/></pattern>
      <pattern id="fr-piedra" width="${.6 * S}" height="${.25 * S}" patternUnits="userSpaceOnUse"><rect width="${.6 * S}" height="${.25 * S}" fill="#bba98b"/><path d="M0 ${.125 * S}H${.6 * S}M${.3 * S} 0V${.125 * S}M${.12 * S} ${.125 * S}V${.25 * S}M${.45 * S} ${.125 * S}V${.25 * S}" stroke="#8d7b5f" stroke-width=".6"/></pattern>
      <pattern id="fr-hormigon" width="${.9 * S}" height="${.45 * S}" patternUnits="userSpaceOnUse"><rect width="${.9 * S}" height="${.45 * S}" fill="#bfbcb5"/><path d="M0 ${.45 * S - .3}H${.9 * S}M${.9 * S - .3} 0V${.45 * S}" stroke="#9c9890" stroke-width=".5"/><circle cx="${.15 * S}" cy="${.12 * S}" r=".8" fill="#9c9890"/><circle cx="${.75 * S}" cy="${.12 * S}" r=".8" fill="#9c9890"/></pattern>`;

    /* ---- capas ---- */
    let fondo = '', atras = '', casa = '', frente = '';

    // cielo con nubes suaves
    fondo += `<rect x="${X(-.9)}" y="${top - 70}" width="${(F.ancho + 1.8) * S}" height="${base - top + 70}" fill="url(#f-sky)" mask="url(#f-fade)" filter="url(#faa)"/>`;
    // monte lejano
    let d = `M${X(-.9)} ${base}L${X(-.9)} ${f1(Y(1.4))}`; for (let x = -.9; x <= F.ancho + .9;) { const st = .5 + rnd() * .9, h = 1.3 + Math.sin(x * .7) * .4 + rnd() * .5; d += `Q${f1(X(x + st / 2))} ${f1(Y(h + .55))} ${f1(X(x + st))} ${f1(Y(h))}`; x += st } d += `L${X(F.ancho + .9)} ${base}Z`;
    fondo += `<path d="${d}" fill="#a7b9a0" opacity=".4" mask="url(#f-fade)"/>`;
    fondo += `<rect x="${X(-.9)}" y="${base}" width="${(F.ancho + 1.8) * S}" height="56" fill="url(#f-grass)" mask="url(#f-fade)"/>`;

    /* ---- árboles ---- */
    const copa = (cx, cy, r, n = 11) => {
      const pts = []; for (let i = 0; i < n; i++) { const a = i / n * 6.283 + rnd() * .3; pts.push([a, r * (.82 + rnd() * .3)]) }
      let p = ''; pts.forEach(([a, rr], i) => { const [a2, r2] = pts[(i + 1) % n], am = (a + (a2 < a ? a2 + 6.283 : a2)) / 2, rm = (rr + r2) / 2 * 1.22;
        const x1 = cx + Math.cos(a) * rr, y1 = cy + Math.sin(a) * rr, x2 = cx + Math.cos(a2) * r2, y2 = cy + Math.sin(a2) * r2, qx = cx + Math.cos(am) * rm, qy = cy + Math.sin(am) * rm;
        p += (i ? '' : `M${f1(x1)} ${f1(y1)}`) + `Q${f1(qx)} ${f1(qy)} ${f1(x2)} ${f1(y2)}` });
      return p + 'Z';
    };
    const arbol = a => {
      const k = a.k || 'redondo', H = (a.h || a.r * 3.2) * S * .86, x0 = X(a.x), y0 = base;
      let w = '', l = '';
      w += `<ellipse cx="${f1(x0 + H * .08)}" cy="${y0 + 2}" rx="${f1(H * .22)}" ry="${f1(H * .025 + 2)}" fill="#4b4030" opacity=".22"/>`;
      if (k === 'palmera') {
        const lean = (rnd() - .5) * H * .25, tx = x0 + lean, ty = y0 - H;
        const tr = `M${f1(x0 - H * .02)} ${y0}Q${f1(x0 + lean * .2)} ${f1(y0 - H * .5)} ${f1(tx - H * .012)} ${f1(ty)}L${f1(tx + H * .012)} ${f1(ty)}Q${f1(x0 + lean * .2 + H * .025)} ${f1(y0 - H * .5)} ${f1(x0 + H * .02)} ${y0}Z`;
        l += `<path d="${tr}" fill="#2a2420" stroke="none" opacity=".88"/>`;
        for (let t = .06; t < .95; t += .045) { const yy = y0 - H * t, xx = x0 + lean * t * t * .9 + lean * .1 * t; l += ln(xx - H * .024 * (1 - t * .4), yy, xx + H * .024 * (1 - t * .4), yy + 1.5, .9, '#f6f0e3') }
        for (let i = 0; i < 12; i++) {
          const side = i % 2 ? 1 : -1, a = side * (.25 + (i >> 1) / 6 * 1.35) + (rnd() - .5) * .15, len = H * (.26 + rnd() * .08);
          const ex = tx + Math.sin(a) * len, ey = ty - Math.cos(a) * len * .35 + len * (.15 + Math.abs(a) * .32), qx = tx + Math.sin(a) * len * .45, qy = ty - len * (.22 + (1.6 - Math.abs(a)) * .1);
          w += `<path d="M${f1(tx)} ${f1(ty)}Q${f1(qx)} ${f1(qy)} ${f1(ex)} ${f1(ey)}" stroke="#8aa36a" stroke-width="${f1(H * .028)}" fill="none" opacity=".5" stroke-linecap="round"/>`;
          l += `<path d="M${f1(tx)} ${f1(ty)}Q${f1(qx)} ${f1(qy)} ${f1(ex)} ${f1(ey)}" stroke="#3e4a2c" stroke-width=".8"/>`;
          for (let t = .12; t < .97; t += .055) {
            const bx = (1 - t) * (1 - t) * tx + 2 * (1 - t) * t * qx + t * t * ex, by = (1 - t) * (1 - t) * ty + 2 * (1 - t) * t * qy + t * t * ey;
            const tgx = 2 * (1 - t) * (qx - tx) + 2 * t * (ex - qx), tgy = 2 * (1 - t) * (qy - ty) + 2 * t * (ey - qy), tl = Math.hypot(tgx, tgy), ll = H * .045 * Math.sin(Math.PI * Math.min(1, t * 1.15));
            const nx = -tgy / tl, ny = tgx / tl, dx = tgx / tl * ll * .45, dy = tgy / tl * ll * .45 + ll * .35;
            l += ln(bx, by, bx + nx * ll + dx, by + ny * ll + dy, .45, '#4d5c36') + ln(bx, by, bx - nx * ll + dx, by - ny * ll + dy, .45, '#4d5c36');
          }
        }
        l += `<circle cx="${f1(tx)}" cy="${f1(ty)}" r="${f1(H * .018)}" fill="#6b5a3e" stroke-width=".6"/>`;
        return obj(w, l);
      }
      // árbol en tinta: tronco y ramas con trazo de pincel, hojas en aguada
      const INK = '#1f1b18';
      const seg = (xa, ya, xb, yb, wa, wb) => { const dx = xb - xa, dy = yb - ya, dl = Math.hypot(dx, dy) || 1, nx = -dy / dl, ny = dx / dl;
        const mx = (xa + xb) / 2 + nx * dl * (rnd() - .5) * .12, my = (ya + yb) / 2 + ny * dl * (rnd() - .5) * .12, wm = (wa + wb) / 2;
        return `<path d="M${f1(xa + nx * wa / 2)} ${f1(ya + ny * wa / 2)}Q${f1(mx + nx * wm / 2)} ${f1(my + ny * wm / 2)} ${f1(xb + nx * wb / 2)} ${f1(yb + ny * wb / 2)}L${f1(xb - nx * wb / 2)} ${f1(yb - ny * wb / 2)}Q${f1(mx - nx * wm / 2)} ${f1(my - ny * wm / 2)} ${f1(xa - nx * wa / 2)} ${f1(ya - ny * wa / 2)}Z" fill="${INK}"/><circle cx="${f1(xb)}" cy="${f1(yb)}" r="${f1(wb / 2)}" fill="${INK}"/>` };
      const P = { redondo: { tr: .38, sp: .62, br: 3, d: 6, up: .15, lf: .11 }, eucalipto: { tr: .5, sp: .38, br: 2, d: 6, up: .55, lf: .085 }, pino: { tr: .58, sp: 1.15, br: 2, d: 5, up: -.15, lf: .13 } }[k] || { tr: .4, sp: .6, br: 3, d: 6, up: .1, lf: .1 };
      let ink = '', hojas = [], tips = [];
      const grow = (x, y, ang, len, wd, depth) => {
        const a2 = ang + (rnd() - .5) * .35, xm2 = x + Math.cos(ang) * len * .5, ym2 = y + Math.sin(ang) * len * .5, xb = xm2 + Math.cos(a2) * len * .5, yb = ym2 + Math.sin(a2) * len * .5, wb = wd * .62;
        ink += seg(x, y, xm2, ym2, wd, (wd + wb) / 2) + seg(xm2, ym2, xb, yb, (wd + wb) / 2, wb);
        if (depth <= 0 || len < H * .03) { tips.push([xb, yb]); return }
        if (depth <= 2) tips.push([xb, yb]);
        const n = P.br + (rnd() < .35 ? 1 : 0);
        for (let i = 0; i < n; i++) {
          const side = (i / Math.max(1, n - 1) - .5) * 2, na = a2 + side * P.sp * (.7 + rnd() * .5) - P.up * Math.sign(Math.cos(a2)) * .2 + (rnd() - .5) * .25;
          const ca = Math.max(-Math.PI + .25, Math.min(-.25, na));
          grow(xb, yb, k === 'pino' && depth < P.d - 1 ? (Math.cos(ca) < 0 ? -Math.PI + .12 + rnd() * .25 : -.12 - rnd() * .25) : ca, len * (.62 + rnd() * .16), wb * (.7 + rnd() * .15), depth - 1);
        }
      };
      const lean = (rnd() - .5) * .35, trLen = H * P.tr, tw = H * (k === 'eucalipto' ? .045 : .06);
      // tronco con una leve curva, base ensanchada
      const xt = x0 + Math.sin(lean) * trLen, yt = y0 - trLen;
      ink += seg(x0, y0, (x0 + xt) / 2 + H * .02 * (rnd() - .5), (y0 + yt) / 2, tw * 1.25, tw * .9) + seg((x0 + xt) / 2, (y0 + yt) / 2, xt, yt, tw * .9, tw * .7);
      ink += `<path d="M${f1(x0 - tw * 1.1)} ${y0}Q${f1(x0 - tw * .5)} ${f1(y0 - tw * .8)} ${f1(x0 - tw * .4)} ${f1(y0 - tw * 2)}L${f1(x0 + tw * .5)} ${f1(y0 - tw * 2)}Q${f1(x0 + tw * .6)} ${f1(y0 - tw * .7)} ${f1(x0 + tw * 1.2)} ${y0}Z" fill="${INK}"/>`;
      const nb = k === 'eucalipto' ? 2 : 3;
      for (let i = 0; i < nb; i++) { const a = -Math.PI / 2 + lean + ((i / (nb - 1)) - .5) * (k === 'pino' ? 1.6 : 1.1) + (rnd() - .5) * .3; grow(xt, yt, a, H * (k === 'pino' ? .22 : .2) * (.85 + rnd() * .3), tw * .65, P.d - 1) }
      if (k === 'pino') for (let i = 0; i < 2; i++) { const yy = y0 - trLen * (.55 + i * .2), side = i % 2 ? 1 : -1; grow(x0 + Math.sin(lean) * trLen * (.55 + i * .2), yy, side > 0 ? -.2 : -Math.PI + .2, H * .18, tw * .45, 3) }
      // aguadas de hojas en las puntas (sin contorno, bordes de acuarela)
      const verdes = k === 'eucalipto' ? ['#93ad8a', '#a9c09a', '#7f9a78', '#b9cba6'] : k === 'pino' ? ['#5f7d55', '#6f8d5f', '#86a170', '#4f6c49'] : ['#7f9c62', '#97b277', '#a9c08a', '#6d8a55'];
      let lw = '';
      tips.forEach(([tx, ty], i) => { const r = H * P.lf * (.6 + rnd() * .6), c = verdes[i % verdes.length];
        lw += k === 'pino' ? `<ellipse cx="${f1(tx)}" cy="${f1(ty - r * .2)}" rx="${f1(r * 1.6)}" ry="${f1(r * .55)}" fill="${c}" opacity=".55"/>` : `<ellipse cx="${f1(tx + (rnd() - .5) * r)}" cy="${f1(ty - r * .25)}" rx="${f1(r)}" ry="${f1(r * .8)}" fill="${c}" opacity=".42"/>` });
      // toques de hoja en tinta
      let dots = ''; tips.forEach(([tx, ty]) => { for (let j = 0; j < 3; j++) { const a = rnd() * 6.283, rr = H * P.lf * .6 * rnd(), sx = tx + Math.cos(a) * rr, sy = ty + Math.sin(a) * rr * .7; dots += `<path d="M${f1(sx)} ${f1(sy)}q${f1(H * .006)} ${f1(-H * .008)} ${f1(H * .014)} ${f1(-H * .002)}" stroke="#2e3a26" stroke-width="1.1" fill="none" opacity=".75"/>` } });
      return `<g><ellipse cx="${f1(x0 + H * .1)}" cy="${y0 + 2}" rx="${f1(H * .2)}" ry="${f1(H * .02 + 2)}" fill="#4b4030" opacity=".2"/><g filter="url(#faa)" opacity=".95">${lw}</g><g opacity=".9">${ink}</g>${dots}<g filter="url(#faa)" opacity=".5">${tips.filter((t, i) => i % 3 === 0).map(([tx, ty], i) => `<ellipse cx="${f1(tx)}" cy="${f1(ty)}" rx="${f1(H * P.lf * .7)}" ry="${f1(H * P.lf * .5)}" fill="${verdes[(i + 1) % 4]}" opacity=".5"/>`).join('')}</g></g>`;
    };
    const arbs = (F.arboles || []).map(a => ({ ...a, k: a.k || (a.r > 1.7 ? 'eucalipto' : 'redondo') }));
    arbs.forEach(a => { atras += arbol(a) });

    /* ---- carpinterías ---- */
    const abertura = (x0, y0, x1, y1, a) => {
      let w = '', l = '';
      const fr = Math.max(2.5, .05 * S), glass = a.tipo === 'puerta' ? null : a.tipo === 'fija' && !a.calido ? 'url(#f-cool)' : 'url(#f-warm)';
      if (glass) {
        w += `<rect x="${f1(x0 + 1)}" y="${f1(y0 + 1)}" width="${f1(x1 - x0 - 2)}" height="${f1(y1 - y0 - 2)}" fill="${glass}"/>`;
        const gw = x1 - x0;
        w += `<path d="M${f1(x0 + fr + gw * .08)} ${f1(y1 - fr)}L${f1(x0 + gw * .42)} ${f1(y0 + fr)}L${f1(x0 + gw * .55)} ${f1(y0 + fr)}L${f1(x0 + fr + gw * .21)} ${f1(y1 - fr)}Z" fill="#ffffff" opacity=".28"/><path d="M${f1(x0 + gw * .5)} ${f1(y1 - fr)}L${f1(x0 + gw * .72)} ${f1(y0 + fr)}L${f1(x0 + gw * .76)} ${f1(y0 + fr)}L${f1(x0 + gw * .54)} ${f1(y1 - fr)}Z" fill="#ffffff" opacity=".2"/>`;
      } else {
        w += `<rect x="${f1(x0 + fr)}" y="${f1(y0 + fr)}" width="${f1(x1 - x0 - 2 * fr)}" height="${f1(y1 - y0 - fr)}" fill="#6e4a2e"/>`;
        for (let x = x0 + fr + 5; x < x1 - fr - 2; x += 5) l += ln(x, y0 + fr, x, y1, .35, '#4a3020');
        l += `<rect x="${f1(x1 - fr - .1 * S)}" y="${f1((y0 + y1) / 2 - .15 * S)}" width="2" height="${f1(.3 * S)}" fill="${K}" stroke="none"/>`;
      }
      l += `<rect x="${f1(x0 + fr / 2)}" y="${f1(y0 + fr / 2)}" width="${f1(x1 - x0 - fr)}" height="${f1(y1 - y0 - fr)}" stroke="#2c2f33" stroke-width="${f1(fr)}"/><rect x="${f1(x0)}" y="${f1(y0)}" width="${f1(x1 - x0)}" height="${f1(y1 - y0)}" stroke-width="1"/>`;
      const n = a.div ?? (a.tipo === 'corrediza' ? 2 : a.tipo === 'puerta' ? 0 : Math.max(1, Math.round(a.w / 1.2)));
      for (let i = 1; i < n; i++) { const xx = x0 + (x1 - x0) * i / n; l += ln(xx, y0, xx, y1, fr, '#2c2f33') }
      if (a.travesano) { const yy = Y(a._p0 + a.travesano); l += ln(x0, yy, x1, yy, fr, '#2c2f33') }
      if (a.tipo === 'ventana' || a.tipo === 'fija') l += ln(x0 - 3, y1 + 1.5, x1 + 3, y1 + 1.5, 1.4);
      if (a.tipo === 'corrediza') l += ln(x0 + (x1 - x0) * .48, (y0 + y1) / 2, x0 + (x1 - x0) * .48, (y0 + y1) / 2 + .25 * S, 1.6);
      return [w, l];
    };

    /* ---- volúmenes ---- */
    { const xa = Math.min(...vols.map(v => v.x)), xb = Math.max(...vols.map(v => v.x + v.w)); fondo += `<ellipse cx="${f1(X((xa + xb) / 2 + .4))}" cy="${f1(base + 4)}" rx="${f1((xb - xa) / 2 * S * 1.12)}" ry="${f1(.32 * S + 4)}" fill="#3b2f22" opacity=".22" filter="url(#faa)"/>` }
    const gable = v => { const p0 = v.piso || 0, x0 = X(v.x), x1 = X(v.x + v.w), xm = (x0 + x1) / 2, yE = Y(p0 + v.muro), yR = Y(p0 + (v.cumbrera || v.muro)); return { p0, x0, x1, xm, yE, yR, sl: (yE - yR) / (xm - x0) } };
    [...vols].sort((p, q) => (p.techo === 'ala' ? 0 : 1) - (q.techo === 'ala' ? 0 : 1)).forEach(v => {
      if (v.techo === 'ala') {
        const p0 = v.piso || 0, x0 = X(v.x), x1 = X(v.x + v.w), hi = Y(p0 + v.alto), lo = Y(p0 + v.muro), yF = Y(p0), al = (v.alero ?? .45) * S;
        const xin = v.lado < 0 ? x1 : x0, xout = v.lado < 0 ? x0 : x1, sgn = v.lado < 0 ? -1 : 1, sl2 = (lo - hi) / Math.abs(x1 - x0), t = .2 * S;
        const xo = xout + sgn * al, yo = lo + al * sl2;
        let w = poly([[xin, yF], [xin, hi], [xout, lo], [xout, yF]], `fill="url(#fr-${v.revest || 'madera'})"`);
        w += poly([[xin, hi], [xout, lo], [xout, lo + al * 1.4], [xin, hi + al * 1.4]], 'fill="url(#f-eave)"');
        if (p0 > 0) w += `<rect x="${f1(Math.min(x0, x1) + 4)}" y="${f1(yF)}" width="${f1(Math.abs(x1 - x0) - 8)}" height="${f1(base - yF)}" fill="#3a3026" opacity=".5"/>`;
        const rf = [[xin, hi - 2], [xo, yo], [xo, yo - t], [xin, hi - t - 2]];
        w += poly(rf, 'fill="#3d4044"') + poly([[xin, hi - t * .5 - 2], [xo, yo - t * .5], [xo, yo - t], [xin, hi - t - 2]], 'fill="#50545a"');
        let l = poly([[xin, yF], [xin, hi], [xout, lo], [xout, yF]], 'stroke-width="1.4"') + poly(rf, 'stroke-width="1.5"') + ln(xin, hi - t * .5 - 2, xo, yo - t * .5, .5);
        casa += obj(w, l); return;
      }
      const g = gable(v), { p0, x0, x1, xm, yE, yR, sl } = g, fill = `url(#fr-${v.revest || 'madera'})`, roofFill = v.techoClaro ? 'url(#fr-techoG)' : 'url(#fr-techo)';
      const zt = v.zocalo ? Y(p0 + v.zocalo) : Y(p0), yF = Y(p0);
      let w = '', l = '';
      if (p0 > 0) { w += `<rect x="${f1(x0 + 4)}" y="${f1(yF)}" width="${f1(x1 - x0 - 8)}" height="${f1(base - yF)}" fill="#3a3026" opacity=".5"/>`; for (let x = v.x + .4; x < v.x + v.w - .2; x += 2.4) { w += `<rect x="${f1(X(x))}" y="${f1(yF)}" width="${f1(.3 * S)}" height="${f1(base - yF)}" fill="#c9c4b8"/>`; l += `<rect x="${f1(X(x))}" y="${f1(yF)}" width="${f1(.3 * S)}" height="${f1(base - yF)}" stroke-width=".7"/>` } }
      if (v.zocalo) { w += `<rect x="${f1(x0)}" y="${f1(zt)}" width="${f1(x1 - x0)}" height="${f1(yF - zt)}" fill="url(#fr-piedra)"/>`; l += `<rect x="${f1(x0)}" y="${f1(zt)}" width="${f1(x1 - x0)}" height="${f1(yF - zt)}" stroke-width=".9"/>` }
      if (v.techo === 'frente') {
        const al = (v.alero ?? .45) * S, t = .24 * S, tv = t / Math.cos(Math.atan(sl));
        const xa0 = x0 - al, ya0 = yE + al * sl, xa1 = x1 + al;
        w += poly([[x0, zt], [x0, yE], [xm, yR], [x1, yE], [x1, zt]], `fill="${fill}"`);
        if (v.marco) { const mt = .2 * S; l += `<path d="M${f1(x0 - mt)} ${f1(zt)}V${f1(yE)}L${f1(xm)} ${f1(yR - mt * 1.25)}L${f1(x1 + mt)} ${f1(yE)}V${f1(zt)}H${f1(x1)}V${f1(yE)}L${f1(xm)} ${f1(yR)}L${f1(x0)} ${f1(yE)}V${f1(zt)}Z" fill="#2c2f33"/>`; l += `<path d="M${f1(x0 - mt)} ${f1(zt)}V${f1(yE)}L${f1(xm)} ${f1(yR - mt * 1.25)}L${f1(x1 + mt)} ${f1(yE)}V${f1(zt)}" stroke-width="1.6"/>` }
        else {
          // sombra del alero sobre la pared
          w += poly([[x0, yE], [xm, yR], [x1, yE], [x1, yE + al * 1.3], [xm, yR + al * 1.3], [x0, yE + al * 1.3]], 'fill="url(#f-eave)"');
          w += poly([[xa0, ya0], [xm, yR], [xa1, ya0], [xa1, ya0 - tv], [xm, yR - tv], [xa0, ya0 - tv]], 'fill="#33363a"');
          w += poly([[xa0, ya0 - tv * .45], [xm, yR - tv * .45], [xa1, ya0 - tv * .45], [xa1, ya0 - tv], [xm, yR - tv], [xa0, ya0 - tv]], 'fill="#4b4f54"');
          l += poly([[xa0, ya0], [xm, yR], [xa1, ya0], [xa1, ya0 - tv], [xm, yR - tv], [xa0, ya0 - tv]], 'stroke-width="1.6"');
          l += `<path d="M${f1(xa0)} ${f1(ya0 - tv * .45)}L${f1(xm)} ${f1(yR - tv * .45)}L${f1(xa1)} ${f1(ya0 - tv * .45)}" stroke-width=".5"/>`;
        }
        l += `<path d="M${f1(x0)} ${f1(zt)}V${f1(yE)}L${f1(xm)} ${f1(yR)}L${f1(x1)} ${f1(yE)}V${f1(zt)}" stroke-width="2"/>`;
      } else if (v.techo === 'lado' || v.techo === 'cuatroAguas') {
        const al = (v.alero ?? .4) * S, a0 = x0 - al, a1 = x1 + al, yEa = yE + al * .35, h = v.techo === 'lado' ? 0 : (x1 - x0) * (v.hip ?? .3), r0 = a0 + h, r1 = a1 - h;
        w += `<rect x="${f1(x0)}" y="${f1(yE)}" width="${f1(x1 - x0)}" height="${f1(zt - yE)}" fill="${fill}"/>`;
        w += `<rect x="${f1(x0)}" y="${f1(yEa)}" width="${f1(x1 - x0)}" height="${f1(al * 1.6)}" fill="url(#f-eave)"/>`;
        w += poly([[a0, yEa], [r0, yR], [r1, yR], [a1, yEa]], `fill="${roofFill}"`);
        w += `<rect x="${f1(a0)}" y="${f1(yEa)}" width="${f1(a1 - a0)}" height="${f1(.12 * S)}" fill="#2c2f33"/>`;
        l += poly([[a0, yEa], [r0, yR], [r1, yR], [a1, yEa]], 'stroke-width="1.6"') + `<rect x="${f1(a0)}" y="${f1(yEa)}" width="${f1(a1 - a0)}" height="${f1(.12 * S)}" stroke-width="1"/>`;
        if (h) l += ln(r0, yR, r0 + (a0 - r0) * .02, yR, .1);
        l += `<rect x="${f1(x0)}" y="${f1(yEa + .12 * S)}" width="${f1(x1 - x0)}" height="${f1(zt - yEa - .12 * S)}" stroke-width="1.4"/>`;
      } else {
        const pt = .32 * S;
        w += `<rect x="${f1(x0)}" y="${f1(yE)}" width="${f1(x1 - x0)}" height="${f1(zt - yE)}" fill="${fill}"/><rect x="${f1(x0)}" y="${f1(yE)}" width="${f1(x1 - x0)}" height="${f1(pt * 1.8)}" fill="url(#f-eave)"/>`;
        w += `<rect x="${f1(x0 - 3)}" y="${f1(yE - pt)}" width="${f1(x1 - x0 + 6)}" height="${f1(pt)}" fill="#2a2c2f"/>`;
        l += `<rect x="${f1(x0 - 3)}" y="${f1(yE - pt)}" width="${f1(x1 - x0 + 6)}" height="${f1(pt)}" stroke-width="1.6"/><rect x="${f1(x0)}" y="${f1(yE)}" width="${f1(x1 - x0)}" height="${f1(zt - yE)}" stroke-width="1.4"/>`;
      }
      casa += obj(w, l);
      // frontón vidriado
      (F.aberturas || []).filter(a => a.tipo === 'frontonVidrio' && a.x + a.w / 2 >= v.x && a.x + a.w / 2 <= v.x + v.w).forEach(() => {
        const ins = v.marco ? .04 * S : .06 * S, k1 = x0 + ins, k2 = x1 - ins, y1 = yE, yt = yR + (F.cercha ? .2 * S / Math.cos(Math.atan(sl)) : ins / Math.cos(Math.atan(sl))), fr = Math.max(2.5, .05 * S);
        let w2 = poly([[k1, y1], [xm, yt], [k2, y1]], 'fill="url(#f-warm)"');
        w2 += poly([[k1 + (k2 - k1) * .18, y1 - fr], [xm - (xm - k1) * .25, yt + (y1 - yt) * .35], [xm - (xm - k1) * .1, yt + (y1 - yt) * .45], [k1 + (k2 - k1) * .28, y1 - fr]], 'fill="#fff" opacity=".28"');
        casa += obj(w2, poly([[k1, y1], [xm, yt], [k2, y1]], `stroke="#2c2f33" stroke-width="${f1(fr * 1.6)}"`) + ln(xm, yt, xm, y1, fr, '#2c2f33') + ln(k1, y1, k2, y1, fr * 1.4, '#2c2f33'));
      });
    });
    // aberturas
    const vol = x => vols.find(v => x >= v.x - .01 && x <= v.x + v.w + .01) || vols[0];
    (F.aberturas || []).filter(a => a.tipo !== 'frontonVidrio').forEach(a => {
      const v = vol(a.x + a.w / 2), p0 = v.piso || 0; a._p0 = p0;
      if (a.tipo === 'redonda') { const cx = X(a.x + a.w / 2), cy = Y(p0 + (a.y || 0) + a.h / 2), r = a.w / 2 * S; casa += obj(`<circle cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(r + .1 * S)}" fill="#3a3530"/><circle cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(r)}" fill="url(#f-cool)"/><path d="M${f1(cx - r * .5)} ${f1(cy + r * .5)}L${f1(cx + r * .3)} ${f1(cy - r * .6)}" stroke="#fff" stroke-width="${f1(r * .25)}" opacity=".3"/>`, `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(r + .1 * S)}" stroke-width="1.2"/><circle cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(r)}" stroke-width=".6"/>`); return }
      const [w, l] = abertura(X(a.x), Y(p0 + (a.y || 0) + a.h), X(a.x + a.w), Y(p0 + (a.y || 0)), a);
      casa += obj(w, l);
    });
    if (F.chimenea) { const c = F.chimenea, x = X(c.x), wd = .2 * S; casa += obj(`<rect x="${f1(x)}" y="${f1(Y(c.y0 + c.h))}" width="${f1(wd)}" height="${f1(c.h * S)}" fill="#a9adb1"/><rect x="${f1(x + wd * .55)}" y="${f1(Y(c.y0 + c.h))}" width="${f1(wd * .45)}" height="${f1(c.h * S)}" fill="#8d9195"/>`, `<rect x="${f1(x)}" y="${f1(Y(c.y0 + c.h))}" width="${f1(wd)}" height="${f1(c.h * S)}" stroke-width="1"/><rect x="${f1(x - wd * .3)}" y="${f1(Y(c.y0 + c.h) - wd * .35)}" width="${f1(wd * 1.6)}" height="${f1(wd * .35)}" fill="#6d7175" stroke-width="1"/>`) }

    /* ---- cercha del alero: piezas con sus cortes, sobre la geometría del techo ---- */
    if (F.cercha) {
      const c = F.cercha, v = vol(c.x + c.w / 2), g = gable(v), b = .2 * S, p0 = c.piso ?? g.p0, al = (v.alero ?? .45) * S;
      const { x0, x1, xm, yR, sl, yE } = g, cs = Math.cos(Math.atan(sl)), bv = b / cs, k = b;
      const Lt = x => yR + Math.abs(x - xm) * sl, Lb = x => Lt(x) + bv;
      const xe = x0 - b * .5, xe2 = x1 + b * .5, xa0 = x0 - al, xa1 = x1 + al;
      const yTt = Lt(xe) + b * 1.15, yTb = yTt + b, tD = b * .72, yd = Y(p0);
      const madL = '#c98d52', mad = '#b87a42', madD = '#a2683a';
      let w = '', l = '';
      // techo (chapa) apoyado sobre los pares
      const t = .24 * S, tv = t / cs;
      const techo = [[xa0, Lt(xa0)], [xm, yR], [xa1, Lt(xa1)], [xa1, Lt(xa1) - tv], [xm, yR - tv], [xa0, Lt(xa0) - tv]];
      w += poly(techo, 'fill="#33363a"') + poly([[xa0, Lt(xa0) - tv * .45], [xm, yR - tv * .45], [xa1, Lt(xa1) - tv * .45], [xa1, Lt(xa1) - tv], [xm, yR - tv], [xa0, Lt(xa0) - tv]], 'fill="#4b4f54"');
      l += poly(techo, 'stroke-width="1.6"') + `<path d="M${f1(xa0)} ${f1(Lt(xa0) - tv * .45)}L${f1(xm)} ${f1(yR - tv * .45)}L${f1(xa1)} ${f1(Lt(xa1) - tv * .45)}" stroke-width=".5"/>`;
      // pares: corte a plomo contra el pendolón, talón sobre el tirante y cola con corte a plomo
      const db = (yTt - yR - bv) / sl;
      const par = s => { const X1 = v2 => xm + s * (xm - v2) * -1; // espejo
        const pts = [[xa0, Lt(xa0)], [xm - k / 2, Lt(xm - k / 2)], [xm - k / 2, Lb(xm - k / 2)], [xm - db, yTt], [xe, yTt], [xe, Lt(xe) + tD], [xa0, Lt(xa0) + tD]];
        return s < 0 ? pts : pts.map(([x, y]) => [2 * xm - x, y]) };
      // tirante entre columnas, cortado a escuadra
      const tir = [[xe, yTt], [xe2, yTt], [xe2, yTb], [xe, yTb]];
      // pendolón con punta a dos aguas bajo la cumbrera
      const pend = [[xm - k / 2, Lt(xm - k / 2)], [xm, yR], [xm + k / 2, Lt(xm + k / 2)], [xm + k / 2, yTt], [xm - k / 2, yTt]];
      // puntales: corte a plomo contra el pendolón y corte a pendiente contra el par
      const puntal = s => {
        const px = xm + s * k / 2, py = yTt - b * .55, qx = xm + s * (xm - x0) * .36, qy = Lb(qx) + b * .1;
        const dx = qx - px, dy = qy - py, dl = Math.hypot(dx, dy), ux = dx / dl, uy = dy / dl, nx = -uy * b / 2, ny = ux * b / 2;
        const hitV = (ox, oy) => { const tt = (px - ox) / ux; return [px, oy + tt * uy] };
        const hitR = (ox, oy) => { const sg = s < 0 ? 1 : -1; // y = yR + bv + sg*(xm - x)*sl*-1  => y = yR + bv + |x-xm|*sl
          const tt = (yR + bv + (s * (ox - xm)) * sl - oy) / (uy - s * ux * sl); return [ox + tt * ux, oy + tt * uy] };
        const a0 = [px + nx, py + ny], a1 = [px - nx, py - ny];
        return [hitV(...a0), hitR(...a0), hitR(...a1), hitV(...a1)];
      };
      // columnas: del tirante al deck
      const col = s => s < 0 ? [[xe, yTb], [xe + b, yTb], [xe + b, yd], [xe, yd]] : [[xe2 - b, yTb], [xe2, yTb], [xe2, yd], [xe2 - b, yd]];
      // tornapuntas: tramos cortos a 45° de la columna al tirante, con cortes en ángulo en las dos puntas
      const torna = s => { const cxp = s < 0 ? xe + b : xe2 - b, dir = -s, L = .95 * S, e = b * .75 * .707;
        return [[cxp, yTb + L - e], [cxp + dir * (L - e), yTb], [cxp + dir * (L + e), yTb], [cxp, yTb + L + e]] };
      // orden: columnas, tirante, tornapuntas, puntales, pendolón, pares (los pares tapan las uniones)
      [[-1, madL], [1, mad]].forEach(([s, cl]) => { w += poly(col(s), `fill="${cl}"`); l += poly(col(s), 'stroke-width="1.2"') });

      w += poly(tir, `fill="${mad}"`); l += poly(tir, 'stroke-width="1.1"');
      [[-1, madL], [1, madD]].forEach(([s, cl]) => { const p = puntal(s); w += poly(p, `fill="${cl}"`); l += poly(p, 'stroke-width="1"') });
      w += poly(pend, `fill="${madL}"`); l += poly(pend, 'stroke-width="1.1"');
      [[-1, madL], [1, mad]].forEach(([s, cl]) => { const p = par(s); w += poly(p, `fill="${cl}"`); l += poly(p, 'stroke-width="1.2"') });
      // vetas finas
      for (let i = 0; i < 10; i++) { const yy = yTt + 2 + rnd() * (b - 4), xx = xe + 6 + rnd() * (xe2 - xe - 60); l += ln(xx, yy, xx + S * (.5 + rnd() * .8), yy + (rnd() - .5), .35, '#7a4a22') }
      for (let i = 0; i < 2; i++) [xe + b * .5, xe2 - b * .5].forEach(x => { const yy = yTb + 10 + rnd() * (yd - yTb - 30); l += ln(x - b * .25, yy, x - b * .2, yy + S * .6, .35, '#7a4a22') });
      // herraje del nudo central y tornillos
      w += `<rect x="${f1(xm - b * 1.1)}" y="${f1(yTb - 2)}" width="${f1(b * 2.2)}" height="3" fill="#1e1e1e"/>`;
      [[xe + b * .5, yTt + b * .5], [xe2 - b * .5, yTt + b * .5]].forEach(([x, y]) => { l += `<circle cx="${f1(x)}" cy="${f1(y)}" r="1.4" fill="${K}"/>` });
      frente += obj(w, l);
    }

    /* ---- pérgolas, decks, barandas ---- */
    (F.pergolas || []).forEach(p => {
      const y0 = Y(p.h), wood = p.color || '#8a6a4a', bh = .22 * S, pw = .16 * S; let w = '', l = '';
      w += `<rect x="${f1(X(p.x) - 10)}" y="${f1(y0 - bh)}" width="${f1(p.w * S + 20)}" height="${f1(bh)}" fill="${wood}"/>`; l += `<rect x="${f1(X(p.x) - 10)}" y="${f1(y0 - bh)}" width="${f1(p.w * S + 20)}" height="${f1(bh)}" stroke-width="1.1"/>`;
      for (let x = p.x; x <= p.x + p.w + .01; x += .35) { w += `<rect x="${f1(X(x) - 2)}" y="${f1(y0 - bh - .12 * S)}" width="4" height="${f1(.12 * S)}" fill="${wood}"/>`; l += `<rect x="${f1(X(x) - 2)}" y="${f1(y0 - bh - .12 * S)}" width="4" height="${f1(.12 * S)}" stroke-width=".5"/>` }
      [p.x, p.x + p.w].forEach(x => { w += `<rect x="${f1(X(x) - pw / 2)}" y="${f1(y0)}" width="${f1(pw)}" height="${f1(base - y0)}" fill="${wood}"/>`; l += `<rect x="${f1(X(x) - pw / 2)}" y="${f1(y0)}" width="${f1(pw)}" height="${f1(base - y0)}" stroke-width="1.1"/>` });
      frente += obj(w, l);
    });
    (F.decks || []).forEach(dk => {
      let w = '', l = ''; const y0 = Y(dk.h), fh = Math.max(4, .16 * S);
      w += `<rect x="${f1(X(dk.x))}" y="${f1(y0)}" width="${f1(dk.w * S)}" height="${f1(fh)}" fill="#b58654"/><rect x="${f1(X(dk.x) + 6)}" y="${f1(y0 + fh)}" width="${f1(dk.w * S - 12)}" height="${f1(Math.max(0, base - y0 - fh))}" fill="#3a3026" opacity=".45"/>`;
      l += `<rect x="${f1(X(dk.x))}" y="${f1(y0)}" width="${f1(dk.w * S)}" height="${f1(fh)}" stroke-width="1.1"/>` + ln(X(dk.x), y0 + fh / 2, X(dk.x + dk.w), y0 + fh / 2, .35, K2);
      if (dk.escalera != null) { const n = Math.max(2, Math.round(dk.h / .17)), sw = 1.3 * S; for (let i = 1; i <= n; i++) { const yy = Y(dk.h - i * dk.h / n), ww = sw + i * .28 * S, hh = dk.h / n * S; w += `<rect x="${f1(X(dk.escalera) - ww / 2)}" y="${f1(yy)}" width="${f1(ww)}" height="${f1(hh)}" fill="#c0915e"/>`; l += `<rect x="${f1(X(dk.escalera) - ww / 2)}" y="${f1(yy)}" width="${f1(ww)}" height="${f1(hh)}" stroke-width=".9"/>` } }
      frente += obj(w, l);
    });
    (F.barandas || []).forEach(bd => { const y0 = Y(bd.y + .95), y1 = Y(bd.y); let w = `<rect x="${f1(X(bd.x))}" y="${f1(y0)}" width="${f1(bd.w * S)}" height="4" fill="#a87442"/>`, l = `<rect x="${f1(X(bd.x))}" y="${f1(y0)}" width="${f1(bd.w * S)}" height="4" stroke-width=".8"/>`; for (let x = bd.x; x <= bd.x + bd.w + .01; x += .12) l += ln(X(x), y0 + 4, X(x), y1, x % .96 < .12 ? 1.2 : .45, '#6b4a2b'); frente += obj(w, l) });

    /* ---- vegetación baja ---- */
    const mata = (x, wd, c) => {
      let w = '', l = ''; const n = Math.max(3, Math.round(wd / .32));
      for (let i = 0; i < n; i++) {
        const cx = X(x + (i + .5) * wd / n), h = (.38 + rnd() * .3) * S, r = wd / n * S * .7;
        const p = copa(cx, base - h * .55, Math.max(r, h * .55), 9);
        w += `<path d="${p}" fill="${['#6f8a5c', '#86a06f', '#9cb584'][i % 3]}" opacity=".7" filter="url(#faa)"/>`;
        for (let j = 0; j < 3; j++) { const sx = cx + (rnd() - .5) * r * 1.4, sy = base - h * (.2 + rnd() * .7); l += `<path d="M${f1(sx)} ${f1(sy)}q${f1(h * .1)} ${f1(-h * .14)} ${f1(h * .22)} ${f1(-h * .04)}" stroke="#2e3a26" stroke-width="1" opacity=".7"/>` }
        if (c && c !== '#8fa77a') {
          if (/b4|d4|c4/.test(c)) { for (let j = 0; j < 2; j++) { const sx = cx + (rnd() - .5) * r, sy = base - h * (1.1 + rnd() * .5); l += ln(cx, base - h * .5, sx, sy, .5, '#4a5a3a'); for (let k = 0; k < 7; k++) { const a = k / 7 * 6.283; w += `<circle cx="${f1(sx + Math.cos(a) * 3.2)}" cy="${f1(sy + Math.sin(a) * 2.6)}" r="1.6" fill="${c}"/>` } } }
          else for (let j = 0; j < 3; j++) { const sx = cx + (rnd() - .5) * r * 1.2, sy = base - h * (.9 + rnd() * .5); for (let k = 0; k < 5; k++) w += `<ellipse cx="${f1(sx)}" cy="${f1(sy - k * 2.4)}" rx="1.3" ry="1.6" fill="${c}"/>`; l += ln(sx, sy + 2, sx, base - h * .4, .4, '#4a5a3a') }
        }
      }
      return obj(w, l);
    };
    (F.plantas || []).forEach(p => { frente += mata(p.x, p.w, p.c) });
    // pasto en el suelo
    let pasto = ''; for (let x = -.6; x < F.ancho + .6; x += .18 + rnd() * .25) { const xx = X(x), h = 3 + rnd() * 6; pasto += `<path d="M${f1(xx)} ${base}l${f1(-1.5 - rnd() * 2)} ${f1(-h)}M${f1(xx)} ${base}l${f1(.5 + rnd())} ${f1(-h * 1.1)}M${f1(xx)} ${base}l${f1(2 + rnd() * 2)} ${f1(-h * .8)}"/>` }
    const suelo = `<g mask="url(#f-fade)"><line x1="${X(-.9)}" y1="${base}" x2="${X(F.ancho + .9)}" y2="${base}" stroke="${K}" stroke-width="1.8"/><g stroke="#5b6e45" stroke-width=".6" fill="none">${pasto}</g></g>`;

    // personas
    const ropa = ['#d9654a', '#3f7fb5', '#e3a93a', '#5c9a6a'];
    let gente = (F.personas || []).map((x, i) => `<g transform="translate(${f1(X(x))} ${base}) scale(${f1(S / 100)})"><circle cx="0" cy="-165" r="10" fill="#3a2e26"/><path d="M-12 -150 Q0 -155 12 -150 L16 -96 L-16 -96Z" fill="${ropa[i % 4]}"/><path d="M-11 -96 L-9 0 L-2 0 L0 -58 L2 0 L9 0 L11 -96Z" fill="#3b3a44"/><path d="M-12 -150 Q0 -155 12 -150 L16 -96 L-16 -96Z M-11 -96 L-9 0 L-2 0 L0 -58 L2 0 L9 0 L11 -96Z" fill="none" stroke="${K}" stroke-width="1.6"/></g>`).join('');
    // un perro al lado de la primera persona
    if ((F.personas || []).length) { const x = X(F.personas[0] + .9), k = S / 100; gente += `<g transform="translate(${f1(x)} ${base}) scale(${f1(k)})"><path d="M0 -30 Q8 -44 30 -42 L44 -46 Q52 -50 54 -42 L52 -36 L46 -34 L44 0 L38 0 L36 -22 L12 -22 L10 0 L4 0 L4 -24 Q-6 -30 -10 -40" fill="#c58a4f" stroke="${K}" stroke-width="1.6" stroke-linejoin="round"/><circle cx="49" cy="-43" r="1.6" fill="${K}"/></g>` }
    // pájaros en tinta y sol en aguada
    let cielo = `<circle cx="${f1(X(F.ancho * .93))}" cy="${top - 34}" r="${f1(S * .9)}" fill="#ffd27a" opacity=".55" filter="url(#faa)"/>`;
    for (let i = 0; i < 4; i++) { const bx = X(F.ancho * (.28 + rnd() * .3)), by = top - 30 + rnd() * 50, bs = 5 + rnd() * 4; cielo += `<path d="M${f1(bx - bs)} ${f1(by)}q${f1(bs / 2)} ${f1(-bs * .6)} ${f1(bs)} 0q${f1(bs / 2)} ${f1(-bs * .6)} ${f1(bs)} 0" fill="none" stroke="${K}" stroke-width="1.3" stroke-linecap="round"/>` }

    // anotación y cotas
    const nota = F.nota ? `<g font-family="${HAND}" fill="${K}" paint-order="stroke" stroke="#f6f0e3" stroke-width="5" stroke-linejoin="round"><text x="${f1(X(F.notaX ?? F.ancho * .62))}" y="${top - 40}" font-size="24">${F.nota}</text></g>` : '';
    const xa = Math.min(...vols.map(v => v.x)), xb = Math.max(...vols.map(v => v.x + v.w)), cy = base + 40;
    const cota = `<g stroke="${K2}" stroke-width=".7"><line x1="${f1(X(xa))}" y1="${cy}" x2="${f1(X(xb))}" y2="${cy}"/><line x1="${f1(X(xa))}" y1="${cy - 7}" x2="${f1(X(xa))}" y2="${cy + 7}"/><line x1="${f1(X(xb))}" y1="${cy - 7}" x2="${f1(X(xb))}" y2="${cy + 7}"/><line x1="${f1(X(xa) - 5)}" y1="${cy + 5}" x2="${f1(X(xa) + 5)}" y2="${cy - 5}" stroke-width="1.5"/><line x1="${f1(X(xb) - 5)}" y1="${cy + 5}" x2="${f1(X(xb) + 5)}" y2="${cy - 5}" stroke-width="1.5"/></g><text x="${f1((X(xa) + X(xb)) / 2)}" y="${cy - 8}" text-anchor="middle" font-family="${HAND}" font-size="21" fill="${K2}">${f2(xb - xa)} m</text>`;
    const tit = `<g transform="translate(${padX} ${base + 100})"><text x="0" y="0" font-family="${SERIF}" font-style="italic" font-weight="500" font-size="36" fill="${K}">${m.nombre || ''} <tspan font-size="24" fill="#6b5847">· ${F.titulo || 'fachada'}</tspan></text><text x="${VW - padX * 2}" y="0" text-anchor="end" font-family="${HAND}" font-size="22" fill="#8a7560">Smart Building Uruguay</text></g>`;

    return `<svg viewBox="0 0 ${VW} ${VH}" role="img" aria-label="Fachada de ${m.nombre}">${papel('fa', VW, VH)}<defs>${defs}</defs>${fondo}${cielo}${atras}${casa}${frente}${suelo}${gente}${nota}${cota}${tit}</svg>`;
  };
  ['SBUplanta', 'SBUfachada', 'SBUcercha'].forEach(n => { const f = window[n]; window[n] = (...a) => recolor(f(...a)) });
})();
