# Redibujo de la planta baja del anteproyecto (Juan Carlos García) a partir de fotos del plano impreso.
# Unidades: metros. x: desde el fondo (izquierda) hacia la calle (derecha). y: hacia abajo en la hoja.
# Las cotas legibles en las fotos se usan tal cual; las demás se estiman por proporción y se marcan con *.
import math, ezdxf, subprocess, os

OUT = os.path.dirname(os.path.abspath(__file__))
E = []   # elementos: (tipo, capa, datos)
def R(x0, y0, x1, y1, capa='MUROS', fill=None, st=None): E.append(('rect', capa, (x0, y0, x1, y1, fill, st)))
def L(x0, y0, x1, y1, capa='LINEAS', st=None): E.append(('line', capa, (x0, y0, x1, y1, st)))
def T(x, y, t, h=.35, capa='TEXTOS', rot=0, bold=False, col=None): E.append(('text', capa, (x, y, t, h, rot, bold, col)))
def C(x, y, r, capa='EQUIPAMIENTO'): E.append(('circ', capa, (x, y, r)))
def A(cx, cy, r, a0, a1, capa='ABERTURAS'): E.append(('arc', capa, (cx, cy, r, a0, a1)))
def D(x0, y0, x1, y1, off, txt=None, capa='COTAS', est=False):
    E.append(('dim', capa, (x0, y0, x1, y1, off, txt if txt else f"{math.hypot(x1-x0, y1-y0):.2f}".replace('.', ','), est)))

def puerta(x, y, w, eje, gira):   # eje 'h' (hoja sobre un muro horizontal) o 'v'; gira: +1/-1 hacia donde abre
    if eje == 'h':
        L(x, y, x, y + gira * w, 'ABERTURAS'); A(x, y, w, *( (0, 90) if gira > 0 else (270, 360) ))
    else:
        L(x, y, x + gira * w, y, 'ABERTURAS'); A(x, y, w, *( (0, 90) if gira > 0 else (90, 180) ))

e, ei = .20, .10
# ---------------- Local 1 · consultorios (20,44 × 11,47) ----------------
X0, X1, Y0, Y1 = 0, 20.44, 0, 11.47
for (a, b) in [(0, .2)]: pass
R(X0, Y0, X1, Y0 + e); R(X0, Y1 - e, X1, Y1); R(X0, Y0, X0 + e, Y1); R(X1 - e, Y0, X1, Y1)
# ventanas en el muro superior (lateral): una por consultorio
for (a, b) in [(1.6, 3.8), (6.3, 8.1), (10.3, 12.1), (14.3, 16.1)]:
    R(a, Y0, b, Y0 + e, 'ABERTURAS', '#ffffff', 'stroke:#2f6f86;stroke-width:.04'); L(a, Y0 + e / 2, b, Y0 + e / 2, 'ABERTURAS')
yA = .2 + 2.77   # fondo de la fila de consultorios
xs = [.2, 5.15, 5.25, 9.15, 9.25, 13.15, 13.25, 17.15, 17.25]
for x in [5.15, 9.15, 13.15, 17.15]: R(x, .2, x + ei, yA)
R(.2, yA, 5.15, yA + ei); R(5.25, yA, 17.15, yA + ei)
for (a, n, m2) in [(.2, 'CONSULTORIO', '13,71 m²'), (5.25, 'CONSULTORIO', '10,80 m²'), (9.25, 'CONSULTORIO', '10,80 m²'), (13.25, 'CONSULTORIO', '10,80 m²')]:
    b = a + (4.95 if a == .2 else 3.90); T((a + b) / 2, 1.45, n, .3, bold=True); T((a + b) / 2, 1.95, m2, .28)
