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
