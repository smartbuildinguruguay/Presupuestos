/* Texturas de revestimiento dibujadas en código (las usan la web y el panel). */
/* tam = tamaño de tabla/onda: 1 normal, 2 el doble de grande, 0.5 la mitad */
/* dir = sentido de las tablas/ondas: 'v' vertical, 'h' horizontal */
window.SBUtex = function (kind,size=256,tam=1,dir='v'){
  tam=+tam>0?+tam:1;
  const c=document.createElement('canvas');c.width=c.height=size;const g=c.getContext('2d');
  const rnd=(a,b)=>a+Math.random()*(b-a);
  if(kind==='pino'||kind==='lapacho'){
    const base=kind==='pino'?[196,158,104]:[122,102,86], bh=size/Math.max(1,Math.round((kind==='pino'?6:8)/tam));
    for(let y=0;y<size;y+=bh){const k=rnd(-14,14);g.fillStyle=`rgb(${base[0]+k},${base[1]+k},${base[2]+k})`;g.fillRect(0,y,size,bh);
      g.strokeStyle='rgba(0,0,0,.08)';for(let i=0;i<10;i++){g.beginPath();const yy=y+rnd(2,bh-2);g.moveTo(0,yy);g.bezierCurveTo(size*.3,yy+rnd(-3,3),size*.7,yy+rnd(-3,3),size,yy);g.stroke()}
      g.fillStyle='rgba(0,0,0,.35)';g.fillRect(0,y+bh-2,size,2)}
  }else if(kind==='chapa'){
    const n=Math.max(2,Math.round(12/tam)),w=size/n;for(let i=0;i<n;i++){const gr=g.createLinearGradient(i*w,0,(i+1)*w,0);gr.addColorStop(0,'#2a2c2e');gr.addColorStop(.5,'#4a4d50');gr.addColorStop(1,'#1d1f21');g.fillStyle=gr;g.fillRect(i*w,0,w,size)}
  }else if(kind==='eifs'){
    g.fillStyle='#ecebe6';g.fillRect(0,0,size,size);for(let i=0;i<size*size/18;i++){g.fillStyle=`rgba(0,0,0,${rnd(0,.05)})`;g.fillRect(rnd(0,size),rnd(0,size),1,1)}
  }else{g.fillStyle='#bbb';g.fillRect(0,0,size,size)}
  // pino/lapacho se dibujan horizontales y la chapa vertical: se gira si hace falta
  const nativo=kind==='chapa'?'v':(kind==='pino'||kind==='lapacho')?'h':null;
  if(nativo&&dir&&dir!==nativo){const r=document.createElement('canvas');r.width=r.height=size;const q=r.getContext('2d');
    q.translate(size/2,size/2);q.rotate(Math.PI/2);q.drawImage(c,-size/2,-size/2);return r}
  return c;
};
/* tamaño y sentido finales de un revestimiento en un modelo */
window.SBUtexDe = function (e,m){
  const tam=(+e.tam||1)*(+(m&&m.texEsc)||1),dir=e.dir||'v';
  return {tam,dir,key:e.tex+'@'+tam+dir};
};

/* Toma una textura que ya trae el modelo de Sketchfab y la estira: largo = tablas más largas, ancho = tablas más anchas.
   El sentido de las tablas se detecta solo. cb(uidNuevo) o cb(null, motivo) si no se pudo. */