for x in [4.0, 8.0, 12.0, 16.0]: puerta(x, yA + ei, .8, 'h', 1)
# columna izquierda
xL = 4.04
for (y0, y1) in [(3.07, 5.93), (6.03, 8.89)]: R(xL, y0, xL + ei, y1)
R(.2, 5.93, xL + ei, 6.03); R(.2, 8.89, 5.15, 8.99); R(5.15, 8.99, 5.25, Y1 - e)
T(2.1, 4.4, 'CONSULTORIO', .3, bold=True); T(2.1, 4.9, '11 m²', .28)
T(2.1, 7.3, 'CONSULTORIO', .3, bold=True); T(2.1, 7.8, '11 m²', .28)
T(2.7, 10.0, 'CONSULTORIO', .3, bold=True); T(2.7, 10.5, '11,70 m²', .28)
puerta(xL + ei, 4.9, .8, 'v', 1); puerta(xL + ei, 7.8, .8, 'v', 1); puerta(5.25, 9.4, .8, 'v', 1)
# sala de espera y bloque central (reunión + archivos), 7,96 × 3,30 a 1,22 del corredor
T(6.65, 6.2, 'SALA DE ESPERA', .32, bold=True); T(6.65, 6.75, 'Local N° 1 · consultorios · 222 m²', .26)
bx0, by0, bx1, by1 = 9.25, yA + ei + 1.22, 9.25 + 7.96, yA + ei + 1.22 + 3.30
R(bx0, by0, bx1, by0 + ei); R(bx0, by1 - ei, bx1, by1); R(bx0, by0, bx0 + ei, by1); R(14.45, by0, 14.55, by1); R(16.0, by0, 16.1, by1); R(bx1 - ei, by0, bx1, by1)
R(bx0, by0 + 1.3, 10.6, by0 + 1.4)
T(12.4, by0 + 1.6, 'SALA DE REUNIONES', .26, bold=True); T(15.27, by0 + 1.4, 'ARCHIVOS', .24, bold=True); T(15.27, by0 + 1.8, '4,98 m²', .22)
R(11.3, by0 + 1.2, 13.6, by0 + 2.2, 'EQUIPAMIENTO', 'none', 'stroke:#888;stroke-width:.03')
C(9.75, by0 + 2.6, .22); puerta(12.9, by1, .8, 'h', 1); puerta(14.6, by1, .7, 'h', 1)
T(18.75, 4.0, 'RECEPCIÓN', .32, bold=True)
# fila inferior: sanitarios 9,20 m² × 2 y 2 baños accesibles
yB = Y1 - e - 2.40
R(5.25, yB, 16.6, yB + ei)
for (a, b, n) in [(5.25, 9.25, 'SSHH'), (9.25, 13.25, 'SSHH')]:
    R(b, yB, b + ei, Y1 - e); R(a + .2, yB + 1.2, a + 1.6, yB + 1.3); C(a + .6, yB + .6, .22); C(a + .6, yB + 1.8, .22)
    T((a + b) / 2 + .6, yB + 1.0, n, .28, bold=True); T((a + b) / 2 + .6, yB + 1.45, '9,20 m²', .24)
    for k in range(2): C(b - 1.1 + k * .55, Y1 - e - .3, .14)
    puerta(a + 2.2, yB, .8, 'h', -1)
for (a, b) in [(13.35, 14.95), (15.05, 16.6)]:
    R(b, yB, b + ei, Y1 - e); C(a + .5, Y1 - e - .5, .24); C(b - .4, yB + .7, .2); T((a + b) / 2, yB + 1.3, 'baño acc.', .2)
    puerta(a + .2, yB, .8, 'h', -1)
