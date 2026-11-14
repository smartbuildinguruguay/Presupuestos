import sys, math, os
sys.path.insert(0,'/tmp/vid/impl')
import model as M
from model import SCH, metrics, sun, sunrise_set, DATES, mec, touch, LOTS, AREA
OUT='/home/claude/presupuestos/jcg-pedragosa-implantacion/index.html'
s=7.0; ox=44; oy=34
def px(X): return ox+(X+47.3)*s
def py(Y): return oy+(60-Y)*s
def es(n): return f"{n:,.0f}".replace(',','.')
def pc(v): return '—' if v is None else f"{round(v*100)} %"
def hm(h): return f"{int(h)}:{int(round((h%1)*60)):02d}"
def hull(points):
    pts=sorted(set(points))
    if len(pts)<=2: return pts
    def cross(o,a,b): return (a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0])
    lo=[]
    for p in pts:
        while len(lo)>=2 and cross(lo[-2],lo[-1],p)<=0: lo.pop()
        lo.append(p)
    up=[]
    for p in reversed(pts):
        while len(up)>=2 and cross(up[-2],up[-1],p)<=0: up.pop()
        up.append(p)
    return lo[:-1]+up[:-1]
def groups_of(bl):
    groups=[]
    for b in bl:
        g=[x for x in groups if any(touch(b,y) for y in x)]
        newg=[b]
        for x in g: newg+=x; groups.remove(x)
        groups.append(newg)
    return groups
def shadows(bl,doy,clock):
    alt,az=sun(doy,clock)
    if alt<=0: return []
    out=[]
    for b in bl:
        L=min(b.H/math.tan(alt),80)
        dx,dy=-math.sin(az)*L,-math.cos(az)*L
        c=b.corners()
        out.append(hull(c+[(x+dx,y+dy) for x,y in c]))
    return out
FILL={'c':'#7f93a8','k':'#b58b5c','g':'#d5dde4'}
def plan_svg(key):
    S=SCH[key]; bl=S['B']; m=metrics(key)
    W=px(0)+112; H=py(0)+34
    o=[f'<svg viewBox="0 0 {W:.0f} {H:.0f}" class="plan" role="img" aria-label="Planta esquema {key}">']
    o.append(f'<rect x="{px(-47.3):.1f}" y="{py(60):.1f}" width="{47.3*s:.1f}" height="{60*s:.1f}" fill="#e9f2e4" stroke="#222" stroke-width="1.5"/>')
    o.append(f'<rect x="{px(-10):.1f}" y="{py(60):.1f}" width="{10*s:.1f}" height="{60*s:.1f}" fill="#efe9dd"/>')
    o.append(f'<rect x="{px(0):.1f}" y="{py(60):.1f}" width="30" height="{60*s:.1f}" fill="#c9cdd1"/>')
    o.append(f'<text transform="translate({px(0)+20:.1f},{py(30):.1f}) rotate(-90)" text-anchor="middle" class="t">Av. Pedragosa Sierra</text>')
    for Y in (20,40):
        o.append(f'<line x1="{px(-47.3):.1f}" y1="{py(Y):.1f}" x2="{px(0):.1f}" y2="{py(Y):.1f}" stroke="#555" stroke-dasharray="4 3"/>')
    for k,(a,z) in LOTS.items():
        o.append(f'<text x="{px(-47.3)+5:.1f}" y="{py(z)+13:.1f}" class="t">{k} · {es(AREA[k])} m²</text>')
    o.append(f'<rect x="{px(-37):.1f}" y="{py(56):.1f}" width="{27*s:.1f}" height="{52*s:.1f}" fill="none" stroke="#777" stroke-dasharray="6 4"/>')
    o.append(f'<text x="{px(-36.5):.1f}" y="{py(55.5):.1f}" class="t g">envolvente usada (ver supuestos)</text>')
    o.append(f'<text x="{px(-9.6):.1f}" y="{py(59.2):.1f}" class="t" transform="rotate(-90 {px(-9.6):.1f} {py(59.2):.1f})">retiro frontal 10 m</text>')
    for i in range(m['plazas']):
        y0=6+i*2.6
        o.append(f'<rect x="{px(-9.5):.1f}" y="{py(y0+2.5):.1f}" width="{5*s:.1f}" height="{2.5*s:.1f}" fill="#fff" stroke="#666" stroke-width=".7"/>')
    o.append(f'<line x1="{px(-2.5):.1f}" y1="{py(0.5):.1f}" x2="{px(-2.5):.1f}" y2="{py(59.5):.1f}" stroke="#666" stroke-dasharray="2 3"/>')
    for Y in (10,30,50):
        o.append(f'<polygon points="{px(0):.1f},{py(Y):.1f} {px(0)+9:.1f},{py(Y)-4:.1f} {px(0)+9:.1f},{py(Y)+4:.1f}" fill="#b03a2e"/>')
    for sh in shadows(bl,172,12.67):
        o.append('<polygon points="'+' '.join(f"{px(x):.1f},{py(y):.1f}" for x,y in sh)+'" fill="rgba(40,50,80,.22)" stroke="none"/>')
    for b in bl:
        x=px(b.x0); y=py(b.y1); w=(b.x1-b.x0)*s; h=(b.y1-b.y0)*s
        o.append(f'<rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" fill="{FILL[b.t]}" stroke="#111" stroke-width="1" opacity=".92"/>')
        cx=x+w/2; cy=y+h/2
        o.append(f'<text x="{cx:.1f}" y="{cy-2:.1f}" text-anchor="middle" class="b">{b.n}</text>')
        o.append(f'<text x="{cx:.1f}" y="{cy+9:.1f}" text-anchor="middle" class="b">{es(b.A)} m²</text>')
    for g in groups_of(bl):
        pts=[c for b in g for c in b.corners()]
        (cc,r)=mec(pts)
        ok=2*r<=42.5+1e-6
        col='#2e7d32' if ok else '#c62828'
        o.append(f'<circle cx="{px(cc[0]):.1f}" cy="{py(cc[1]):.1f}" r="{r*s:.1f}" fill="none" stroke="{col}" stroke-width="1.1" stroke-dasharray="5 3"/>')
        o.append(f'<text x="{px(cc[0]):.1f}" y="{py(cc[1]-r)+12:.1f}" text-anchor="middle" class="b" fill="{col}">Ø {2*r:.1f} m</text>')
    nx=px(0)+62
    o.append(f'<line x1="{nx:.1f}" y1="{oy+44}" x2="{nx:.1f}" y2="{oy+14}" stroke="#111" stroke-width="2"/><polygon points="{nx:.1f},{oy+8} {nx-5:.1f},{oy+18} {nx+5:.1f},{oy+18}" fill="#111"/><text x="{nx:.1f}" y="{oy+6}" text-anchor="middle" class="t">N</text>')
    o.append(f'<line x1="{px(-47.3):.1f}" y1="{py(0)+16:.1f}" x2="{px(-37.3):.1f}" y2="{py(0)+16:.1f}" stroke="#111" stroke-width="2"/><text x="{px(-37.3)+4:.1f}" y="{py(0)+20:.1f}" class="t">10 m</text>')
    o.append('</svg>')
    return ''.join(o)
