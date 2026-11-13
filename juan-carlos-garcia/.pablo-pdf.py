import asyncio,re
from playwright.async_api import async_playwright
T='/tmp/t3/node_modules/three/'
async def route(r):
  m=re.search(r'three@0\.160\.0/(.*)$',r.request.url)
  if m: await r.fulfill(path=T+m.group(1),content_type='application/javascript')
  else: await r.abort()
JS=r"""()=>{
 const g=id=>{const e=document.getElementById(id); const c=e.cloneNode(true); c.removeAttribute('id'); c.removeAttribute('class'); c.removeAttribute('style'); return c.outerHTML.replace(/id="([^"]+)"/g,'id="k-$1"').replace(/url\(#([^)]+)\)/g,'url(#k-$1)').replace(/href="#([^"]+)"/g,'href="#k-$1"');};
 const lg=id=>{const c=document.getElementById(id).closest('.card'); return [...c.querySelectorAll('.lg')].map(x=>x.outerHTML).join('');};
 const sub=document.querySelector('#p-fach .sub').textContent;
 const hoy=new Date().toLocaleDateString('es-UY',{day:'numeric',month:'long',year:'numeric'});
 const cab=(n,t)=>`<div class="cab"><div><span class="lo">SMART BUILDING URUGUAY</span><b>${t}</b></div><div class="r">Locales comerciales · Avda. Pedragosa Sierra · Padrón 10596<br>Para Arq. Pablo Alcoba · ${hoy} · lámina ${n}/11</div></div>`;
 const pie=`<div class="pie">SBU · Ramiro Portugau, director de obra · 098 526 226 · smartbuildinguruguay@gmail.com · Ing. Ricardo Portugau, cálculo de estructura · Anteproyecto de base: arquitecta del cliente. Esquemas de SBU para el proyecto ejecutivo; medidas a verificar.</div>`;
 const P=[];
 P.push(`<div class="pg tit"><img src="img/render.jpg"><div class="tx"><span class="lo">SMART BUILDING URUGUAY</span><h1>Locales comerciales<br>Avda. Pedragosa Sierra</h1><p>Padrón 10596 · Punta del Este, Maldonado</p><p class="d">Material de base para el proyecto ejecutivo y el permiso de construcción<br><b>Para: Arq. Pablo Alcoba</b> · ${hoy}</p>
  <table><tr><td>Programa</td><td>${__jcg.S.n} locales comerciales en cáscara + baño, planta de 25 × 10 m (250 m²), sin columnas interiores</td></tr><tr><td>Estructura</td><td>Pórticos metálicos cada 5 m, platea H30 con vigas de fundación (cálculo: Ing. Ricardo Portugau)</td></tr><tr><td>Envolvente</td><td>Todo en panel PIR blanco (muros lisos y techo Isodec engrafado), elegido por las hormigas; vidriera continua a la plaza, faja, brise símil madera y cenefa negra</td></tr><tr><td>Obra</td><td>SBU · Ramiro Portugau, director de obra</td></tr></table>
  <h3>Láminas</h3><ol><li>Implantación: planta completa con el terreno</li><li>Planta de arquitectura</li><li>Sanitaria: planta general</li><li>Sanitaria: local tipo</li><li>Eléctrica: planta general</li><li>Eléctrica: local tipo</li><li>Fachada norte (a la plaza)</li><li>Fachada este (a la avenida) y corte</li><li>Detalle del frente: cenefa, brise símil madera y faja</li><li>Detalle del borde sur: canaleta, bajadas y desborde</li><li>Render del anteproyecto (del cliente)</li></ol></div></div>`);
 P.push(`<div class="pg">${cab(1,'Implantación: planta completa con el terreno')}<div class="dw">${g('svImpl')}</div>${pie}</div>`);
 P.push(`<div class="pg">${cab(2,'Planta de arquitectura')}<div class="dw">${g('svPlanta')}</div>${pie}</div>`);
 P.push(`<div class="pg">${cab(3,'Sanitaria: planta general')}<div class="dw">${g('svSan')}</div>${lg('svSan')}<p class="nt">PPS: pileta de patio sifonada abierta. PPT: pileta de patio tapada. CI: cámara de inspección, una por local sobre el colector. Colector a −0,60 en la CI 1 y −0,97 en la conexión.</p>${pie}</div>`);
 P.push(`<div class="pg">${cab(4,'Sanitaria: local tipo')}<div class="dw">${g('svSanL')}</div>${pie}</div>`);
 P.push(`<div class="pg">${cab(5,'Eléctrica: planta general')}<div class="dw">${g('svEle')}</div>${lg('svEle')}<p class="nt">Medición monofásica por local en el gabinete de UTE del frente (hasta 9,2 kW), alimentación enterrada a cada tablero, servicios comunes en tablero aparte.</p>${pie}</div>`);
 P.push(`<div class="pg">${cab(6,'Eléctrica: local tipo')}<div class="dw">${g('svEleL')}</div>${lg('svEle')}<p class="nt">Medición monofásica por local en el gabinete de UTE del frente (hasta 9,2 kW), alimentación enterrada a cada tablero, servicios comunes en tablero aparte.</p>${pie}</div>`);
 P.push(`<div class="pg">${cab(7,'Fachada norte (a la plaza)')}<div class="dw">${g('svFN')}</div><p class="nt">${sub}</p>${pie}</div>`);
 P.push(`<div class="pg">${cab(8,'Fachada este (a la avenida) y corte')}<div class="g2"><div class="dw">${g('svFE')}</div><div class="dw">${g('svCorte')}</div></div><p class="nt">${sub}</p>${pie}</div>`);
 P.push(`<div class="pg">${cab(9,'Detalle del frente norte: cenefa, brise y faja')}<div class="dw">${g('svDetN')}</div><p class="nt">${sub}</p>${pie}</div>`);
 P.push(`<div class="pg">${cab(10,'Detalle del borde sur: canaleta interna, bajadas y desborde')}<div class="dw">${g('svDetS')}</div><p class="nt">El muro sur se separa 30 cm de las columnas para alojar la canaleta. Las bajadas salen por un codo que atraviesa el panel y bajan por fuera hasta una boca 40 × 40; de ahí van por un colector pluvial propio a la calle, separado del cloacal (no se pueden mezclar). La platea se ensancha 0,42 m al sur para apoyar el muro. A verificar con el cálculo: ménsulas, separadores y borde de platea.</p>${pie}</div>`);
 P.push(`<div class="pg">${cab(11,'Render del anteproyecto (enviado por el cliente)')}<div class="dw ren"><img src="img/render.jpg"></div>${pie}</div>`);
 document.head.insertAdjacentHTML('beforeend',`<style>@page{size:420mm 297mm;margin:0}
 body>*:not(#doc){display:none!important} body{margin:0;background:#fff}
 #doc .pg{width:420mm;height:297mm;padding:10mm 12mm 8mm;box-sizing:border-box;display:flex;flex-direction:column;page-break-after:always;overflow:hidden}#doc .pg:last-child{page-break-after:auto;font-family:Inter,Arial,sans-serif;color:#222}
 #doc .cab{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:2px solid #b5622a;padding-bottom:3mm;margin-bottom:4mm}
 #doc .cab b{display:block;font-size:20pt}#doc .lo{font-size:8pt;letter-spacing:.25em;color:#b5622a;font-weight:700}#doc .cab .r{text-align:right;font-size:9pt;color:#666}
 #doc .dw{flex:1;min-height:0;display:flex;align-items:center;justify-content:center}#doc .dw svg{width:100%;height:100%;max-height:100%}#doc .dw.ren img{max-width:100%;max-height:100%;border-radius:2mm}
 #doc .g2{flex:1;min-height:0;display:grid;grid-template-columns:1fr 1fr;gap:6mm}
 #doc .lg{display:flex;gap:5mm;flex-wrap:wrap;font-size:9pt;margin-top:2mm}#doc .lg i{display:inline-block;width:5mm;height:2mm;margin-right:1.5mm;vertical-align:middle}
 #doc .nt{font-size:9pt;color:#555;margin:2mm 0 0}#doc .pie{font-size:7.5pt;color:#888;border-top:1px solid #ddd;padding-top:2mm;margin-top:3mm}
 #doc .tit{display:grid;grid-template-columns:1.25fr 1fr;padding:0;gap:0}#doc .tit img{width:100%;height:100%;object-fit:cover}#doc .tit .tx{padding:18mm 14mm}
 #doc .tit h1{font-size:34pt;margin:4mm 0;line-height:1.05}#doc .tit p{font-size:12pt;margin:2mm 0}#doc .tit .d{color:#555;margin:5mm 0}
 #doc .tit table{border-collapse:collapse;font-size:10pt;margin-top:4mm}#doc .tit td{padding:1.6mm 2mm;border-bottom:1px solid #e3dccf;vertical-align:top}#doc .tit td:first-child{font-weight:700;color:#b5622a;width:28mm}
 #doc h3{margin:6mm 0 1mm}#doc ol{font-size:10.5pt;margin:0;padding-left:6mm;line-height:1.55}</style>`);
 document.body.insertAdjacentHTML('beforeend',`<div id="doc">${P.join('')}</div>`);
}"""
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    pg=await b.new_page(viewport={'width':1600,'height':1100}); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.route('https://cdn.jsdelivr.net/**',route); await pg.route('https://fonts.**',lambda r: r.abort())
    await pg.goto('http://localhost:8777/juan-carlos-garcia/index.html'); await pg.wait_for_timeout(2500)
    await pg.evaluate(JS); await pg.wait_for_timeout(800)
    await pg.pdf(path='/home/claude/presupuestos/juan-carlos-garcia/SBU-Planos-para-Pablo-Alcoba-Pedragosa.pdf',prefer_css_page_size=True,print_background=True)
    print(errs); await b.close()
asyncio.run(main())