# escalera en recepción (17 escalones de 27 × 18)
sx0, sx1, sy0 = 17.45, 20.05, 7.6
R(sx0, sy0, sx1, Y1 - e, 'EQUIPAMIENTO', 'none', 'stroke:#555;stroke-width:.03')
for k in range(1, 13): L(sx0, sy0 + k * .27, sx1, sy0 + k * .27, 'EQUIPAMIENTO')
L((sx0 + sx1) / 2, sy0, (sx0 + sx1) / 2, Y1 - e, 'EQUIPAMIENTO'); T(18.75, sy0 - .25, 'Escalera 17 esc. 27×18', .22)
puerta(X1, 2.0, 1.0, 'v', -1)
# ---------------- Locales 2 a 7 ----------------
LX0, LX1 = X1 - 15.10, X1        # 5,34 → 20,44 (exterior 15,10 · interior 14,70)
loc = [('2', 74.42), ('3', 74.42), ('4', 74.42), ('5', 84.30), ('6', 74.42), ('7', 157.60)]
y = Y1
anchos = [5.44] * 5 + [11.08]
R(LX0, Y1, LX0 + e, Y1 + sum(anchos) + 5 * e + e); R(LX1 - e, Y1, LX1, Y1 + sum(anchos) + 5 * e + e)
bandas = []
for i, ((n, m2), w) in enumerate(zip(loc, anchos)):
    y0, y1 = y, y + w; bandas.append((n, y0, y1)); T((LX0 + LX1) / 2 + 1.5, (y0 + y1) / 2 - .15 + (0 if i < 5 else -2), f'Local N° {n}', .34, bold=True); T((LX0 + LX1) / 2 + 1.5, (y0 + y1) / 2 + .35 + (0 if i < 5 else -2), f'Sup. PB {m2:.2f} m²'.replace('.', ','), .26)
    y = y1 + (e if i < 5 else 0)
    if i < 5: R(LX0, y1, LX1, y1 + e)
yEnd = y; R(LX0, yEnd, LX1, yEnd + e)
# vidriera a la calle (derecha) con puerta, y puerta de fondo (izquierda) en cada local
for (n, y0, y1) in bandas:
    R(LX1 - e, y0 + .3, LX1, y1 - .3, 'ABERTURAS', '#ffffff', 'stroke:#2f6f86;stroke-width:.04'); L(LX1 - e / 2, y0 + .3, LX1 - e / 2, y1 - .3, 'ABERTURAS')
    puerta(LX1 - e, y1 - .4 - 1.0, 1.0, 'v', -1)
    R(LX0, y0 + .3, LX0 + e, y0 + 1.2, 'ABERTURAS', '#ffffff', 'stroke:#555;stroke-width:.03'); puerta(LX0 + e, y0 + .3, .9, 'v', 1)
# núcleos húmedos y escaleras compartidos entre 2|3, 4|5 y 6|7
for k in [0, 2, 4]:
    yw = bandas[k][2]        # cara superior del muro divisorio
    xb = LX0 + e + 4.43       # baños a 4,43 de la cara interior del fondo
    for s, ym in [(-1, yw), (1, yw + e)]:
        yf = ym + s * 1.30
        R(xb, min(ym, yf), xb + ei, max(ym, yf)); R(xb + 2.10, min(ym, yf), xb + 2.20, max(ym, yf)); R(xb, yf - (ei if s > 0 else 0), xb + 1.45, yf + (0 if s > 0 else ei))
        C(xb + .55, ym + s * .65, .2); C(xb + 1.6, ym + s * .65, .17)
        x0s, x1s = xb + 2.2, xb + 2.2 + 17 * .27
        R(x0s, min(ym, ym + s * 1.2), x1s, max(ym, ym + s * 1.2), 'EQUIPAMIENTO', 'none', 'stroke:#555;stroke-width:.03')
        for j in range(1, 17): L(x0s + j * .27, ym, x0s + j * .27, ym + s * 1.2, 'EQUIPAMIENTO')
        L(x1s - 1.4, ym + s * 1.2, x1s - .4, ym, 'EQUIPAMIENTO'); T(x0s + 2.3, ym + s * 1.45 + (.1 if s > 0 else 0), 'Escalera 17 esc. 27×18', .2)
    D(LX0 + e, yw - 1.6, xb, yw - 1.6, 0, '4,43')