def sun_chart():
    w,h=640,300; L,R,T,B=44,16,16,40
    X=lambda hh: L+(hh-6)/14*(w-L-R)
    Y=lambda a: T+(1-a/90)*(h-T-B)
    o=[f'<svg viewBox="0 0 {w} {h}" class="chart" role="img" aria-label="Altura solar por hora">']
    for a in range(0,91,15):
        o.append(f'<line x1="{L}" y1="{Y(a):.1f}" x2="{w-R}" y2="{Y(a):.1f}" stroke="#ddd"/><text x="{L-6}" y="{Y(a)+4:.1f}" text-anchor="end" class="t">{a}°</text>')
    for hh in range(6,21,2):
        o.append(f'<text x="{X(hh):.1f}" y="{h-18}" text-anchor="middle" class="t">{hh}:00</text>')
    cols={'Invierno (21 jun)':'#2c5d8f','Equinoccio (22 set)':'#b5833a','Verano (21 dic)':'#c0392b'}
    for name,doy in DATES.items():
        pts=[]
        for i in range(0,169):
            hh=6+i/12; alt,az=sun(doy,hh)
            if alt>0: pts.append(f"{X(hh):.1f},{Y(math.degrees(alt)):.1f}")
        o.append(f'<polyline points="{" ".join(pts)}" fill="none" stroke="{cols[name]}" stroke-width="2.2"/>')
    lx=L+10
    for i,(name,c) in enumerate(cols.items()):
        o.append(f'<line x1="{lx+i*190}" y1="{h-6}" x2="{lx+i*190+18}" y2="{h-6}" stroke="{c}" stroke-width="3"/><text x="{lx+i*190+24}" y="{h-2}" class="t">{name}</text>')
    o.append('</svg>')
    return ''.join(o)
