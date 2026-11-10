/* Cálculo de precio: lo usan la web pública y el panel, así los dos dan lo mismo.
   Venta = costo directo × (1 + imprevistos) × (1 + margen), redondeado línea por línea. */
window.SBUprecio = function (D, m, extId) {
  // extId puede ser el id del revestimiento o la configuración entera {ext, int, pis, techo}
  const cfg = Object.assign({}, typeof extId === 'object' && extId ? extId : { ext: extId });
  if (m.config) ['ext', 'int', 'pis', 'techo'].forEach(k => { if (!m.config.includes(k)) delete cfg[k] }); extId = cfg.ext || 'original';
  const P = D.precio;
  const k = (1 + P.imprevistos / 100) * (1 + P.margen / 100);
  const rd = v => Math.round(v / (P.redondeo || 1)) * (P.redondeo || 1);
  const rubrosM2 = D.rubros.reduce((a, r) => a + (+r.usdM2 || 0), 0);
  const costoM2 = rubrosM2 * (+m.factor || 1);
  const fachM2 = +m.fachadaM2 || Math.round(4 * Math.sqrt(m.m2) * P.alturaMuro * (1 - P.huecos / 100));
  // "original" = el revestimiento con que está diseñado el modelo (si está cargado)
  const orig = m.revOriginal && D.exterior.find(e => e.id === m.revOriginal);
  const ext = (extId === 'original' && orig) ? orig : (D.exterior.find(e => e.id === extId) || D.exterior[0]);
  const esOriginal = extId === 'original' || (orig && ext.id === orig.id);
  const L = [
    { id: 'casa', t: `${m.etiqueta || 'Casa'} ${m.m2} m²`, det: `${m.m2} m² × USD ${Math.round(costoM2)} costo/m²`, costo: m.m2 * costoM2 },
  ];
  if (+m.deck) L.push({ id: 'deck', t: `Decks ${m.deck} m²`, det: `${m.deck} m² × USD ${P.deckM2} costo/m²`, costo: m.deck * P.deckM2 });
  if (!m.config || m.config.includes('ext')) L.push({ id: 'fachada', t: `Fachada: ${ext.nombre}${esOriginal && orig ? ' (diseño original)' : ''}`, det: `${fachM2} m² de fachada × USD ${+ext.usdM2 || 0} extra/m²`, costo: fachM2 * (+ext.usdM2 || 0) });
  // terminaciones: la primera opción de cada lista va incluida; las otras suman (o restan) por m²
  const extra = (lista, id, nom, area, det) => { const L0 = D[lista]; if (!L0 || L0.activo === false || !id) return; const o = L0.opciones.find(x => x.id === id); if (!o || !+o.usdM2) return;
    L.push({ id: lista, t: `${nom}: ${o.nombre}`, det: `${area} m² ${det} × USD ${+o.usdM2} extra/m²`, costo: area * (+o.usdM2) }) };
  extra('interior', cfg.int, 'Interior', Math.round(fachM2 * 1.6), 'de paredes interiores (≈ fachada × 1,6)');
  extra('pisos', cfg.pis, 'Pisos', m.m2, 'de piso');
  extra('techo', cfg.techo, 'Techo', Math.round(m.m2 * 1.25), 'de techo (≈ planta × 1,25)');
  // extras elegidos: {id: cantidad}
  if (!m.config || m.config.includes('extra')) Object.entries(cfg.extras || {}).forEach(([id, n]) => {
    const x = (D.extras || []).find(e => e.id === id && (e.para || []).includes(m.id)); n = +n || 0; if (!x || !n) return;
    // los que se dimensionan en el 3D (entrepiso, oficina) cobran según su superficie
    const lay = ((cfg.layout || {})[id] || []).slice(0, n);
    if (+x.m2Base && lay.length) { const a = lay.reduce((t, q) => t + (+q.w || 0) * (+q.d || 0), 0) + Math.max(0, n - lay.length) * +x.m2Base;
      L.push({ id: 'x-' + id, t: `${x.nombre.replace(/ de \d+ m²/, '')}${n > 1 ? ` × ${n}` : ''} · ${Math.round(a * 10) / 10} m²`, det: `USD ${+x.usd} cada ${x.m2Base} m²`, costo: Math.round(+x.usd * a / +x.m2Base), extra: true }); return }
    L.push({ id: 'x-' + id, t: x.nombre + (n > 1 ? ` × ${n}` : ''), det: `${n} × USD ${+x.usd} costo`, costo: n * (+x.usd || 0), extra: true }) });
  // líneas propias de los modelos configurables (pod / galpón)
  (m.paramLineas || []).forEach(l => L.push(Object.assign({}, l)));
  L.forEach(l => { l.venta = rd(l.costo * k) });
  const costo = L.reduce((a, l) => a + l.costo, 0);
  const venta = L.reduce((a, l) => a + l.venta, 0);
  const plazo = +m.plazo || (m.m2 <= 30 ? 2 : m.m2 <= 80 ? 4 : m.m2 <= 150 ? 6 : 8);
  return {
    k, rubrosM2, costoM2, fachM2, ext, orig: orig || null, esOriginal: !!esOriginal, lineas: L, costo,
    imprevistos: costo * P.imprevistos / 100,
    margen: costo * (1 + P.imprevistos / 100) * P.margen / 100,
    venta, ventaM2: venta / m.m2, ventaM2casa: costoM2 * k, plazo,
  };
};