# galería / alero de 1,20 sobre la calle
R(X1, 0, X1 + 1.2, yEnd + e, 'GALERIA', 'none', 'stroke:#888;stroke-width:.03;stroke-dasharray:.3 .2')
T(X1 + .6, 30, 'galería 1,20', .26, rot=90)
# ---------------- Estacionamientos ----------------
for k in range(16):
    y0 = Y1 + .2 + k * 2.5; R(-9.7, y0, -4.7, y0 + 2.5, 'ESTACIONAMIENTO', 'none', 'stroke:#777;stroke-width:.03'); T(-7.2, y0 + 1.4, f'{k + 1}', .3, col='#777')
T(-7.2, Y1 - .6, '16 estacionamientos 2,50 × 5,00 *', .3, bold=True)
yc = 34.0; T(26.5, yc - .6, 'ESTACIONAMIENTO DE CORTESÍA', .28, bold=True)
for nm, h in [('área descanso', 1.2), ('E TIPO A', 3.7), ('área descanso', 1.2), ('E TIPO A', 3.7), ('área descanso', 1.2), ('E TIPO A', 3.7), ('', 2.5)]:
    R(24.0, yc, 29.0, yc + h, 'ESTACIONAMIENTO', '#eeeeee' if 'desc' in nm else 'none', 'stroke:#777;stroke-width:.03;' + ('stroke-dasharray:.2 .15' if 'desc' in nm else '')); T(26.5, yc + h / 2 + .12, nm or 'auto', .3 if 'E' in nm else .22); yc += h
D(29.3, 34.0, 29.3, yc, .4, '17,29')
# ---------------- Terreno y retiros (aproximado) ----------------
LT = (-14.0, -3.0, 36.04, 56.0)
R(*LT, 'TERRENO', 'none', 'stroke:#333;stroke-width:.06;stroke-dasharray:1 .3 .1 .3')
L(29.4, -3.0, 29.4, 56.0, 'RETIROS', 'stroke:#b5622a;stroke-width:.04;stroke-dasharray:.5 .3'); T(29.0, 12, 'Línea de retiro frontal *', .3, rot=90, col='#b5622a')
L(-10.0, -3.0, -10.0, 56.0, 'RETIROS', 'stroke:#b5622a;stroke-width:.04;stroke-dasharray:.5 .3'); T(-10.35, 30, 'retiro de fondo 4,00 *', .26, rot=90, col='#b5622a')
T(31.2, 26, 'CALLE / FRENTE  →', .4, rot=90, bold=True, col='#2f6f86')
T(11.0, -3.6, '50,04 (profundidad del terreno según plano)', .3)
L(-14.0, -3.3, 36.04, -3.3, 'COTAS')
# ---------------- Cotas principales ----------------
D(0, -1.2, 20.44, -1.2, 0, '20,44')
acc = 0
for w in [.2, 4.95, .1, 3.90, .1, 3.90, .1, 3.90, .1, 2.99]:
    D(acc, -.5, acc + w, -.5, 0, f'{w:.2f}'.replace('.', ',') if w > .5 else ''); acc += w
D(-1.0, 0, -1.0, 11.47, 0, '11,47')
yy = Y1
for i, w in enumerate(anchos):
    D(LX0 - .5, yy, LX0 - .5, yy + w, 0, f'{w:.2f}'.replace('.', ',')); yy += w + e
D(-2.0, 0, -2.0, 39.47, 0, '39,47'); D(-2.0, 39.67, -2.0, 39.67 + 11.08, 0, '11,08')
D(LX0, yEnd + 1.0, LX1, yEnd + 1.0, 0, '15,10'); D(LX0 + e, yEnd + .5, LX1 - e, yEnd + .5, 0, '14,70'); D(0, Y1 + .4, LX0, Y1 + .4, 0, '5,34')
D(X1, yEnd + 1.0, X1 + 1.2, yEnd + 1.0, 0, '1,20')

