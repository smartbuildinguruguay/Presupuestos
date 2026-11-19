"""Cimentación, envolvente y cantidades de la nave, con las medidas de los dibujos del dueño.

Fuente de medidas (medidas a escala sobre los dibujos, ver README):
  - ancho exterior 12,10 m (acotado en tres_naves_v2)
  - largo exterior 22,5 m; 5 pórticos a 5,12 m (4 vanos = 20,48 m)
  - distancia entre líneas de columnas 10,96 m
  - dados 0,70 × 0,70 m, 2 por pórtico (10 por nave)
  - alero ≈ 5,7 m, cumbrera ≈ 6,9 m (aproximado)
  - platea 0,15 m; riostres transversales, uno por pórtico
  - fachadas laterales: 98,10 m² netos cada una (fachadas_revestimientos.pdf)
Uso: python3 computo/scripts/calc_nave.py
"""
import json, math, pathlib
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle
from matplotlib.backends.backend_pdf import PdfPages

RAIZ = pathlib.Path(__file__).resolve().parents[2]
NAVES = 3

# geometría
W_EXT = 12.10            # ancho exterior
L_EXT = 22.50            # largo exterior
PITCH = 5.12             # separación entre pórticos
LC = [round(i * PITCH, 2) for i in range(5)]   # 5 pórticos
W_COL = 10.96            # distancia entre líneas de columnas
ALERO, CUMB = 5.70, 6.90
SLOPE = math.hypot(W_EXT / 2, CUMB - ALERO)    # faldón (m)

# cimentación
DADO = (0.70, 0.70, 0.55)
RIO = (0.40, 0.40)
PLAT_E = 0.15
PLAT_MARGEN = 0.35       # vuelo de la platea alrededor de la nave exterior
PLAT_L = L_EXT + 2 * PLAT_MARGEN
PLAT_W = W_EXT + 2 * PLAT_MARGEN
PLAT_AREA = PLAT_L * PLAT_W
KG = {6: 0.222, 8: 0.395, 12: 0.888}

# envolvente
LAT_NETO = 98.10         # fachadas A y B, neto de revestimiento (dibujo del dueño)
VIDRIO_FRENTE = 47.25    # pendiente de medir en fachada del dueño (valor anterior)
GABLE_BRUTO = W_EXT * ALERO + W_EXT * (CUMB - ALERO) / 2

errores = []
def step(n, t): print(f'\n[{n}] {t}')
def ok(c, t):
    print(('   OK    ' if c else '   FALLA ') + t)
    if not c: errores.append(t)

step(1, 'Geometría')
ok(len(LC) == 5, f'{len(LC)} pórticos, separación {PITCH} m, vano total {LC[-1]-LC[0]:.2f} m')
ok(abs(LC[-1] - 4 * PITCH) < 0.01, 'pórticos equiespaciados')
ok(abs((W_EXT - W_COL) / 2 - 0.57) < 0.02, f'columnas a {(W_EXT-W_COL)/2:.2f} m de cada borde exterior')
ok(abs(PLAT_AREA - 300) < 5, f'platea {PLAT_L:.2f} × {PLAT_W:.2f} = {PLAT_AREA:.2f} m² por nave (objetivo ≈ 300)')

step(2, 'Dados (solo bajo columnas)')
DADOS = [(u, v) for u in LC for v in (0.0, W_COL)]
ok(len(DADOS) == 10, f'{len(DADOS)} dados por nave')

step(3, 'Riostres transversales (uno por pórtico)')
rio_ml = len(LC) * W_COL
ok(len(LC) == 5 and abs(rio_ml - 54.80) < 0.01, f'{len(LC)} riostres de {W_COL} m = {rio_ml:.2f} ml por nave')