window.SBUestirar = function (api, uid, largo, ancho, cache, cb0, dir) {
  largo = +largo > 0 ? +largo : 1; ancho = +ancho > 0 ? +ancho : 1;
  // si no se puede leer la del 3D, se usa la dibujada (lapacho grisáceo) con la misma medida, así los números siempre hacen algo
  const cb = (u, why) => { if (u) return cb0(u); const k2 = 'dib:' + largo + ':' + ancho + ':' + (dir || 'h'); if (cache[k2]) return cb0(cache[k2], why);
    const c = window.SBUtex('lapacho', 512, ancho, 'h'), g = c.getContext('2d'), bh = 512 / Math.max(1, Math.round(8 / ancho)), n = Math.max(0, Math.round(3 / largo));
    g.fillStyle = 'rgba(0,0,0,.4)'; for (let y = 0; y < 512; y += bh) for (let i = 0; i < n; i++) g.fillRect(Math.random() * 512, y, 2, bh);
    let out = c; if ((dir || 'h') === 'v') { out = document.createElement('canvas'); out.width = out.height = 512; const q = out.getContext('2d'); q.translate(256, 256); q.rotate(Math.PI / 2); q.drawImage(c, -256, -256) }
    try { api.addTexture(out.toDataURL('image/jpeg', .88), (e, u2) => { if (!e) cache[k2] = u2; cb0(e ? null : u2, why) }) } catch (x) { cb0(null, why) } };
  const key = 'est:' + uid + ':' + largo + ':' + ancho; if (cache[key]) return cb(cache[key]);
  if (largo === 1 && ancho === 1) return cb(uid);
  const no = m => cb(null, m);
  try { api.getTextureList((e, l) => {
    if (e) return no('Sketchfab no pasó la lista de texturas');
    const t = (l || []).find(x => x.uid === uid); if (!t) return no('no encontré la textura en el modelo');
    const im = (t.images || []).filter(i => i.url).sort((a, b) => Math.abs(a.width - 1024) - Math.abs(b.width - 1024))[0];
    if (!im) return no('Sketchfab no da la imagen de esta textura');
    const img = new Image(); img.crossOrigin = 'anonymous'; img.onerror = () => no('no se pudo descargar la imagen de la textura');
    img.onload = () => { try {
      const w = img.naturalWidth, h = img.naturalHeight, s = document.createElement('canvas'), S = Math.min(256, w, h); s.width = s.height = S;
      const sg = s.getContext('2d'); sg.drawImage(img, 0, 0, S, S); const d = sg.getImageData(0, 0, S, S).data;
      let gx = 0, gy = 0; for (let y = 1; y < S; y++) for (let x = 1; x < S; x++) { const i = (y * S + x) * 4; gx += Math.abs(d[i] - d[i - 4]); gy += Math.abs(d[i] - d[i - S * 4]) }
      const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d');
      // gx<gy: las tablas corren a lo ancho de la imagen (x)
      if (gx < gy) g.drawImage(img, 0, 0, w / largo, h / ancho, 0, 0, w, h); else g.drawImage(img, 0, 0, w / ancho, h / largo, 0, 0, w, h);
      api.addTexture(c.toDataURL('image/jpeg', .88), (err, u) => { if (err) return no('Sketchfab no aceptó la textura nueva'); cache[key] = u; cb(u) });
    } catch (x) { no('el navegador no deja leer la imagen de Sketchfab') } };
    img.src = im.url }) } catch (x) { no('esta versión del visor no deja leer texturas') }
};

/* Machimbre / deck de madera dibujado, con la medida controlada:
   ancho = tablas más anchas (1 = 8 tablas por paño), largo = tablas más largas (1 = pocas juntas: una cada ~2 paños).
   El color por defecto copia el lapacho del 3D (marrón grisáceo). Se dibuja horizontal y se gira si dir='v'. */
window.SBUmadera = function (size, ancho, largo, dir, base) {
  size = size || 512; ancho = +ancho > 0 ? +ancho : 1; largo = +largo > 0 ? +largo : 1; base = base || [128, 104, 84];
  let seed = 7; const r = () => (seed = (seed * 16807) % 2147483647) / 2147483647, rnd = (a, b) => a + r() * (b - a);
  const c = document.createElement('canvas'); c.width = c.height = size; const g = c.getContext('2d');
  const nT = Math.max(1, Math.round(8 / ancho)), bh = size / nT, jt = .6 / largo;
  for (let t = 0; t < nT; t++) {
    const y = t * bh, nJ = Math.floor(jt) + (r() < jt % 1 ? 1 : 0), cuts = [0]; for (let j = 0; j < nJ; j++) cuts.push(((j + rnd(.15, .85)) / nJ) * size); cuts.push(size);
    const tonos = cuts.slice(1).map(() => [rnd(-10, 10), rnd(-4, 4)]); tonos[tonos.length - 1] = tonos[0]; // la tabla sigue igual al repetirse el paño
    for (let k = 0; k + 1 < cuts.length; k++) {
      const x0 = cuts[k], x1 = cuts[k + 1], d = tonos[k][0], w = tonos[k][1];
      g.fillStyle = `rgb(${base[0] + d + w},${base[1] + d},${base[2] + d - w})`; g.fillRect(x0, y, x1 - x0, bh);
      // veta fina y larga
      for (let i = 0; i < 14; i++) { const yy = y + rnd(1, bh - 1), a = rnd(.03, .1); g.strokeStyle = r() < .5 ? `rgba(40,28,20,${a})` : `rgba(255,240,220,${a * .6})`; g.lineWidth = rnd(.5, 1.4);
        g.beginPath(); g.moveTo(x0, yy); g.bezierCurveTo(x0 + (x1 - x0) * .3, yy + rnd(-bh * .08, bh * .08), x0 + (x1 - x0) * .7, yy + rnd(-bh * .08, bh * .08), x1, yy + rnd(-1, 1)); g.stroke() }
      if (k > 0) { g.fillStyle = 'rgba(25,18,12,.45)'; g.fillRect(x0 - 1, y, 2, bh) }
    }
    g.fillStyle = 'rgba(20,14,10,.5)'; g.fillRect(0, y + bh - Math.max(1.5, size / 300), size, Math.max(1.5, size / 300));
    g.fillStyle = 'rgba(255,245,230,.08)'; g.fillRect(0, y, size, 1);
  }
  if (dir === 'v') { const o = document.createElement('canvas'); o.width = o.height = size; const q = o.getContext('2d'); q.translate(size / 2, size / 2); q.rotate(Math.PI / 2); q.drawImage(c, -size / 2, -size / 2); return o }
  return c;
};