def sec_block_svg():
    k=12; w=12.5*k; g=150; e=g-6.0*k; r=g-9.65*k; x0=50
    return f'''<svg viewBox="0 0 320 190" class="sec" role="img" aria-label="Sección pórtico a dos aguas">
<line x1="20" y1="{g}" x2="{w+100}" y2="{g}" stroke="#333" stroke-width="2"/>
<polyline points="{x0},{g} {x0},{e:.1f} {x0+w/2:.1f},{r:.1f} {x0+w},{e:.1f} {x0+w},{g}" fill="none" stroke="#2b3a4a" stroke-width="3"/>
<line x1="{x0}" y1="{e:.1f}" x2="{x0+w}" y2="{e:.1f}" stroke="#b58b5c" stroke-width="2" stroke-dasharray="4 2"/>
<text x="{x0+w+8}" y="{e+4:.1f}" class="t">alero 6,00 m</text>
<text x="{x0+w/2+8:.1f}" y="{r-6:.1f}" class="t">cumbrera 9,65 m</text>
<text x="{x0}" y="{g+16}" class="t">luz 12,50 m · pórtico de acero</text>
</svg>'''
def sec_gallery_svg():
    k=12; w=8*k; g=150; hi=g-4.5*k; lo=g-3.6*k; x0=60
    return f'''<svg viewBox="0 0 320 180" class="sec" role="img" aria-label="Sección galería a un agua">
<line x1="20" y1="{g}" x2="{w+180}" y2="{g}" stroke="#333" stroke-width="2"/>
<rect x="20" y="{hi-40:.1f}" width="30" height="{g-hi+40:.1f}" fill="#7f93a8" opacity=".5"/><text x="20" y="{hi-46:.1f}" class="t">consultorios</text>
<polyline points="{x0},{g} {x0},{hi:.1f} {x0+w},{lo:.1f} {x0+w},{g}" fill="none" stroke="#2b3a4a" stroke-width="3"/>
<line x1="{x0}" y1="{hi:.1f}" x2="{x0+w}" y2="{lo:.1f}" stroke="#d5dde4" stroke-width="5" opacity=".9"/>
<text x="{x0+w+8}" y="{lo+4:.1f}" class="t">bajo 3,60 m (hipótesis)</text>
<text x="{x0}" y="{hi-8:.1f}" class="t">alto 4,50 m (modelo)</text>
<text x="{x0}" y="{g+16}" class="t">galería a un agua</text>
</svg>'''
def sec_e1_svg():
    k=12; x0=40; ymin=22; ymax=60
    X=lambda Y: x0+(Y-ymin)*k
    g=150; hgt=6.0*k
    L=6.0/math.tan(sun(172,12.67)[0])
    sh_end=42.5-L
    ray_end_x=X(sh_end); ray_end_y=g
    sum_=math.radians(78.5)
    return f'''<svg viewBox="0 0 {(ymax-ymin)*k+120} 200" class="sec" style="max-width:640px" role="img" aria-label="Corte norte sur esquema U con parque">
<line x1="{x0-10}" y1="{g}" x2="{X(ymax)+10}" y2="{g}" stroke="#333" stroke-width="2"/>
<rect x="{X(42.5):.1f}" y="{g-hgt:.1f}" width="{13*k}" height="{hgt:.1f}" fill="#7f93a8" stroke="#111"/>
<polygon points="{X(42.5):.1f},{g-hgt:.1f} {X(49):.1f},{g-hgt-3.65*k:.1f} {X(55.5):.1f},{g-hgt:.1f}" fill="#4a5a6b"/>
<rect x="{X(4.5)+0:.1f}" y="{g-1}" width="0" height="0"/>
<rect x="{X(sh_end):.1f}" y="{g}" width="{(42.5-sh_end)*k:.1f}" height="3" fill="#40506a" opacity=".5"/>
<line x1="{X(42.5):.1f}" y1="{g-hgt:.1f}" x2="{ray_end_x:.1f}" y2="{g}" stroke="#e0b030" stroke-width="2" stroke-dasharray="6 4"/>
<text x="{X(36):.1f}" y="{g+18}" text-anchor="middle" class="t">sombra invierno mediodía ≈ {L:.1f} m</text>
<text x="{X(49):.1f}" y="{g-hgt-3.65*k-8:.1f}" text-anchor="middle" class="t">bloque norte (10596)</text>
<text x="{X(28):.1f}" y="{g-14}" text-anchor="middle" class="t">parque / espacio libre (10597)</text>
<text x="{x0-10}" y="{g+36}" class="t">corte norte-sur por el bloque norte · sol de invierno 31,6°</text>
</svg>'''
def wind_svg():
    cx,cy,R=110,110,90
    o=[f'<svg viewBox="0 0 220 220" class="rose" role="img" aria-label="Rosa de vientos de referencia">']
    o.append(f'<circle cx="{cx}" cy="{cy}" r="{R}" fill="none" stroke="#bbb"/>')
    for lab,ang in (('N',0),('E',90),('S',180),('O',270)):
        x=cx+(R+12)*math.sin(math.radians(ang)); y=cy-(R+12)*math.cos(math.radians(ang))+4
        o.append(f'<text x="{x:.1f}" y="{y:.1f}" text-anchor="middle" class="t b">{lab}</text>')
    arrows=[('verano NE',45,70,'#c0392b'),('invierno O',270,55,'#2c5d8f'),('tormentas SO',225,50,'#555')]
    for lab,ang,L,c in arrows:
        x2=cx+L*math.sin(math.radians(ang)); y2=cy-L*math.cos(math.radians(ang))
        o.append(f'<line x1="{cx}" y1="{cy}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{c}" stroke-width="5" stroke-linecap="round" opacity=".85"/>')
    o.append('</svg>')
    return ''.join(o)

# ---------- datos ----------
ORDER=['E1','E2','E3','E4','E5']
M_={k:metrics(k) for k in ORDER}
def sv(k,sname,clock,key): return M_[k]['sol'][(sname,clock)][key]
WIN='Invierno (21 jun)'; EQ='Equinoccio (22 set)'; VER='Verano (21 dic)'
def perim(k):
    return sum(2*((b.x1-b.x0)+(b.y1-b.y0)) for b in SCH[k]['B'] if b.t!='g')