# ================= SVG =================
def svg(path):
    minx, miny, maxx, maxy = -15.5, -6.5, 38.5, 60.5
    W, H = maxx - minx, maxy - miny
    s = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{minx} {miny} {W} {H + 6}" width="420mm" height="{420 * (H + 6) / W:.0f}mm" font-family="Inter,Arial,sans-serif">',
         f'<rect x="{minx}" y="{miny}" width="{W}" height="{H + 6}" fill="#fff"/>']
    for tp, capa, d in E:
        if tp == 'rect':
            x0, y0, x1, y1, fill, st = d
            if capa == 'MUROS' and fill is None: fill = '#3a3632'
            s.append(f'<rect x="{min(x0,x1):.3f}" y="{min(y0,y1):.3f}" width="{abs(x1-x0):.3f}" height="{abs(y1-y0):.3f}" fill="{fill or "none"}" style="{st or ""}"/>')
        elif tp == 'line':
            x0, y0, x1, y1, st = d; s.append(f'<line x1="{x0:.3f}" y1="{y0:.3f}" x2="{x1:.3f}" y2="{y1:.3f}" style="{st or "stroke:#555;stroke-width:.03"}"/>')
        elif tp == 'circ':
            x, y, r = d; s.append(f'<circle cx="{x}" cy="{y}" r="{r}" fill="none" stroke="#555" stroke-width=".03"/>')
        elif tp == 'arc':
            cx, cy, r, a0, a1 = d; p0 = (cx + r * math.cos(math.radians(a0)), cy + r * math.sin(math.radians(a0))); p1 = (cx + r * math.cos(math.radians(a1)), cy + r * math.sin(math.radians(a1)))
            s.append(f'<path d="M{p0[0]:.3f} {p0[1]:.3f}A{r} {r} 0 0 1 {p1[0]:.3f} {p1[1]:.3f}" fill="none" stroke="#777" stroke-width=".025"/>')
        elif tp == 'text':
            x, y, t, h, rot, bold, col = d
            s.append(f'<text x="{x}" y="{y}" font-size="{h}" text-anchor="middle" {"font-weight=\"700\"" if bold else ""} fill="{col or "#222"}" {f"transform=\"rotate({-rot} {x} {y})\"" if rot else ""}>{t}</text>')
        elif tp == 'dim':
            x0, y0, x1, y1, off, txt, est = d; col = '#b5622a' if est else '#444'
            s.append(f'<line x1="{x0}" y1="{y0}" x2="{x1}" y2="{y1}" stroke="{col}" stroke-width=".02"/>')
            for (px, py) in [(x0, y0), (x1, y1)]: s.append(f'<line x1="{px - .12}" y1="{py + .12}" x2="{px + .12}" y2="{py - .12}" stroke="{col}" stroke-width=".04"/>')
            if txt:
                mx, my = (x0 + x1) / 2, (y0 + y1) / 2; vert = abs(x1 - x0) < 1e-6
                s.append(f'<text x="{mx - (.15 if vert else 0)}" y="{my - (0 if vert else .12)}" font-size=".3" text-anchor="middle" fill="{col}" {f"transform=\"rotate(-90 {mx - .15} {my})\"" if vert else ""}>{txt}</text>')
    # rótulo
    by = maxy + .3
    s.append(f'<rect x="{minx + .5}" y="{by}" width="{W - 1}" height="5.2" fill="#f6f2ec" stroke="#b5622a" stroke-width=".05"/>')
    s.append(f'<text x="{minx + 1.2}" y="{by + 1.3}" font-size=".45" fill="#b5622a" font-weight="700" letter-spacing=".15">SMART BUILDING URUGUAY</text>')
    s.append(f'<text x="{minx + 1.2}" y="{by + 2.5}" font-size="1.0" font-weight="800">Planta baja · redibujo del anteproyecto</text>')
    s.append(f'<text x="{minx + 1.2}" y="{by + 3.4}" font-size=".42" fill="#444">Locales y consultorios · cliente Juan Carlos García · Punta del Este · escala 1:200 en A3</text>')
    s.append(f'<text x="{minx + 1.2}" y="{by + 4.3}" font-size=".38" fill="#b5622a">Redibujado desde fotos del plano impreso. Cotas en negro: leídas del plano. Cotas y elementos marcados con *: estimados por proporción, a verificar con el original.</text>')
    s.append(f'<text x="{maxx - 1.2}" y="{by + 1.4}" font-size=".38" text-anchor="end">Áreas del plano original</text>')
    for i, t in enumerate(['Consultorios · PB 199,03 m² · PA 234,54 m²', 'Locales · PB 562,95 m² · PA 596 m²', 'Total · PB 761,98 m² · PA 830,54 m² · 1.592,52 m²']):
        s.append(f'<text x="{maxx - 1.2}" y="{by + 2.2 + i * .65}" font-size=".38" text-anchor="end" {"font-weight=\"700\"" if i == 2 else ""}>{t}</text>')
    s.append(f'<text x="{maxx - 1.2}" y="{by + 4.6}" font-size=".32" text-anchor="end" fill="#777">SBU · Ramiro Portugau, director de obra · 098 526 226</text>')
    s.append('</svg>')
    open(path, 'w').write('\n'.join(s))