step(4, 'Hormigón')
hor_plat = PLAT_AREA * PLAT_E * NAVES
hor_rio = rio_ml * RIO[0] * RIO[1] * NAVES
hor_dad = len(DADOS) * DADO[0] * DADO[1] * DADO[2] * NAVES
hor_total = hor_plat + hor_rio + hor_dad
print(f'   platea {hor_plat:.2f} · riostres {hor_rio:.2f} · dados {hor_dad:.2f} · total {hor_total:.2f} m³')

step(5, 'Armadura supuesta')
dado_kg = 4 * (DADO[2] + 0.30) * KG[12] + (DADO[2] / 0.15 + 1) * (2 * (DADO[0] - 0.08) * 2 + 0.10) * KG[8]
rio_kg = 4 * (W_COL + 0.60) * KG[12] + (W_COL / 0.15 + 1) * (2 * (RIO[0] - 0.08) * 2 + 0.10) * KG[8]
kg_dados = dado_kg * len(DADOS) * NAVES
kg_rio = rio_kg * len(LC) * NAVES
kg_malla = (1 / 0.20) * 2 * KG[6] * PLAT_AREA * NAVES
ok(True, f'dados {kg_dados:.0f} kg · riostres {kg_rio:.0f} kg · malla {kg_malla:.0f} kg')

step(6, 'Envolvente por nave')
techo = 2 * L_EXT * SLOPE
muro_lat = 2 * LAT_NETO
muro_frente = GABLE_BRUTO - VIDRIO_FRENTE
muro_fondo = GABLE_BRUTO
muros = muro_lat + muro_frente + muro_fondo
print(f'   techo {techo:.2f} m² (faldón {SLOPE:.3f} m)')
print(f'   muros: laterales {muro_lat:.2f} · frente {muro_frente:.2f} · fondo {muro_fondo:.2f} · total {muros:.2f} m²')
ok(abs(muros + VIDRIO_FRENTE - (muro_lat + 2 * GABLE_BRUTO)) < 0.01, 'muros netos + vidriería = paredes brutas')

step(7, 'Escritura de cantidades y plano')
cant = RAIZ / 'computo' / 'cantidades.json'
d = json.loads(cant.read_text(encoding='utf-8'))
d['nave'] = {'ancho_exterior_m': W_EXT, 'largo_exterior_m': L_EXT, 'porticos': 5, 'separacion_m': PITCH,
             'distancia_columnas_m': W_COL, 'alero_m': ALERO, 'cumbrera_m': CUMB, 'origen': 'medido a escala sobre dibujos del dueño'}
d['cimentacion'] = {
    'dados_por_nave': {'cant': len(DADOS), 'dim_m': '0.70 x 0.70 x 0.55', 'origen': 'medido (0,70 m) + supuesto (alto 0,55)'},
    'platea_m2_por_nave': {'valor': round(PLAT_AREA, 2), 'dim_m': f'{PLAT_L:.2f} x {PLAT_W:.2f}', 'espesor_m': PLAT_E, 'origen': 'calculada: nave más vuelo 0,35 m'},
    'hormigon_platea_m3': {'valor': round(hor_plat, 2)},
    'riostres_por_nave': {'cant': len(LC), 'long_m': W_COL, 'seccion_m': '0.40 x 0.40', 'origen': 'una por pórtico (confirmado por el dueño)'},
    'hormigon_riostres_m3': {'valor': round(hor_rio, 2)},
    'hormigon_dados_m3': {'valor': round(hor_dad, 2)},
    'hormigon_total_m3': {'valor': round(hor_total, 2)},
    'acero_kg': {'dados': round(kg_dados), 'riostres': round(kg_rio), 'malla_platea': round(kg_malla), 'origen': 'supuesta'},
}
d['envolvente_por_nave_m2'] = {
    'techo_PIR': {'valor': round(techo, 2), 'origen': 'calculada: 2 faldones sobre 22,5 m'},
    'muro_PIR_neto': {'valor': round(muros, 2), 'origen': 'laterales medidos (98,10 c/u) + gables calculados'},
    'vidrieria_frente': {'valor': VIDRIO_FRENTE, 'origen': 'pendiente de medir en fachada del dueño'},
}
d['envolvente_3_naves_m2'] = {'techo_PIR': round(techo * NAVES, 2), 'muro_PIR_neto': round(muros * NAVES, 2),
                              'vidrieria': round(VIDRIO_FRENTE * NAVES, 2)}
