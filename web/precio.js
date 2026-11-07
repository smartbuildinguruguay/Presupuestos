/* Cálculo de precio: lo usan la web pública y el panel, así los dos dan lo mismo.
   Venta = costo directo × (1 + imprevistos) × (1 + margen), redondeado línea por línea. */
window.SBUprecio = function (D, m, extId) {
  const P = D.precio;
  const k = (1 + P.imprevistos / 100) * (1 + P.margen / 100);
  const rd = v => Math.round(v / (P.redondeo || 1)) * (P.redondeo || 1);
  const rubrosM2 = D.rubros.reduce((a, r) => a + (+r.usdM2 || 0), 0);
  const costoM2 = rubrosM2 * (+m.factor || 1);
  const fachM2 = +m.fachadaM2 || Math.round(4 * Math.sqrt(m.m2) * P.alturaMuro * (1 - P.huecos / 100));
  const ext = D.exterior.find(e => e.id === extId) || D.exterior[0];
  const L = [
    { id: 'casa', t: `Casa ${m.m2} m²`, det: `${m.m2} m² × USD ${Math.round(costoM2)} costo/m²`, costo: m.m2 * costoM2 },
  ];
  if (+m.deck) L.push({ id: 'deck', t: `Decks ${m.deck} m²`, det: `${m.deck} m² × USD ${P.deckM2} costo/m²`, costo: m.deck * P.deckM2 });
  L.push({ id: 'fachada', t: `Fachada: ${ext.nombre}`, det: `${fachM2} m² de fachada × USD ${+ext.usdM2 || 0} extra/m²`, costo: fachM2 * (+ext.usdM2 || 0) });
  L.forEach(l => { l.venta = rd(l.costo * k) });
  const costo = L.reduce((a, l) => a + l.costo, 0);
  const venta = L.reduce((a, l) => a + l.venta, 0);
  const plazo = m.m2 <= 30 ? 2 : m.m2 <= 80 ? 4 : m.m2 <= 150 ? 6 : 8;
  return {
    k, rubrosM2, costoM2, fachM2, ext, lineas: L, costo,
    imprevistos: costo * P.imprevistos / 100,
    margen: costo * (1 + P.imprevistos / 100) * P.margen / 100,
    venta, ventaM2: venta / m.m2, ventaM2casa: costoM2 * k, plazo,
  };
};