def sumtabla_sol(key):
    rows=[('Invierno, 9:00',WIN,9.0),('Invierno, 12:40',WIN,12.67),('Invierno, 16:00',WIN,16.0),('Equinoccio, 12:40',EQ,12.67),('Verano, 12:40',VER,12.67)]
    head='<tr><th>Momento</th>'+''.join(f'<th>{k}</th>' for k in ORDER)+'</tr>'
    body=''
    for lab,sn,cl in rows:
        body+=f'<tr><td>{lab}</td>'+''.join(f'<td>{pc(sv(k,sn,cl,key))}</td>' for k in ORDER)+'</tr>'
    return f'<table class="grid"><thead>{head}</thead><tbody>{body}</tbody></table>'

sr=[(n,sunrise_set(d)) for n,d in DATES.items()]
sunrows=''.join(f'<tr><td>{n}</td><td>{hm(a)}</td><td>{hm(b)}</td></tr>' for n,(a,b) in sr)
alt_w=math.degrees(sun(172,12.67)[0]); alt_v=math.degrees(sun(355,12.67)[0])

NAMES={'E1':'U abierta a la avenida','E2':'U abierta al fondo','E3':'L','E4':'Tres piezas independientes','E5':'Dos naves con galería a un agua'}
DESC={
'E1':'Naves en los padrones norte y sur; el padrón central queda como parque. Las naves quedan abiertas hacia la avenida. El patio central se abre al noreste, la dirección dominante de verano según las fuentes consultadas.',
'E2':'Bloque comercial frente a la avenida en el centro, y dos naves laterales que abrazan el patio hacia el fondo. El patio queda expuesto al oeste, así que necesita protección.',
'E3':'Pieza comercial en L (frente a la avenida y ala hacia el interior del lote) más consultorios al norte. La L es un solo bloque, por eso su círculo es el más ajustado.',
'E4':'Una pieza por padrón, cada una con su acceso y su estacionamiento. Es la única opción que cumple sin unificar, si el FOS se calcula por padrón.',
'E5':'Nave comercial frente a la avenida y consultorios al fondo norte, unidos por una galería a un agua entre ambos. Si la normativa considera la galería como conexión, el conjunto supera el círculo de 42,5 m.'}

def plan_block(k):
    m=M_[k]
    fl=m['fos_lote']
    fl_txt=' · '.join(f"{lot} {es(v[0])}/{es(v[1])} m²" for lot,v in fl.items())
    cruza=', '.join(m['cruza']) if m['cruza'] else 'ninguno'
    conect=' + '.join(m['bloques_conectados'][0]) if m['bloques_conectados'] else 'no hay'
    circ=' · '.join(f"{'+'.join(c['n'])}: Ø {c['r']} m {'✓' if c['ok'] else '✗'}" for c in m['circ'])
    return f'''<section class="esq" id="{k.lower()}">
<h3>{k} · {NAMES[k]}</h3>
<p>{DESC[k]}</p>
<div class="fig">{plan_svg(k)}</div>
<div class="kv">
<div><span>Superficie cubierta (FOS)</span><b>{es(m['fp'])} m² · {m['fos_total']} %</b></div>
<div><span>Espacio libre (parque, patios, accesos)</span><b>{es(m['jardin'])} m² · {round(m['jardin']/3050*100)} %</b></div>
<div><span>Locales comerciales estimados</span><b>{m['loc']} (+ {m['plazas']-m['loc']} plazas de consultorio)</b></div>
<div><span>Plazas de estacionamiento (indicativo)</span><b>{m['plazas']}</b></div>
<div><span>FOS por padrón (superficie / 25 %)</span><b>{fl_txt}</b></div>
<div><span>Bloques que cruzan padrones</span><b>{cruza}</b></div>
<div><span>Círculos normativos Ø 42,5 m</span><b>{circ}</b></div>
<div><span>Bloques conectados</span><b>{conect}</b></div>
</div></section>'''

PLANS=''.join(plan_block(k) for k in ORDER)

