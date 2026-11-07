/* Dibujos de cada modelo: planta y corte con cercha.
   Los usan la web y el panel. Devuelven el SVG como texto. */
(function () {
  const INK = '#1d1b18', INK2 = '#4b4842', MUTE = '#8a857b', PAPER = '#fbf8f1', WASH = '#e9dfcc';
  const MONO = "IBM Plex Mono,monospace", ARCH = "Archivo,Arial Narrow,sans-serif";
  const f2 = v => (+v).toFixed(2).replace('.', ',');
  const MAD = { lapacho: ['#8d5a3b', '#6d4229'], cumaru: ['#9a6a44', '#7a4f30'], eucalipto: ['#c49a6c', '#a57a4f'], pino: ['#dcc08f', '#bf9f6a'] };
  const mad = n => MAD[(n || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').split(' ')[0]] || MAD.pino;

  // papel con grano, común a los dos dibujos
  const papel = (id, VW, VH) => `<defs>
    <filter id="${id}g" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 .45  0 0 0 0 .38  0 0 0 0 .28  0 0 0 .06 0"/></filter>
    <filter id="${id}s" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="5"/></filter>
  </defs><rect width="${VW}" height="${VH}" fill="${PAPER}"/><rect width="${VW}" height="${VH}" filter="url(#${id}g)"/>`;

  // rótulo tipo lámina
  const rotulo = (x, y, w, titulo, sub, k = 1) => `<g transform="translate(${x} ${y}) scale(${k})">
    <line x1="0" y1="0" x2="${w / k}" y2="0" stroke="${INK}" stroke-width="1.4"/>
    <text x="0" y="24" font-family="${ARCH}" font-stretch="75%" font-weight="800" font-size="22" letter-spacing=".5" fill="${INK}">${titulo}</text>
    <text x="0" y="44" font-family="${MONO}" font-size="12" fill="${INK2}">${sub}</text>
    <text x="${w / k}" y="24" text-anchor="end" font-family="${MONO}" font-size="11" letter-spacing="1.5" fill="${MUTE}">SMART BUILDING URUGUAY</text>
  </g>`;

  // árbol a mano alzada (toque de croquis)
  const arbol = (cx, cy, r, k) => {
    let d = '';
    const n = 11;
    for (let i = 0; i <= n; i++) {
      const a = i / n * Math.PI * 2, rr = r * (0.82 + 0.18 * Math.sin(i * 2.3 + k));
      d += (i ? 'L' : 'M') + (cx + rr * Math.cos(a)).toFixed(1) + ' ' + (cy + rr * Math.sin(a)).toFixed(1);
    }
    return `<g opacity=".85"><circle cx="${cx + r * .18}" cy="${cy + r * .22}" r="${r}" fill="${WASH}" opacity=".7"/><path d="${d}Z" fill="#c9d1b8" fill-opacity=".55" stroke="${INK2}" stroke-width="1"/><path d="M${cx - r * .35} ${cy}L${cx + r * .35} ${cy}M${cx} ${cy - r * .35}L${cx} ${cy + r * .35}" stroke="${INK2}" stroke-width=".8"/></g>`;
  };

  /* ---------------- PLANTA ---------------- */
  window.SBUplanta = function (P, m) {
    const S = 100, pad = 120, W = P.ancho * S, H = P.prof * S, e = P.eExt * S, ei = P.eInt * S;
    const X = x => pad + x * S, Y = y => pad + y * S;
    let o = '';
    o += `<defs>
      <pattern id="pl-hx" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="7" height="7" fill="${INK}"/><line x1="0" y1="0" x2="0" y2="7" stroke="#5b564d" stroke-width="1.6"/></pattern>
      <pattern id="pl-piso" width="${S * 1.2}" height="${S * .2}" patternUnits="userSpaceOnUse"><rect width="${S * 1.2}" height="${S * .2}" fill="#f4ecdc"/><line x1="0" y1="${S * .2}" x2="${S * 1.2}" y2="${S * .2}" stroke="#e3d5bb" stroke-width="1"/><line x1="${S * .7}" y1="0" x2="${S * .7}" y2="${S * .2}" stroke="#e3d5bb" stroke-width="1"/></pattern>
    </defs>`;
    // vegetación alrededor
    o += arbol(X(-0.75), Y(P.prof * .75), 40, 1) + arbol(X(P.ancho) + e + 125, Y(P.prof * .2), 52, 2) + arbol(X(P.ancho) + e + 105, Y(P.prof * .85), 34, 3);
    // sombra de la casa (aguada)
    o += `<rect x="${X(0) - e + 14}" y="${Y(0) - e + 16}" width="${W + 2 * e}" height="${H + 2 * e}" fill="#b9a98c" opacity=".35" filter="url(#pls)"/>`;
    // piso interior
    o += `<rect x="${X(0)}" y="${Y(0)}" width="${W}" height="${H}" fill="url(#pl-piso)"/>`;
    // muros exteriores
    o += `<path fill-rule="evenodd" fill="url(#pl-hx)" d="M${X(0) - e} ${Y(0) - e}h${W + 2 * e}v${H + 2 * e}h${-W - 2 * e}Z M${X(0)} ${Y(0)}v${H}h${W}v${-H}Z"/>`;
    // muros interiores
    (P.muros || []).forEach(w => {
      const [x1, y1, x2, y2] = w;
      if (x1 === x2) o += `<rect x="${X(x1) - ei / 2}" y="${Y(y1)}" width="${ei}" height="${(y2 - y1) * S}" fill="${INK}"/>`;
      else o += `<rect x="${X(x1)}" y="${Y(y1) - ei / 2}" width="${(x2 - x1) * S}" height="${ei}" fill="${INK}"/>`;
    });
    const side = mm => {
      if (Array.isArray(mm)) { const [a, b, c, d] = mm; return { x1: a, y1: b, x2: c, y2: d } }
      return { N: { x1: 0, y1: 0, x2: P.ancho, y2: 0 }, S: { x1: 0, y1: P.prof, x2: P.ancho, y2: P.prof }, O: { x1: 0, y1: 0, x2: 0, y2: P.prof }, E: { x1: P.ancho, y1: 0, x2: P.ancho, y2: P.prof } }[mm];
    };
    const ext = k => typeof k === 'string';
    // ventanas (con haz de luz hacia adentro)
    (P.ventanas || []).forEach(v => {
      const s = side(v.m), h = s.y1 === s.y2, off = ext(v.m) ? (v.m === 'N' || v.m === 'O' ? -e : 0) : 0, t = e;
      const into = v.m === 'N' || v.m === 'O' ? 1 : -1, L = v.a * S;
      if (h) {
        const x = X(s.x1 + v.en - v.a / 2), y = Y(s.y1) + off, yi = into > 0 ? y + t : y;
        o += `<path d="M${x} ${yi}L${x + L} ${yi}L${x + L * .85} ${yi + into * L * .55}L${x + L * .15} ${yi + into * L * .55}Z" fill="#f3d58f" opacity=".28"/>`;
        o += `<rect x="${x}" y="${y}" width="${L}" height="${t}" fill="${PAPER}" stroke="${INK}" stroke-width="1"/><line x1="${x}" y1="${y + t / 2}" x2="${x + L}" y2="${y + t / 2}" stroke="${INK}" stroke-width="1"/>`;
      } else {
        const y = Y(s.y1 + v.en - v.a / 2), x = X(s.x1) + off, xi = into > 0 ? x + t : x;
        o += `<path d="M${xi} ${y}L${xi} ${y + L}L${xi + into * L * .55} ${y + L * .85}L${xi + into * L * .55} ${y + L * .15}Z" fill="#f3d58f" opacity=".28"/>`;
        o += `<rect x="${x}" y="${y}" width="${t}" height="${L}" fill="${PAPER}" stroke="${INK}" stroke-width="1"/><line x1="${x + t / 2}" y1="${y}" x2="${x + t / 2}" y2="${y + L}" stroke="${INK}" stroke-width="1"/>`;
      }
    });
    // puertas
    (P.puertas || []).forEach(d => {
      const s = side(d.m), h = s.y1 === s.y2, ex = ext(d.m); const t = (ex ? P.eExt : P.eInt) * S, off = ex ? (d.m === 'N' || d.m === 'O' ? -e : 0) : -t / 2; const r = d.a * S;
      if (h) {
        const x = X(s.x1 + d.en - d.a / 2), y = Y(s.y1) + off; o += `<rect x="${x}" y="${y - 1}" width="${r}" height="${t + 2}" fill="#f4ecdc"/>`;
        const yb = d.giro > 0 ? y : y + t, dir = d.giro > 0 ? -1 : 1;
        o += `<path d="M${x} ${yb}L${x} ${yb + dir * r}A${r} ${r} 0 0 ${dir > 0 ? 0 : 1} ${x + r} ${yb}Z" fill="${WASH}" opacity=".45"/><line x1="${x}" y1="${yb}" x2="${x}" y2="${yb + dir * r}" stroke="${INK}" stroke-width="1.8"/><path d="M${x} ${yb + dir * r}A${r} ${r} 0 0 ${dir > 0 ? 0 : 1} ${x + r} ${yb}" fill="none" stroke="${INK}" stroke-width=".8" stroke-dasharray="4 3"/>`;
      } else {
        const y = Y(s.y1 + d.en - d.a / 2), x = X(s.x1) + off; o += `<rect x="${x - 1}" y="${y}" width="${t + 2}" height="${r}" fill="#f4ecdc"/>`;
        o += `<path d="M${x} ${y}L${x + r} ${y}A${r} ${r} 0 0 1 ${x} ${y + r}Z" fill="${WASH}" opacity=".45"/><line x1="${x}" y1="${y}" x2="${x + r}" y2="${y}" stroke="${INK}" stroke-width="1.8"/><path d="M${x + r} ${y}A${r} ${r} 0 0 1 ${x} ${y + r}" fill="none" stroke="${INK}" stroke-width=".8" stroke-dasharray="4 3"/>`;
      }
    });
    // equipamiento
    const st = `fill="#fffdf8" stroke="${INK2}" stroke-width="1"`;
    (P.equip || []).forEach(q => {
      if (q.t === 'mesada') { o += `<rect x="${X(q.x)}" y="${Y(q.y)}" width="${q.w * S}" height="${q.h * S}" ${st}/><rect x="${X(q.x + .25)}" y="${Y(q.y + .1)}" width="45" height="38" rx="3" ${st}/>` + [[1.35, .18], [1.6, .18], [1.35, .42], [1.6, .42]].map(([a, b]) => `<circle cx="${X(q.x + a)}" cy="${Y(q.y + b)}" r="9" ${st}/>`).join('') }
      if (q.t === 'cama') { o += `<rect x="${X(q.x)}" y="${Y(q.y)}" width="${q.w * S}" height="${q.h * S}" rx="4" ${st}/><rect x="${X(q.x + .12)}" y="${Y(q.y + .08)}" width="${.6 * S}" height="${.4 * S}" rx="8" ${st}/><rect x="${X(q.x + .88)}" y="${Y(q.y + .08)}" width="${.6 * S}" height="${.4 * S}" rx="8" ${st}/><path d="M${X(q.x)} ${Y(q.y + .62)}Q${X(q.x + q.w / 2)} ${Y(q.y + .55)} ${X(q.x + q.w)} ${Y(q.y + .62)}" fill="none" stroke="${INK2}"/>` }
      if (q.t === 'inodoro') { o += `<rect x="${X(q.x)}" y="${Y(q.y)}" width="40" height="18" rx="2" ${st}/><ellipse cx="${X(q.x) + 20}" cy="${Y(q.y) + 42}" rx="17" ry="24" ${st}/>` }
      if (q.t === 'ducha') { o += `<rect x="${X(q.x)}" y="${Y(q.y)}" width="${q.w * S}" height="${q.h * S}" fill="#e4ebec" stroke="${INK2}"/><circle cx="${X(q.x + q.w / 2)}" cy="${Y(q.y + q.h / 2)}" r="5" fill="none" stroke="${INK2}"/>` }
      if (q.t === 'lav') { o += `<rect x="${X(q.x)}" y="${Y(q.y)}" width="45" height="40" rx="4" ${st}/><ellipse cx="${X(q.x) + 24}" cy="${Y(q.y) + 20}" rx="14" ry="12" ${st}/>` }
    });
    // locales
    (P.locales || []).forEach(l => {
      o += `<text x="${X(l.x)}" y="${Y(l.y)}" text-anchor="middle" font-family="${ARCH}" font-stretch="75%" font-weight="700" font-size="17" letter-spacing=".8" fill="${INK}" paint-order="stroke" stroke="#f4ecdc" stroke-width="4">${l.n.toUpperCase()}</text><text x="${X(l.x)}" y="${Y(l.y) + 17}" text-anchor="middle" font-family="${MONO}" font-size="12" fill="${INK2}" paint-order="stroke" stroke="#f4ecdc" stroke-width="3">${(+l.a).toFixed(1).replace('.', ',')} m²</text>`;
    });
    // cotas
    const chain = (arr, isX) => {
      if (!arr || arr.length < 2) return;
      const off = isX ? Y(P.prof) + e + 36 : X(P.ancho) + e + 36;
      for (let i = 0; i < arr.length; i++) {
        const v = isX ? X(arr[i]) : Y(arr[i]);
        o += isX ? `<line x1="${v}" y1="${off - 9}" x2="${v}" y2="${off + 9}" stroke="${INK2}"/><line x1="${v - 5}" y1="${off + 5}" x2="${v + 5}" y2="${off - 5}" stroke="${INK}" stroke-width="1.6"/>`
          : `<line x1="${off - 9}" y1="${v}" x2="${off + 9}" y2="${v}" stroke="${INK2}"/><line x1="${off - 5}" y1="${v + 5}" x2="${off + 5}" y2="${v - 5}" stroke="${INK}" stroke-width="1.6"/>`;
        if (i) {
          const a = isX ? X(arr[i - 1]) : Y(arr[i - 1]), mid = (a + v) / 2, txt = f2(arr[i] - arr[i - 1]);
          o += isX ? `<text x="${mid}" y="${off - 7}" text-anchor="middle" font-family="${MONO}" font-size="12" fill="${INK2}">${txt}</text>`
            : `<text x="${off + 7}" y="${mid + 4}" font-family="${MONO}" font-size="12" fill="${INK2}">${txt}</text>`;
        }
      }
      o += isX ? `<line x1="${X(arr[0]) - 12}" y1="${off}" x2="${X(arr[arr.length - 1]) + 12}" y2="${off}" stroke="${INK2}"/>` : `<line x1="${off}" y1="${Y(arr[0]) - 12}" x2="${off}" y2="${Y(arr[arr.length - 1]) + 12}" stroke="${INK2}"/>`;
    };
    chain(P.cotasX, true); chain(P.cotasY, false);
    // norte
    o += `<g transform="translate(${pad - 62} ${pad - 58})"><circle r="20" fill="${PAPER}" stroke="${INK}"/><path d="M0 -17 L7 10 L0 5 Z" fill="${INK}"/><path d="M0 -17 L-7 10 L0 5 Z" fill="none" stroke="${INK}"/><text y="-26" text-anchor="middle" font-family="${MONO}" font-size="11" font-weight="500" fill="${INK}">N</text></g>`;
    // escala gráfica + rótulo
    const VW = Math.max(W + pad * 2 + 120, 760), sy = Y(P.prof) + e + 82;
    o += `<g font-family="${MONO}" font-size="10" fill="${INK2}"><rect x="${pad}" y="${sy}" width="${S}" height="6" fill="${INK}"/><rect x="${pad + S}" y="${sy}" width="${S}" height="6" fill="none" stroke="${INK}"/><text x="${pad}" y="${sy + 20}">0</text><text x="${pad + S}" y="${sy + 20}" text-anchor="middle">1</text><text x="${pad + 2 * S}" y="${sy + 20}" text-anchor="middle">2 m</text></g>`;
    const ry = sy + 40;
    o += rotulo(pad, ry, VW - pad * 2, `${(m.nombre || '').toUpperCase()} · PLANTA`, `${m.m2} m² cubiertos${+m.deck ? ' · ' + m.deck + ' m² de decks' : ''} · ${f2(P.ancho + 2 * P.eExt)} × ${f2(P.prof + 2 * P.eExt)} m exterior · cotas en metros`);
    const VH = ry + 62;
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
    o += `<rect x="${X(-alero) - 30}" y="${Y(yc + Ht + .3) - 10}" width="${(L + 2 * alero) * S + 60}" height="${(Ht + .6) * S}" fill="#efe6d4" opacity=".45" rx="40"/>`;
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
    o += `<path d="M${X(0)} ${Y(yc)}L${X(L)} ${Y(yc)}L${X(L)} ${Y(yc + hh)}L${X(L / 2)} ${Y(yc + Ht)}L${X(0)} ${Y(yc + hh)}Z" fill="url(#ce-v)" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>`;
    // huecos interiores (dejan ver el pendolón al medio)
    const x0 = (b - hh + dv) * (L / 2) / (Ht - hh), xm = L / 2 - b / 2;
    const hole = (s) => {
      const fx = x => s > 0 ? x : L - x;
      return `<path d="M${X(fx(x0))} ${Y(yc + b)}L${X(fx(xm))} ${Y(yc + b)}L${X(fx(xm))} ${Y(yIn(xm))}Z" fill="#f6efe1" stroke="${INK}" stroke-width="1.4" stroke-linejoin="round"/>`;
    };
    o += hole(1) + hole(-1);
    // diagonales (puntales) del pie del pendolón al cuarto de luz
    const strut = (s) => {
      const fx = x => s > 0 ? x : L - x;
      const xa = L / 4 - b * .6, xb = xa + b * 1.6;
      const p = [[xm, yc + b], [xa, yIn(xa)], [xb, yIn(xb)], [xm, yc + b + b * 1.15]];
      return `<path d="M${p.map(([x, y]) => X(fx(x)) + ' ' + Y(y)).join('L')}Z" fill="url(#ce-v)" stroke="${INK}" stroke-width="1.4" stroke-linejoin="round"/>`;
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
      s += vert ? `<text x="${x1 + (side || 8)}" y="${(y1 + y2) / 2 + 4}" ${side < 0 ? 'text-anchor="end"' : ''} font-family="${MONO}" font-size="17" fill="${INK}">${txt}</text>`
        : `<text x="${(x1 + x2) / 2}" y="${y1 - 8}" text-anchor="middle" font-family="${MONO}" font-size="17" fill="${INK}">${txt}</text>`;
      return s;
    };
    const dy = base + 52;
    o += dim(X(0), dy, X(L), dy, `LUZ ${f2(L)}`);
    o += `<line x1="${X(0)}" y1="${base + 6}" x2="${X(0)}" y2="${dy + 8}" stroke="${INK2}" stroke-width=".6"/><line x1="${X(L)}" y1="${base + 6}" x2="${X(L)}" y2="${dy + 8}" stroke="${INK2}" stroke-width=".6"/>`;
    const dx = X(L + alero) + 46;
    o += dim(dx, Y(yc), dx, Y(yc + Ht), f2(Ht), 8) + dim(dx, base, dx, Y(yc), f2(col), 8);
    o += `<line x1="${X(L / 2) + 6}" y1="${Y(yc + Ht)}" x2="${dx + 8}" y2="${Y(yc + Ht)}" stroke="${INK2}" stroke-width=".6" stroke-dasharray="4 4"/>`;
    // ángulo
    const ax = X(0) + 1.1 * S;
    o += `<path d="M${ax} ${Y(yc + hh)}A${1.1 * S} ${1.1 * S} 0 0 0 ${X(0) + 1.1 * S * Math.cos(ang)} ${Y(yc + hh) - 1.1 * S * Math.sin(ang)}" fill="none" stroke="${INK2}" stroke-width=".8"/><text x="${ax + 8}" y="${Y(yc + hh) - 6}" font-family="${MONO}" font-size="16" fill="${INK2}">${(ang * 180 / Math.PI).toFixed(0)}°</text>`;
    // llamadas
    const call = (x, y, tx, ty, txt, izq) => `<circle cx="${x}" cy="${y}" r="3" fill="${INK}"/><path d="M${x} ${y}L${tx} ${ty}" stroke="${INK}" stroke-width=".8" fill="none"/><text x="${tx + ((izq ?? tx < x) ? -6 : 6)}" y="${ty + 4}" ${(izq ?? tx < x) ? 'text-anchor="end"' : ''} font-family="${MONO}" font-size="16" fill="${INK}">${txt}</text>`;
    const mat = (C.material || 'madera').toUpperCase();
    o += call(X(L * .15), Y(yTop(L * .15) - dv / 2), X(L * .1), Y(yc - .55), `PAR · ${mat} ${C.seccion || 20}×${C.seccion || 20}`, false);
    o += call(X(L * .82), Y(yc + b / 2), X(L + alero) - 10, Y(yc) + 34, 'TIRANTE');
    o += call(X(L * .7), Y(yIn(L * .7) - .25), X(L * .77), Y(yc + Ht * 1.02), 'PUNTAL');
    if (C.techo) o += call(X(L * .38), Y(yTop(L * .38) + .08), X(L * .3), Y(yc + Ht + .55), String(C.techo).toUpperCase());
    // rótulo
    const VW = X(L + alero) + 130, ry = dy + 40;
    const sub = [`${mat} ${C.seccion || 20} × ${C.seccion || 20} cm`, +C.separacion ? `una cada ${f2(C.separacion)} m` : '', +C.cantidad ? `${C.cantidad} cerchas a la vista` : '', 'cotas en metros'].filter(Boolean).join(' · ');
    o += rotulo(padX, ry, VW - padX * 2, `${(m.nombre || '').toUpperCase()} · CORTE POR LA CERCHA`, sub, 1.35);
    const VH = ry + 80;
    return `<svg viewBox="0 0 ${VW} ${VH}" role="img" aria-label="Corte de ${m.nombre} por la cercha de ${C.material || 'madera'}">${papel('ce', VW, VH)}${o}</svg>`;
  };
})();
