/* Dibujos de cada modelo: planta y corte con cercha.
   Los usan la web y el panel. Devuelven el SVG como texto. */
(function () {
  const INK = '#1d1b18', INK2 = '#4b4842', MUTE = '#8a857b', PAPER = '#f6f0e3', WASH = '#e9dfcc';
  const MONO = "IBM Plex Mono,monospace", ARCH = "Archivo,Arial Narrow,sans-serif", HAND = "Caveat,cursive", SERIF = "Fraunces,Georgia,serif";
  const f2 = v => (+v).toFixed(2).replace('.', ',');
  const MAD = { lapacho: ['#8d5a3b', '#6d4229'], cumaru: ['#9a6a44', '#7a4f30'], eucalipto: ['#c49a6c', '#a57a4f'], pino: ['#dcc08f', '#bf9f6a'] };
  const mad = n => MAD[(n || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').split(' ')[0]] || MAD.pino;

  // papel con grano, común a los dos dibujos
  const papel = (id, VW, VH) => `<defs>
    <filter id="${id}g" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 .45  0 0 0 0 .38  0 0 0 0 .28  0 0 0 .06 0"/></filter>
    <filter id="${id}s" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="5"/></filter>
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
  const arbol = (cx, cy, r, k) => `<g filter="url(#pla)" opacity=".85"><circle cx="${cx}" cy="${cy}" r="${r}" fill="#9fb48a" opacity=".7"/><circle cx="${cx + r * .45}" cy="${cy + r * .4}" r="${r * .62}" fill="#8aa476" opacity=".7"/><circle cx="${cx - r * .35}" cy="${cy - r * .3}" r="${r * .5}" fill="#b4c69e" opacity=".6"/></g>`;

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
    o += `<g filter="url(#pla)">${rects.map(r => rr(r, 'fill="#f1e2c3" opacity=".6"')).join('')}</g>`;
    o += `<g clip-path="url(#pl-clip)"><g filter="url(#pla)">${[...(P.locales || [])].sort((a, b) => (+b.a || 8) - (+a.a || 8)).map(l => { const c = tono(l.n); if (!c) return ''; const rad = Math.sqrt(+l.a || 8) * S * .62; return `<ellipse cx="${X(l.x)}" cy="${Y(l.y) - 6}" rx="${rad * 1.25}" ry="${rad}" fill="${c}" opacity=".75"/>` }).join('')}</g></g>`;
    // muros: tinta sepia, trazo a mano
    o += '<g filter="url(#plw)">';
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
    o += '<g filter="url(#plw)">';
    (P.equip || []).forEach(q => {
      const { x, y } = q;
      if (q.t === 'mesada') { o += R(x, y, q.w, q.h) + R(x + .25, y + .1, .45, .38, st, .03) + [[1.35, .18], [1.6, .18], [1.35, .42], [1.6, .42]].map(([a, b]) => C(x + a, y + b, .09)).join('') }
      if (q.t === 'isla') { o += R(x, y, q.w, q.h, `fill="#efe7d6" stroke="${INK2}" stroke-width="1.2"`) }
      if (q.t === 'parrilla') { o += R(x, y, q.w, q.h, `fill="#d9d2c4" stroke="${INK2}" stroke-width="1.2"`) + `<path d="M${X(x + .1)} ${Y(y + .12)}h${(q.w - .2) * S}M${X(x + .1)} ${Y(y + .24)}h${(q.w - .2) * S}M${X(x + .1)} ${Y(y + .36)}h${(q.w - .2) * S}" stroke="${INK2}" stroke-width="1"/>` }
      if (q.t === 'cama') { const w = q.w || 1.6, h = q.h || 2; o += R(x, y, w, h, st, .04) + R(x + .12, y + .08, .6, .4, st, .08) + R(x + w - .72, y + .08, .6, .4, st, .08) + `<path d="M${X(x)} ${Y(y + .62)}Q${X(x + w / 2)} ${Y(y + .55)} ${X(x + w)} ${Y(y + .62)}" fill="none" stroke="${INK2}"/>` }
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
      <pattern id="ce-t" width="16" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="10" stroke="${INK2}" stroke-width=".8"/></pattern>
    </defs>`;
    // cielo: aguada suave
    o += `<rect x="${X(-alero) - 30}" y="${Y(yc + Ht + .3) - 10}" width="${(L + 2 * alero) * S + 60}" height="${(Ht + .6) * S}" fill="#cfe0ea" opacity=".55" rx="40" filter="url(#cea)"/>`;
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
    o += `<path d="M${X(0)} ${Y(yc)}L${X(L)} ${Y(yc)}L${X(L)} ${Y(yc + hh)}L${X(L / 2)} ${Y(yc + Ht)}L${X(0)} ${Y(yc + hh)}Z" fill="url(#ce-v)" stroke="#3b2f25" stroke-width="1.8" stroke-linejoin="round" filter="url(#cew)"/>`;
    // huecos interiores (dejan ver el pendolón al medio)
    const x0 = (b - hh + dv) * (L / 2) / (Ht - hh), xm = L / 2 - b / 2;
    const hole = (s) => {
      const fx = x => s > 0 ? x : L - x;
      return `<path d="M${X(fx(x0))} ${Y(yc + b)}L${X(fx(xm))} ${Y(yc + b)}L${X(fx(xm))} ${Y(yIn(xm))}Z" fill="#f3e6cc" stroke="#3b2f25" stroke-width="1.4" stroke-linejoin="round" filter="url(#cew)"/>`;
    };
    o += hole(1) + hole(-1);
    // diagonales (puntales) del pie del pendolón al cuarto de luz
    const strut = (s) => {
      const fx = x => s > 0 ? x : L - x;
      const xa = L / 4 - b * .6, xb = xa + b * 1.6;
      const p = [[xm, yc + b], [xa, yIn(xa)], [xb, yIn(xb)], [xm, yc + b + b * 1.15]];
      return `<path d="M${p.map(([x, y]) => X(fx(x)) + ' ' + Y(y)).join('L')}Z" fill="url(#ce-v)" stroke="#3b2f25" stroke-width="1.4" stroke-linejoin="round" filter="url(#cew)"/>`;
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

  /* ---------------- FACHADA (acuarela) ----------------
     F = { ancho, volumenes:[{x,w,muro,piso,techo:'frente'|'lado'|'cuatroAguas'|'plano',cumbrera,alero,revest,marco,zocalo}],
           aberturas:[{x,y,w,h,tipo:'ventana'|'puerta'|'corrediza'|'fija'|'redonda'|'frontonVidrio',div}],
           cercha:{x,w,piso,muro,cumbrera}, pergolas:[{x,w,h}], decks:[{x,w,h,escalera}], barandas:[{x,w,y}],
           chimenea:{x,y0,h}, plantas:[{x,w,c}], arboles:[{x,r,y}], personas:[x], nota } */
  window.SBUfachada = function (F, m) {
    const S = Math.min(64, 1100 / F.ancho), padX = 80, top = 70;
    const alto = Math.max(...F.volumenes.map(v => (v.piso || 0) + (v.techo === 'plano' ? v.muro + .3 : v.cumbrera || v.muro)), F.cercha ? (F.cercha.piso || 0) + F.cercha.cumbrera : 0) + .6;
    const base = top + alto * S, X = x => padX + x * S, Y = y => base - y * S;
    const VW = Math.round(F.ancho * S + padX * 2), VH = Math.round(base + 150);
    const SEP = '#3b2f25';
    const REV = { madera: ['#c4935e', '#9b6c3c', 9], maderaClara: ['#d9c6a6', '#b9a382', 9], chapa: ['#33363a', '#1f2124', 6], chapaGris: ['#8d8f8f', '#6f7272', 5], blanco: ['#ece7dc', '#cfc8b9', 12] };
    let defs = `<filter id="fw" x="-3%" y="-3%" width="106%" height="106%"><feTurbulence type="fractalNoise" baseFrequency=".03" numOctaves="2" seed="5"/><feDisplacementMap in="SourceGraphic" scale="3.5"/></filter>
      <filter id="fa" x="-8%" y="-8%" width="116%" height="116%"><feTurbulence type="fractalNoise" baseFrequency=".02" numOctaves="3" seed="11" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="12" result="d"/><feGaussianBlur in="d" stdDeviation="1.4"/></filter>`;
    Object.entries(REV).forEach(([k, [c, l, w]]) => {
      defs += k === 'blanco' ? `<pattern id="fr-${k}" width="40" height="${w}" patternUnits="userSpaceOnUse"><rect width="40" height="${w}" fill="${c}"/><line x1="0" y1="${w - .5}" x2="40" y2="${w - .5}" stroke="${l}" stroke-width="1"/></pattern>`
        : `<pattern id="fr-${k}" width="${w}" height="40" patternUnits="userSpaceOnUse"><rect width="${w}" height="40" fill="${c}"/><line x1=".5" y1="0" x2=".5" y2="40" stroke="${l}" stroke-width="${k.startsWith('chapa') ? 1.6 : 1}"/></pattern>`;
    });
    defs += `<pattern id="fr-techo" width="7" height="40" patternUnits="userSpaceOnUse"><rect width="7" height="40" fill="#3a3c3f"/><line x1=".5" y1="0" x2=".5" y2="40" stroke="#57595c" stroke-width="1.2"/></pattern>
      <pattern id="fr-techoG" width="7" height="40" patternUnits="userSpaceOnUse"><rect width="7" height="40" fill="#b9bcbd"/><line x1=".5" y1="0" x2=".5" y2="40" stroke="#9a9d9f" stroke-width="1.2"/></pattern>
      <pattern id="fr-piedra" width="26" height="14" patternUnits="userSpaceOnUse"><rect width="26" height="14" fill="#b8a78c"/><path d="M0 7h26M13 0v7M5 7v7M20 7v7" stroke="#9c8a6e" stroke-width="1"/></pattern>
      <pattern id="fr-deck" width="8" height="30" patternUnits="userSpaceOnUse"><rect width="8" height="30" fill="#b98a58"/><line x1="0" y1="0" x2="0" y2="30" stroke="#946a3e" stroke-width="1"/></pattern>`;
    let w = '', l = '';   // w = aguadas, l = líneas a mano
    // cielo, árboles y suelo
    w += `<rect x="${X(-.5)}" y="${top - 30}" width="${(F.ancho + 1) * S}" height="${alto * S + 20}" fill="#cfe0ea" opacity=".55" rx="60"/>`;
    (F.arboles || []).forEach(a => { const cx = X(a.x), cy = Y(a.y || a.r * 1.4), r = a.r * S; w += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#8fa77a" opacity=".75"/><circle cx="${cx + r * .5}" cy="${cy + r * .35}" r="${r * .6}" fill="#7d9868" opacity=".7"/><circle cx="${cx - r * .4}" cy="${cy - r * .3}" r="${r * .55}" fill="#a9bd93" opacity=".6"/>` });
    w += `<rect x="${X(-.6)}" y="${base - 6}" width="${(F.ancho + 1.2) * S}" height="46" fill="#b9c896" opacity=".8"/>`;
    // volúmenes
    F.volumenes.forEach(v => {
      const p0 = v.piso || 0, x0 = X(v.x), x1 = X(v.x + v.w), yF = Y(p0), yE = Y(p0 + v.muro), yR = Y(p0 + (v.cumbrera || v.muro)), al = (v.alero ?? .35) * S, xm = (x0 + x1) / 2;
      const fill = `url(#fr-${v.revest || 'madera'})`, techo = v.techoClaro ? 'url(#fr-techoG)' : 'url(#fr-techo)';
      if (p0 > 0) { w += `<rect x="${x0 + 6}" y="${yF}" width="${x1 - x0 - 12}" height="${base - yF}" fill="#5b4632" opacity=".35"/>`; }
      if (v.zocalo) { w += `<rect x="${x0}" y="${Y(p0 + v.zocalo)}" width="${x1 - x0}" height="${Y(p0) - Y(p0 + v.zocalo)}" fill="url(#fr-piedra)"/>`; }
      const zt = v.zocalo ? Y(p0 + v.zocalo) : yF;
      if (v.techo === 'frente') {
        w += `<path d="M${x0} ${zt}V${yE}L${xm} ${yR}L${x1} ${yE}V${zt}Z" fill="${fill}"/>`;
        if (v.marco) { const t = .22 * S; w += `<path d="M${x0 - t} ${zt}V${yE}L${xm} ${yR - t * 1.2}L${x1 + t} ${yE}V${zt}H${x1}V${yE + 2}L${xm} ${yR + 2}L${x0} ${yE + 2}V${zt}Z" fill="#2f3337"/>`; l += `<path d="M${x0 - t} ${zt}V${yE}L${xm} ${yR - t * 1.2}L${x1 + t} ${yE}V${zt}"/>`; }
        else { w += `<path d="M${x0 - al} ${yE + al * .55}L${xm} ${yR - 8}L${x1 + al} ${yE + al * .55}L${x1 + al} ${yE + al * .55 - 10}L${xm} ${yR - 18}L${x0 - al} ${yE + al * .55 - 10}Z" fill="#2e2c2a"/>`; l += `<path d="M${x0 - al} ${yE + al * .55}L${xm} ${yR - 8}L${x1 + al} ${yE + al * .55}"/>`; }
        l += `<path d="M${x0} ${zt}V${yE}L${xm} ${yR}L${x1} ${yE}V${zt}"/>`;
      } else if (v.techo === 'lado' || v.techo === 'cuatroAguas') {
        w += `<rect x="${x0}" y="${yE}" width="${x1 - x0}" height="${zt - yE}" fill="${fill}"/>`;
        const a0 = x0 - al, a1 = x1 + al, yEa = yE + 4, r0 = v.techo === 'lado' ? a0 : x0 + (x1 - x0) * (v.hip ?? .32), r1 = v.techo === 'lado' ? a1 : x1 - (x1 - x0) * (v.hip ?? .32);
        w += `<path d="M${a0} ${yEa}L${r0} ${yR}L${r1} ${yR}L${a1} ${yEa}Z" fill="${techo}"/><rect x="${a0}" y="${yEa}" width="${a1 - a0}" height="6" fill="#2e2c2a"/>`;
        w += `<rect x="${x0}" y="${yE + 6}" width="${x1 - x0}" height="${.5 * S}" fill="#4a3826" opacity=".28"/>`;
        l += `<path d="M${a0} ${yEa}L${r0} ${yR}L${r1} ${yR}L${a1} ${yEa}Z"/><rect x="${x0}" y="${yE}" width="${x1 - x0}" height="${zt - yE}"/>`;
      } else {
        w += `<rect x="${x0}" y="${yE}" width="${x1 - x0}" height="${zt - yE}" fill="${fill}"/><rect x="${x0 - 4}" y="${yE - .3 * S}" width="${x1 - x0 + 8}" height="${.3 * S}" fill="#26282b"/>`;
        l += `<rect x="${x0}" y="${yE - .3 * S}" width="${x1 - x0}" height="${zt - yE + .3 * S}"/>`;
      }
      if (v.zocalo) l += `<line x1="${x0}" y1="${zt}" x2="${x1}" y2="${zt}"/>`;
    });
    // aberturas
    const vol = x => F.volumenes.find(v => x >= v.x - .01 && x <= v.x + v.w + .01) || F.volumenes[0];
    (F.aberturas || []).forEach(a => {
      const v = vol(a.x + a.w / 2), p0 = v.piso || 0;
      if (a.tipo === 'frontonVidrio') {
        const x0 = X(v.x + .25), x1 = X(v.x + v.w - .25), yE = Y(p0 + v.muro), yR = Y(p0 + v.cumbrera) + .35 * S, xm = (x0 + x1) / 2;
        w += `<path d="M${x0} ${yE}L${xm} ${yR}L${x1} ${yE}Z" fill="#f0c27c"/><path d="M${x0 + 20} ${yE - 4}L${xm - 10} ${yR + 30}L${xm + 10} ${yR + 46}L${x0 + 40} ${yE - 4}Z" fill="#fff5d8" opacity=".5"/>`;
        l += `<path d="M${x0} ${yE}L${xm} ${yR}L${x1} ${yE}Z"/><line x1="${xm}" y1="${yR}" x2="${xm}" y2="${yE}"/>`;
        return;
      }
      const x0 = X(a.x), x1 = X(a.x + a.w), y1 = Y(p0 + (a.y || 0)), y0 = Y(p0 + (a.y || 0) + a.h);
      if (a.tipo === 'redonda') { const r = a.w / 2 * S; w += `<circle cx="${(x0 + x1) / 2}" cy="${(y0 + y1) / 2}" r="${r + 5}" fill="#efe9dc"/><circle cx="${(x0 + x1) / 2}" cy="${(y0 + y1) / 2}" r="${r}" fill="#9fb9c4"/>`; l += `<circle cx="${(x0 + x1) / 2}" cy="${(y0 + y1) / 2}" r="${r}"/>`; return; }
      const glass = a.tipo === 'puerta' ? '#7a4f30' : a.tipo === 'fija' ? '#a9c3cc' : '#f0c27c';
      w += `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="${glass}"/>`;
      if (a.tipo !== 'puerta') w += `<path d="M${x0 + 6} ${y1 - 4}L${x0 + (x1 - x0) * .45} ${y0 + 6}L${x0 + (x1 - x0) * .6} ${y0 + 6}L${x0 + 22} ${y1 - 4}Z" fill="#fff5d8" opacity=".45"/>`;
      l += `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" stroke-width="2"/>`;
      const n = a.div ?? (a.tipo === 'corrediza' ? 2 : a.tipo === 'puerta' ? 0 : Math.max(1, Math.round(a.w / 1.2)));
      for (let i = 1; i < n; i++) l += `<line x1="${x0 + (x1 - x0) * i / n}" y1="${y0}" x2="${x0 + (x1 - x0) * i / n}" y2="${y1}" stroke-width="2"/>`;
      if (a.travesano) l += `<line x1="${x0}" y1="${Y(p0 + a.travesano)}" x2="${x1}" y2="${Y(p0 + a.travesano)}" stroke-width="2"/>`;
    });
    // chimenea
    if (F.chimenea) { const c = F.chimenea; w += `<rect x="${X(c.x)}" y="${Y(c.y0 + c.h)}" width="${.18 * S}" height="${c.h * S}" fill="#c9ccd0"/>`; l += `<rect x="${X(c.x)}" y="${Y(c.y0 + c.h)}" width="${.18 * S}" height="${c.h * S}"/>`; }
    // decks y escalones
    (F.decks || []).forEach(d => {
      w += `<rect x="${X(d.x)}" y="${Y(d.h)}" width="${d.w * S}" height="${.18 * S}" fill="url(#fr-deck)"/><rect x="${X(d.x) + 8}" y="${Y(d.h) + .18 * S}" width="${d.w * S - 16}" height="${(d.h - .18) * S}" fill="#5b4632" opacity=".3"/>`;
      l += `<rect x="${X(d.x)}" y="${Y(d.h)}" width="${d.w * S}" height="${.18 * S}"/>`;
      if (d.escalera != null) { const n = Math.max(1, Math.round(d.h / .18)), sw = 1.4 * S; for (let i = 1; i <= n; i++) { const yy = Y(d.h - i * d.h / n), ww = sw + i * .25 * S; w += `<rect x="${X(d.escalera) - ww / 2}" y="${yy}" width="${ww}" height="${d.h / n * S}" fill="url(#fr-deck)"/>`; l += `<rect x="${X(d.escalera) - ww / 2}" y="${yy}" width="${ww}" height="${d.h / n * S}"/>`; } }
    });
    // barandas
    (F.barandas || []).forEach(b => { const y0 = Y(b.y + .95), y1 = Y(b.y); w += `<rect x="${X(b.x)}" y="${y0}" width="${b.w * S}" height="5" fill="#a87442"/>`; l += `<line x1="${X(b.x)}" y1="${y0}" x2="${X(b.x + b.w)}" y2="${y0}"/>`; for (let x = b.x; x <= b.x + b.w + .01; x += .9) { w += `<rect x="${X(x) - 2}" y="${y0}" width="4" height="${y1 - y0}" fill="#a87442"/>`; } });
    // pérgolas
    (F.pergolas || []).forEach(p => {
      const y0 = Y(p.h), wood = p.color || '#8a6a4a';
      w += `<rect x="${X(p.x) - 10}" y="${y0 - .22 * S}" width="${p.w * S + 20}" height="${.22 * S}" fill="${wood}"/>`;
      for (const x of [p.x, p.x + p.w]) w += `<rect x="${X(x) - .1 * S}" y="${y0}" width="${.2 * S}" height="${base - y0}" fill="${wood}"/>`;
      l += `<rect x="${X(p.x) - 10}" y="${y0 - .22 * S}" width="${p.w * S + 20}" height="${.22 * S}"/>` + [p.x, p.x + p.w].map(x => `<rect x="${X(x) - .1 * S}" y="${y0}" width="${.2 * S}" height="${base - y0}"/>`).join('');
    });
    // cercha del alero, adelante
    if (F.cercha) {
      const c = F.cercha, p0 = c.piso || 0, x0 = X(c.x), x1 = X(c.x + c.w), xm = (x0 + x1) / 2, yE = Y(p0 + c.muro), yR = Y(p0 + c.cumbrera), b = .2 * S, al = .5 * S;
      w += `<path d="M${x0 - al} ${yE + al * .55}L${xm} ${yR - b * .8}L${x1 + al} ${yE + al * .55}L${x1 + al} ${yE + al * .55 - b * .7}L${xm} ${yR - b * 1.5}L${x0 - al} ${yE + al * .55 - b * .7}Z" fill="#2e2c2a"/>`;
      const sl = (yE - yR) / (xm - x0);
      w += `<path d="M${x0 - al * .6} ${yE + al * .3}L${xm} ${yR}L${x1 + al * .6} ${yE + al * .3}L${x1 + al * .6 - 2} ${yE + al * .3 + b}L${xm} ${yR + b * 1.2}L${x0 - al * .6 + 2} ${yE + al * .3 + b}Z" fill="#c07a3e"/>`;
      w += `<rect x="${x0 - b}" y="${yE - b / 2}" width="${x1 - x0 + 2 * b}" height="${b}" fill="#b9733a"/><rect x="${xm - b / 2}" y="${yR + b}" width="${b}" height="${yE - yR - b * 1.5}" fill="#c07a3e"/>`;
      const qx = (x0 + xm) / 2, qy = yE - (yE - yR) * .52;
      w += `<path d="M${xm - b / 2} ${yE - b / 2}L${qx - b * .6} ${qy}L${qx + b * .2} ${qy - b * .5}L${xm - b / 2} ${yE - b * 1.6}Z" fill="#c98543"/><path d="M${xm + b / 2} ${yE - b / 2}L${xm + (xm - qx) + b * .6} ${qy}L${xm + (xm - qx) - b * .2} ${qy - b * .5}L${xm + b / 2} ${yE - b * 1.6}Z" fill="#b06c34"/>`;
      w += `<rect x="${x0 - b / 2}" y="${yE + b / 2}" width="${b}" height="${Y(p0) - yE - b / 2}" fill="#c07a3e"/><rect x="${x1 - b / 2}" y="${yE + b / 2}" width="${b}" height="${Y(p0) - yE - b / 2}" fill="#b06c34"/>`;
      l += `<path d="M${x0 - al * .6} ${yE + al * .3}L${xm} ${yR}L${x1 + al * .6} ${yE + al * .3}"/><rect x="${x0 - b}" y="${yE - b / 2}" width="${x1 - x0 + 2 * b}" height="${b}"/><rect x="${xm - b / 2}" y="${yR + b}" width="${b}" height="${yE - yR - b * 1.5}"/><rect x="${x0 - b / 2}" y="${yE + b / 2}" width="${b}" height="${Y(p0) - yE - b / 2}"/><rect x="${x1 - b / 2}" y="${yE + b / 2}" width="${b}" height="${Y(p0) - yE - b / 2}"/>`;
      l += `<path d="M${xm - b / 2} ${yE - b / 2}L${qx - b * .6} ${qy}L${qx + b * .2} ${qy - b * .5}L${xm - b / 2} ${yE - b * 1.6}"/><path d="M${xm + b / 2} ${yE - b / 2}L${xm + (xm - qx) + b * .6} ${qy}L${xm + (xm - qx) - b * .2} ${qy - b * .5}L${xm + b / 2} ${yE - b * 1.6}"/>`;
    }
    // plantas
    (F.plantas || []).forEach(p => { const c = p.c || '#8a6fb3'; w += `<ellipse cx="${X(p.x + p.w / 2)}" cy="${base - 8}" rx="${p.w / 2 * S}" ry="${.45 * S}" fill="${c}" opacity=".75"/><ellipse cx="${X(p.x + p.w * .3)}" cy="${base + 2}" rx="${p.w * .35 * S}" ry="${.3 * S}" fill="#6e9055" opacity=".8"/>` });
    // personas
    const gente = (F.personas || []).map(x => `<g transform="translate(${X(x)} ${base}) scale(${S / 100})" fill="${SEP}" opacity=".7"><circle cx="0" cy="-163" r="11"/><path d="M-13 -148 Q0 -153 13 -148 L17 -92 L10 -90 L8 -60 L9 0 L2 0 L0 -58 L-2 0 L-9 0 L-8 -60 L-10 -90 L-17 -92Z"/></g>`).join('');
    const nota = F.nota ? `<text x="${X(F.notaX ?? F.ancho * .62)}" y="${top - 6}" font-family="${HAND}" font-size="24" fill="${SEP}">${F.nota}</text>` : '';
    const cota = `<g font-family="${HAND}" font-size="20" fill="#6b5847"><line x1="${X(F.volumenes[0].x)}" y1="${base + 54}" x2="${X(Math.max(...F.volumenes.map(v => v.x + v.w)))}" y2="${base + 54}" stroke="#8a7560"/><text x="${(X(F.volumenes[0].x) + X(Math.max(...F.volumenes.map(v => v.x + v.w)))) / 2}" y="${base + 48}" text-anchor="middle">${f2(Math.max(...F.volumenes.map(v => v.x + v.w)) - F.volumenes[0].x)} m</text></g>`;
    const tit = `<g transform="translate(${padX} ${base + 96})"><text x="0" y="0" font-family="${SERIF}" font-style="italic" font-weight="500" font-size="36" fill="${SEP}">${m.nombre || ''} <tspan font-size="24" fill="#6b5847">· ${F.titulo || 'fachada'}</tspan></text><text x="${VW - padX * 2}" y="0" text-anchor="end" font-family="${HAND}" font-size="22" fill="#8a7560">Smart Building Uruguay</text></g>`;
    return `<svg viewBox="0 0 ${VW} ${VH}" role="img" aria-label="Fachada de ${m.nombre} en acuarela">${papel('fa', VW, VH)}<defs>${defs}</defs>
      <g filter="url(#fa)">${w}</g><g filter="url(#fw)" fill="none" stroke="${SEP}" stroke-width="1.3" stroke-linejoin="round">${l}</g>${gente}${nota}${cota}${tit}</svg>`;
  };
})();