COMP=[
('Cumplimiento normativo',None),
('Círculo Ø 42,5 m por bloque',['Cumple','Cumple','Cumple (L: Ø 40,7 m)','Cumple','No cumple si la galería cuenta como conexión (Ø 55,5 m)']),
('FOS 25 % por padrón, sin unificar',['No (10596: 351 m² vs 250)','No (10598 y 10596 superan)','No (cruza padrones)','Cumple (240/262, 234/250, 240/250)','No (cruza padrones)']),
('FOS 25 % sobre el total (3.050 m²)',[f"Cumple ({M_[k]['fos_total']} %)" for k in ORDER]),
('Espacio libre ≥ 60 % del total',[f"Cumple ({round(M_[k]['jardin']/3050*100)} %)" for k in ORDER]),
('Independencia de padrones',['Requiere unificar o ajustar 10596','Requiere unificar','Requiere unificar','Sí (acceso y estacionamiento propios)','Requiere unificar']),
('Espacio y uso',None),
('Locales comerciales estimados',[str(M_[k]['loc']) for k in ORDER]),
('Plazas (indicativo)',[str(M_[k]['plazas']) for k in ORDER]),
('Calidad espacial',['Parque central protagonista; locales con acceso desde la avenida y desde el parque','Patio abierto al fondo; locales más alejados de la avenida','Fachadas al estacionamiento; ala con sombra en la tarde de invierno','Tres patios chicos, sin conexión cubierta entre piezas','Galería cubierta entre dos naves; circulación protegida']),
('Bioclimático',None),
('Sol invierno 12:40 sobre el espacio libre',[pc(sv(k,WIN,12.67,'jardin')) for k in ORDER]),
('Sol invierno 16:00 dentro de la envolvente',[pc(sv(k,WIN,16.0,'interior')) for k in ORDER]),
('Sol verano 12:40 sobre el espacio libre',[pc(sv(k,VER,12.67,'jardin')) for k in ORDER]),
('Protección oeste (radiación de tarde)',['Media: bloque sur y norte protegen en parte','Baja: patio abierto al oeste','Media: ala protege, sombra fuerte a las 16:00 en invierno','Media: piezas separadas','Alta: galería y consultorios protegen el patio']),
('Ventilación cruzada desde el NE (verano)',['Alta: patio central abierto al frente','Media','Media','Media: entre piezas','Media: galería corta el paso']),
('Eficiencia energética',None),
('Perímetro de envolvente (proxy de pérdidas)',[f"{es(perim(k))} m" for k in ORDER]),
('Aislación y puentes térmicos',['Pocas juntas, PIR continuo','Más juntas en los patios','Más juntas en la L','Tres envolventes completas, más pérdidas','Juntas de la galería a cuidar']),
('Costo y constructibilidad',None),
('Costo relativo (hipótesis, no calculado en obra)',['Medio','Medio-alto','Medio-alto','Alto (tres envolventes, tres accesos)','Medio (galería y conexión)']),
('Luces y estructura',['Pórticos de 12,5 m, columnas en fachadas','Pórticos cortos en las naves, patio sin columnas','Dos cuerpos con juntas en la L','Tres estructuras independientes','Galería de un agua sobre pórticos cortos']),
('Facilidad de desagües',['Un solo faldón por nave, bajadas en el frente','Desagües hacia el patio, más recorrido','Cubierta en L, canaleta interna en la esquina','Tres sistemas de desagüe','Canaleta de la galería a resolver']),
]
def comp_table():
    head='<tr><th>Criterio</th>'+''.join(f'<th>{k}<br><small>{NAMES[k]}</small></th>' for k in ORDER)+'</tr>'
    rows=''
    for lab,vals in COMP:
        if vals is None:
            rows+=f'<tr class="grp"><td colspan="6">{lab}</td></tr>'
        else:
            rows+=f'<tr><td>{lab}</td>'+''.join(f'<td>{v}</td>' for v in vals)+'</tr>'
    return f'<div class="tw"><table class="grid comp"><thead>{head}</thead><tbody>{rows}</tbody></table></div>'