d['vigas_borde_pendiente'] = {'longitud_ml': round(2 * (PLAT_L + PLAT_W) * NAVES, 1), 'origen': 'no incluidas: el dueño confirmó riostres transversales'}
d['pendientes'] = [
    'Acero de estructura: recalcular desde la lista de piezas del modelo nuevo (hoy 7.141,8 kg por nave, modelo anterior)',
    'Vidriería de frente: medir en la fachada del dueño',
    'Armadura de dados, riostres y malla: validar con calculista',
    'Repartición de sanitaria y eléctrica por nave: validada',
    'Techo PIR: se presupuesta al mismo precio que el muro PIR (USD 50/m²)',
]
cant.write_text(json.dumps(d, ensure_ascii=False, indent=2), encoding='utf-8')

# plano de cimentación con las medidas nuevas
fig = plt.figure(figsize=(16.54, 11.69))
ax = fig.add_axes([0.04, 0.12, 0.92, 0.78]); ax.set_aspect('equal'); ax.axis('off')
GAP = 3.0
for k in range(NAVES):
    o = k * (W_EXT + GAP)
    ax.add_patch(Rectangle((o - PLAT_MARGEN, -PLAT_MARGEN), PLAT_W, PLAT_L, fc='#e9edf2', ec='#555', lw=1.2, ls='--', zorder=0))
    ax.add_patch(Rectangle((o, 0), W_EXT, L_EXT, fill=False, ec='black', lw=2.0, zorder=2))
    for u in LC:
        ax.plot([o + (W_EXT - W_COL) / 2, o + W_EXT - (W_EXT - W_COL) / 2], [u, u], color='#1f6fb4', lw=3.0, alpha=0.35, zorder=1)
    for i, (u, v) in enumerate(DADOS, 1):
        cx = o + (W_EXT - W_COL) / 2 + v
        ax.add_patch(Rectangle((cx - DADO[0] / 2, u - DADO[1] / 2), DADO[0], DADO[1], fc='#cfcfcf', ec='black', lw=0.9, zorder=3))
        ax.text(cx, u, f'D{i}', ha='center', va='center', fontsize=6.5, weight='bold', zorder=4)
    ax.text(o + W_EXT / 2, -2.6, ['NAVE 1 · COMERCIAL', 'NAVE 2 · GASTRONÓMICO', 'NAVE 3 · CONSULTORIOS'][k], ha='center', fontsize=11, weight='bold')
    ax.text(o + W_EXT / 2, -3.6, f'10 dados 0,70 × 0,70 × 0,55 m · 5 riostres 0,40 × 0,40 m · platea {PLAT_AREA:.2f} m² e = 0,15 m', ha='center', fontsize=8)
ax.set_xlim(-3, NAVES * (W_EXT + GAP) - GAP + 3)
ax.set_ylim(-5, L_EXT + 3)
fig.text(0.04, 0.93, 'SMART BUILDING URUGUAY · Pedragosa Sierra · Plano de cimentación (5 pórticos, medidas a escala)', fontsize=12, weight='bold')
fig.text(0.04, 0.905, 'Dados solo bajo columnas. Riostres transversales, uno por pórtico. Platea e = 0,15 m con vuelo 0,35 m. Armadura supuesta, a validar por calculista.', fontsize=8)
with PdfPages(RAIZ / 'planos' / 'cimentacion_5porticos.pdf') as pp:
    pp.savefig(fig)

print('\n' + ('TODAS LAS VALIDACIONES OK' if not errores else f'FALLAS: {len(errores)}'))
for e in errores: print(' -', e)