# ================= DXF =================
def dxf(path):
    doc = ezdxf.new('R2010', setup=True); doc.units = ezdxf.units.M; msp = doc.modelspace()
    cols = {'MUROS': 7, 'ABERTURAS': 5, 'EQUIPAMIENTO': 8, 'TEXTOS': 7, 'COTAS': 1, 'ESTACIONAMIENTO': 8, 'TERRENO': 3, 'RETIROS': 30, 'GALERIA': 8, 'LINEAS': 8}
    for n, c in cols.items(): doc.layers.add(n, color=c)
    f = lambda x, y: (x, -y)
    for tp, capa, d in E:
        if tp == 'rect':
            x0, y0, x1, y1, fill, st = d; pts = [f(x0, y0), f(x1, y0), f(x1, y1), f(x0, y1)]
            msp.add_lwpolyline(pts, close=True, dxfattribs={'layer': capa})
            if capa == 'MUROS': h = msp.add_hatch(color=7, dxfattribs={'layer': capa}); h.paths.add_polyline_path(pts, is_closed=True)
        elif tp == 'line': x0, y0, x1, y1, st = d; msp.add_line(f(x0, y0), f(x1, y1), dxfattribs={'layer': capa})
        elif tp == 'circ': x, y, r = d; msp.add_circle(f(x, y), r, dxfattribs={'layer': capa})
        elif tp == 'arc': cx, cy, r, a0, a1 = d; msp.add_arc(f(cx, cy), r, -a1, -a0, dxfattribs={'layer': capa})
        elif tp == 'text':
            x, y, t, h, rot, bold, col = d; msp.add_text(t.replace('²', '2'), height=h * .8, rotation=rot, dxfattribs={'layer': capa}).set_placement(f(x, y), align=ezdxf.enums.TextEntityAlignment.BOTTOM_CENTER)
        elif tp == 'dim':
            x0, y0, x1, y1, off, txt, est = d
            msp.add_line(f(x0, y0), f(x1, y1), dxfattribs={'layer': capa})
            if txt:
                vert = abs(x1 - x0) < 1e-6; mx, my = (x0 + x1) / 2, (y0 + y1) / 2
                msp.add_text(txt, height=.25, rotation=90 if vert else 0, dxfattribs={'layer': capa}).set_placement(f(mx - (.12 if vert else 0), my - (0 if vert else .1)), align=ezdxf.enums.TextEntityAlignment.BOTTOM_CENTER)
    doc.saveas(path)

svg(os.path.join(OUT, 'JCG-planta-baja-redibujo.svg'))
dxf(os.path.join(OUT, 'JCG-planta-baja-redibujo.dxf'))
subprocess.run(['rsvg-convert', '-f', 'pdf', '-o', os.path.join(OUT, 'JCG-planta-baja-redibujo.pdf'), os.path.join(OUT, 'JCG-planta-baja-redibujo.svg')], check=True)
subprocess.run(['rsvg-convert', '-w', '1600', '-o', '/tmp/jc/red.png', os.path.join(OUT, 'JCG-planta-baja-redibujo.svg')], check=True)
print('ok', len(E))