HTML=f'''<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Implantación · Pedragosa Sierra · padrones 10596, 10597, 10598</title>
<style>
:root{{--ink:#1d2630;--mut:#5b6670;--line:#dfe3e7;--acc:#2b3a4a;--bg:#fafaf7}}
*{{box-sizing:border-box}}
body{{margin:0;font:15px/1.55 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:var(--ink);background:var(--bg)}}
main{{max-width:1100px;margin:0 auto;padding:28px 20px 80px}}
h1{{font-size:26px;margin:0 0 4px;color:var(--acc)}}
h2{{font-size:20px;margin:44px 0 10px;padding-top:12px;border-top:2px solid var(--acc);color:var(--acc)}}
h3{{font-size:17px;margin:28px 0 6px}}
.sub{{color:var(--mut);margin:0 0 18px}}
.lead{{background:#fff;border:1px solid var(--line);border-radius:10px;padding:14px 18px}}
.lead li{{margin:4px 0}}
nav{{font-size:13px;margin:14px 0 6px}} nav a{{color:var(--acc);margin-right:12px}}
table{{border-collapse:collapse;width:100%}}
.grid th,.grid td{{border:1px solid var(--line);padding:6px 8px;text-align:left;vertical-align:top;font-size:13px}}
.grid th{{background:#eef1f4}}
.grid td:not(:first-child){{text-align:left}}
.grp td{{background:#e6ebf0;font-weight:600;color:var(--acc)}}
.tw{{overflow-x:auto}}
.comp{{min-width:900px}}
.fig{{background:#fff;border:1px solid var(--line);border-radius:10px;padding:10px;overflow:auto}}
svg.plan{{width:100%;max-width:520px;height:auto;display:block;margin:0 auto}}
svg.chart{{width:100%;max-width:640px;height:auto;display:block}}
svg.sec{{width:100%;max-width:420px;height:auto;display:block;background:#fff}}
svg.rose{{width:200px;height:200px}}
.t{{font-size:11px;fill:#333;font-family:inherit}} .t.g{{fill:#666}} .t.b{{font-size:10px;font-weight:600}}
svg text.b{{font-size:9px;fill:#111;font-family:inherit}}
.kv{{display:grid;grid-template-columns:1fr 1fr;gap:6px 14px;margin:10px 0 22px;font-size:13px}}
.kv div{{background:#fff;border:1px solid var(--line);border-radius:8px;padding:7px 10px}}
.kv span{{display:block;color:var(--mut);font-size:12px}}
.esq{{margin-bottom:10px}}
.cols{{display:grid;grid-template-columns:1fr 1fr;gap:16px}}
.card{{background:#fff;border:1px solid var(--line);border-radius:10px;padding:14px 16px}}
.hyp li,.nota li{{margin:4px 0}}
.rec{{background:#eef4f0;border:1px solid #bfd6c8;border-radius:10px;padding:14px 18px}}
small{{color:var(--mut)}}
@media (max-width:700px){{.kv,.cols{{grid-template-columns:1fr}}}}
</style></head><body><main>
<h1>Implantación · Av. Pedragosa Sierra, Punta del Este</h1>
<p class="sub">Padrones 10596 (1.000 m²), 10597 (1.000 m²) y 10598 (1.050 m²) · total 3.050 m² · cliente Juan Carlos García · director de obra Ramiro Portugau (SBU) · documento de trabajo, 14/11/2026</p>
<div class="lead">
<b>Resumen.</b>
<ul>
<li>Se dibujaron cinco esquemas de implantación sobre los tres padrones reales, con retiros, círculos normativos, estacionamiento indicativo, parque y sombras de invierno al mediodía.</li>
<li>Los cinco cumplen FOS y espacio libre sobre el total del predio. Solo <b>E4 (tres piezas)</b> cumple FOS padrón por padrón sin unificar. El resto necesita unificar, o reducir un bloque, si la consulta confirma esa lectura.</li>
<li>Para el sol de invierno, <b>E5</b> y <b>E1</b> son los mejores: el parque recibe 93 % y 85 % de sol al mediodía. E5 pierde por el círculo de 42,5 m si la galería cuenta como conexión.</li>
<li>Recomendación: <b>E1 (U abierta a la avenida)</b> como esquema principal, con la unificación de padrones como condición. <b>E4</b> queda como alternativa sin unificar. Detalle al final.</li>
</ul>
</div>
<nav><a href="#datos">Datos y supuestos</a><a href="#norma">Normativa</a><a href="#esquemas">Esquemas</a><a href="#sol">Sol</a><a href="#viento">Viento</a><a href="#cortes">Cortes de techo</a><a href="#matriz">Matriz</a><a href="#reco">Recomendación</a><a href="#hipo">Hipótesis</a></nav>

<h2 id="datos">1. Datos de partida y supuestos</h2>
<table class="grid"><thead><tr><th>Dato</th><th>Valor usado</th><th>Origen</th></tr></thead><tbody>
<tr><td>Superficies de padrón</td><td>10596: 1.000 m² · 10597: 1.000 m² · 10598: 1.050 m²</td><td>Cédulas catastrales (valor 2025)</td></tr>
<tr><td>Frente y fondo por padrón</td><td>≈ 20 m de frente y ≈ 47,3 m de fondo; frente total ≈ 60 m</td><td>Visor SNIG (medición sobre la avenida). Falta plano de mensura</td></tr>
<tr><td>Avenida y norte</td><td>Avenida al este (derecha del plano); norte arriba</td><td>Coordenadas del visor (−34,926 / −54,922) y hipótesis de norte arriba</td></tr>
<tr><td>Orden de los padrones</td><td>10598 al sur, 10597 al centro, 10596 al norte</td><td>Supuesto. No surge del catastro</td></tr>
<tr><td>Retiros</td><td>Frontal 10 m (ancho del modelo: hasta X = −10 m). Lateral y fondo: envolvente de 4 m a los costados y 10 m al fondo</td><td>Presentación de normativa. El fondo usa 10 m, más estricto que los 4 m citados</td></tr>
<tr><td>FOS / FOT / espacio libre</td><td>FOS 25 % (762 m²), FOT 100 %, espacio libre ≥ 60 % (1.830 m²)</td><td>Presentación de normativa (arts. 160 y 217)</td></tr>
<tr><td>Altura</td><td>Alero 6,00 m (sombras), cumbrera +3,65 m, galería 4,50 m</td><td>Hipótesis de diseño. Límite normativo 12 m</td></tr>
<tr><td>Estacionamiento</td><td>1 plaza por local y por consultorio; 27,5 m² por plaza con circulación, más 50 m² de maniobra</td><td>Art. 208 según la presentación. Módulo supuesto</td></tr>
</tbody></table>
<p><small>Nota: el área gráfica del SNIG (2.890 m²) no coincide con la catastral (3.050 m²). Antes de cerrar un esquema, hay que confirmar la superficie con mensura.</small></p>

<h2 id="norma">2. Normativa: lo expreso frente a lo que va a consulta previa</h2>
<div class="cols">
<div class="card"><b>Surge expresamente del material</b>
<ul>
<li>Círculo de 42,5 m: cada bloque debe quedar inscrito en ese diámetro (art. 207 b).</li>
<li>Bloques separados al menos 5 m (art. 205; 8 m de promedio).</li>
<li>Aleros o galerías de más de 0,90 m computan como superficie (art. 158).</li>
<li>Subsuelo no computa para FOT (art. 163). Un local, una plaza (art. 208).</li>
<li>Unificación de padrones posible (art. 6); excepción por Junta Departamental con 3/5 de votos (art. 21).</li>
</ul></div>
<div class="card"><b>Va a consulta previa</b>
<ul>
<li>Si la subzona 3.2.1 aplica a este predio.</li>
<li>Si una pérgola o galería que une dos bloques los convierte en un solo bloque (E5 y E3).</li>
<li>Si el FOS se calcula sobre el total unificado o por padrón (decide E1, E2, E3 y E5).</li>
<li>Si césped armado o techo enjardinado cuentan como espacio libre. "FOS verde" no está definido en el material: se trata como espacio libre hasta confirmar.</li>
<li>Clasificación de consultorios (grado de higiene) y si una planta baja más una planta es "bloque bajo".</li>
</ul></div>
</div>
<div class="card" style="margin-top:14px"><b>¿Pueden los tres padrones quedar independientes?</b>
<p>Sí, con E4: cada pieza tiene su acceso, su estacionamiento y sus instalaciones. Compartir circulaciones, servicios o galerías cambia el análisis:</p>
<ul>
<li><b>Galería o pérgola entre bloques:</b> los une en un solo bloque para el círculo de 42,5 m y puede llevar a unificar.</li>
<li><b>Acceso o estacionamiento compartido entre padrones:</b> necesita servidumbre de paso o unificación. La servidumbre no está verificada en el material.</li>
<li><b>Sanitaria y eléctrica compartidas:</b> cada padrón debe tener su conexión a red, o acordar servidumbres de instalación. Los pasos entre padrones son tema de consulta.</li>
</ul></div>

<h2 id="esquemas">3. Cinco esquemas de implantación</h2>
<p>Planos en norte arriba y avenida al este. Línea continua: bloques. Sombra violeta: sol de invierno a las 12:40, con el alero a 6 m. Círculos: verde si el bloque entra en Ø 42,5 m, rojo si no. Parque: lo que queda del lote libre. Plazas en el retiro frontal: indicativo.</p>
{PLANS}

<h2 id="sol">4. Sol: trayectoria, sombras y espacio libre</h2>
<p>Con latitud −34,93° y hora de Uruguay (UTC−3 sin horario de verano), el sol de mediodía en invierno está casi al norte, a {alt_w:.1f}° de altura. En verano llega a {alt_v:.1f}°. Esto define la regla del diseño: el bloque norte del lote proyecta sombra hacia el sur, sobre el parque, en invierno.</p>
<div class="fig">{sun_chart()}</div>
<table class="grid" style="max-width:520px;margin:10px 0 16px"><thead><tr><th>Fecha</th><th>Salida</th><th>Puesta</th></tr></thead><tbody>{sunrows}</tbody></table>
<h3>Sol sobre el espacio libre del lote</h3>
{sumtabla_sol('sol_jardin') if False else ''}
<p>Sol en el espacio libre del lote (fuera de las edificaciones):</p>
{sumtabla_sol('jardin')}
<p>Sol en el espacio libre dentro de la envolvente (patios y pasajes entre bloques):</p>
{sumtabla_sol('interior')}
<p><small>Lectura: en invierno el parque recibe la mayor parte del sol en E5 y E1, y en E2 el patio queda más sombreado. En verano casi todo el lote tiene sol, así que la protección solar de verano debe salir del diseño de cubiertas y aleros, no de la implantación.</small></p>

<h2 id="viento">5. Viento y ventilación</h2>
<p>Las fuentes consultadas no traen mediciones en el sitio. Describen patrones generales de la costa de Maldonado: el viento dominante cambia con la estación. Para el diseño se usa esta lectura, a confirmar con datos de la zona:</p>
<div class="cols">
<div>{wind_svg()}</div>
<div>
<table class="grid"><thead><tr><th>Estación</th><th>Dirección dominante</th><th>Implicación</th></tr></thead><tbody>
<tr><td>Verano</td><td>Noreste, lo que favorece la ventilación desde la avenida</td><td>Abrir el patio y los frentes al NE para ventilación cruzada, con sombra de cubierta y aleros</td></tr>
<tr><td>Invierno</td><td>Componente oeste; tormentas del sur y suroeste</td><td>Proteger el oeste y el sur con muro ciego, vegetación o cenefa, sin cerrar el patio al NE</td></tr>
<tr><td>Intermedias</td><td>Noreste, débil y variable</td><td>Ventilación natural suficiente con aberturas operables</td></tr>
<tr><td>Ráfagas y temporales</td><td>Sudoeste y sur en alertas meteorológicas</td><td>Anclajes de cubierta y chapa dimensionados para succión; bajadas protegidas</td></tr>
</tbody></table></div>
</div>
<p><small>Fuentes: Inumet y el Plan Nacional de Adaptación Costera (gub.uy), pronósticos de Windy y Windfinder y notas de prensa de Montevideo. Los pronósticos no son estadística de sitio: conviene medir o pedir un registro de la estación más cercana.</small></p>

<h2 id="cortes">6. Cortes de techo</h2>
<div class="cols">
<div class="card"><b>A · Bloque a dos aguas (base de E1, E3 y E4)</b>{sec_block_svg()}<p><small>Pórtico de 12,5 m (sistema B del análisis estructural anterior). Cumbrera paralela a la avenida. Faldones con volumen hacia afuera según la referencia nórdica.</small></p></div>
<div class="card"><b>B · Galería a un agua (E5)</b>{sec_gallery_svg()}<p><small>La galería no tiene cumbrera. Su canaleta va en el borde bajo y el agua baja hacia el frente, lejos de la fachada de la nave.</small></p></div>
</div>
<div class="card" style="margin-top:14px"><b>C · Corte norte-sur del E1: sombra de invierno sobre el parque</b>{sec_e1_svg()}<p><small>Con el sol de invierno a 31,6° al mediodía, el bloque norte (alero a 6 m) proyecta unos {6.0/math.tan(sun(172,12.67)[0]):.1f} m de sombra sobre el parque. El resto del parque queda con sol. En verano la sombra es de apenas 1,2 m.</small></p></div>

<h2 id="matriz">7. Matriz comparativa</h2>
<p>Las cifras de sol y superficies salen del modelo. Los criterios de costo, energía y constructibilidad son comparativos y cualitativos: no hay presupuesto por esquema.</p>
{comp_table()}

<h2 id="reco">8. Recomendación</h2>
<div class="rec">
<ol>
<li><b>Esquema principal: E1, U abierta a la avenida.</b> Es el mejor equilibrio entre sol de invierno en el parque (85 %), ventilación desde el NE de verano y espacio libre (2.250 m²). Cumple el círculo de 42,5 m en cada bloque. Su punto débil es el FOS por padrón: el bloque norte tiene 351 m² sobre 10596, que admite 250 m². Requiere unificar, o reducir 101 m² de ese bloque si la consulta lo exige.</li>
<li><b>Alternativa sin unificar: E4, tres piezas.</b> Es la única que cumple FOS por padrón sin cambios y con accesos independientes. Pierde calidad de patio y tiene más envolvente, lo que sube el costo y las pérdidas.</li>
<li><b>E5 solo si la galería no cuenta como conexión.</b> Es el mejor en sol de invierno (93 % al mediodía), pero hoy supera el círculo de 42,5 m si la galería une los bloques.</li>
<li><b>Descartar E2 y E3 como principales.</b> Los dos cruzan padrones y tienen patio o ala con sombra fuerte en la tarde de invierno.</li>
</ol>
<p><b>Próximos pasos:</b> confirmar con el arquitecto Pablo Alcoba o con la intendencia (consulta previa) los cinco puntos del apartado 2. Pedir plano de mensura con norte, frentes y fondos por padrón. Medir o pedir el viento de la estación más cercana. Después, pasar E1 a planta de anteproyecto con cortes y pórticos.</p>
</div>

<h2 id="hipo">9. Hipótesis y datos faltantes</h2>
<ul class="hyp">
<li>Norte arriba y avenida al este: lectura del visor SNIG, sin plano de mensura que lo confirme.</li>
<li>Orden de los padrones (10598 sur, 10597 centro, 10596 norte) y frentes de 20 m por padrón: supuestos.</li>
<li>Envolvente edificable X ∈ [−37, −10] m, Y ∈ [4, 56] m: más estricta que el retiro de fondo de 4 m citado en la presentación. Con 4 m de fondo, la envolvente crece 6 m hacia el fondo y las opciones E2 y E4 ganan espacio.</li>
<li>Alero a 6 m para sombras, cumbrera +3,65 m, galería 4,50 m: hipótesis de diseño, no de cálculo.</li>
<li>Sombras solo de los bloques propios. Edificios vecinos y el arbolado no están modelados.</li>
<li>Locales de 75 m² promedio y 27,5 m² por plaza: módulos supuestos.</li>
<li>Viento a partir de fuentes generales, no de medición en sitio.</li>
<li>Costos por esquema: no calculados. Solo se compara perímetro y complejidad.</li>
</ul>
<p><small>Datos faltantes: plano de mensura (norte, frentes, fondos, curvas de nivel), servidumbres de los padrones, datos de viento de la zona, criterio de FOS y de galerías de la intendencia.</small></p>
</main></body></html>'''
os.makedirs(os.path.dirname(OUT),exist_ok=True)
open(OUT,'w',encoding='utf-8').write(HTML)
print('ok',len(HTML))
