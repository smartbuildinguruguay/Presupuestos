"""Cimentación y envolvente de la nave (5 pórticos, 22,5 x 11,1 m).

Genera:
  - planos/cimentacion_5porticos.pdf  (planta de dados, riostres y platea)
  - computo/cantidades.json            (actualiza cimentación y envolvente)
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

# ---- geometría del modelo (nave_glb.py) ----
LC = [0.00, 5.625, 11.25, 16.875, 22.50]   # 5 pórticos
L = LC[-1]                                 # 22,50 m
W = 11.10                                  # luz entre columnas
ALERO, CUMB = 5.50, 7.95
RAF_L = math.hypot(W / 2, CUMB - ALERO)    # faldón (m)
Z0 = 0.20

# ---- cimentación (supuesta, a validar por calculista) ----
DADO = (0.70, 0.70, 0.55)                  # ancho, largo, alto
RIO = (0.40, 0.40)                         # riostre b x h
PLAT_E = 0.15                              # espesor de platea
KG = {6: 0.222, 8: 0.395, 12: 0.888}       # kg/m por diámetro
DADOS_POR_NAVE = [(u, v) for u in LC for v in (0.0, W)]
RIOSTRES_POR_NAVE = LC                     # un riostre transversal por pórtico

# ---- envolvente (aberturas de planilla / modelo) ----
ABERT_NORTE = [4.71, 4.71, 6.30]           # m², aluminio/PVC con hoja (lateral norte)
VIDRIO_FRENTE = [24.74, 22.51]             # m², vidriería (frente)

def step(n, titulo):
    print(f'\n[{n}] {titulo}')

errores = []
def ok(cond, texto):
    print(('   OK   ' if cond else '   FALLA ') + texto)
    if not cond:
        errores.append(texto)

# ===== paso 1: geometría =====
step(1, 'Geometría de la nave')
area = L * W
ok(abs(area - 249.75) < 0.01, f'área de planta {area:.2f} m² (esperado 249,75)')
ok(len(LC) == 5, f'{len(LC)} pórticos a {LC[1]-LC[0]:.3f} m')

# ===== paso 2: dados =====
step(2, 'Dados solo bajo columnas')
ok(len(DADOS_POR_NAVE) == 10, f'{len(DADOS_POR_NAVE)} dados por nave (5 pórticos × 2 columnas)')
ok(all(v in (0.0, W) for _, v in DADOS_POR_NAVE), 'ningún dado en el eje central ni en columnas interiores')
dado_vol = DADO[0] * DADO[1] * DADO[2]
hor_dados = len(DADOS_POR_NAVE) * dado_vol * NAVES

# ===== paso 3: riostres =====
step(3, 'Riostres transversales')
ok(len(RIOSTRES_POR_NAVE) == 5, f'{len(RIOSTRES_POR_NAVE)} riostres por nave (uno por pórtico)')
rio_L = W
rio_vol = len(RIOSTRES_POR_NAVE) * rio_L * RIO[0] * RIO[1]
hor_rio = rio_vol * NAVES
print(f'   longitud de riostre {rio_L:.2f} m, volumen por nave {rio_vol:.3f} m³')

# ===== paso 4: platea y hormigón =====
step(4, 'Platea y hormigón')
hor_plat = area * PLAT_E * NAVES
hor_total = hor_plat + hor_rio + hor_dados
print(f'   platea {hor_plat:.2f} m³ · riostres {hor_rio:.2f} m³ · dados {hor_dados:.3f} m³ · total {hor_total:.2f} m³')
ok(abs(hor_plat - 112.4) < 0.1, 'platea coincide con la cantidad anterior (112,4 m³)')

# ===== paso 5: armadura =====
step(5, 'Armadura supuesta')
dado_kg = 4 * (DADO[2] + 0.30) * KG[12] + (DADO[2] / 0.15 + 1) * (2 * (DADO[0] - 0.08) * 2 + 0.10) * KG[8]
rio_kg = 4 * (rio_L + 0.60) * KG[12] + (rio_L / 0.15 + 1) * (2 * (RIO[0] - 0.08) * 2 + 0.10) * KG[8]
malla_kg_m2 = (1 / 0.20) * 2 * KG[6]
kg_dados = dado_kg * len(DADOS_POR_NAVE) * NAVES
kg_rio = rio_kg * len(RIOSTRES_POR_NAVE) * NAVES
kg_malla = malla_kg_m2 * area * NAVES
print(f'   dado {dado_kg:.1f} kg · riostre {rio_kg:.1f} kg · malla {malla_kg_m2:.2f} kg/m²')
print(f'   total: dados {kg_dados:.0f} kg · riostres {kg_rio:.0f} kg · malla platea {kg_malla:.0f} kg')
ok(abs(kg_malla - 1664) < 5, f'malla de platea {kg_malla:.0f} kg (anterior 1.664)')

# ===== paso 6: envolvente =====
step(6, 'Envolvente: techo, muros PIR y vidriería (por nave)')
techo = 2 * L * RAF_L
muro_norte_bruto = L * ALERO
muro_sur_bruto = L * ALERO
gable_rect = W * ALERO
gable_tri = W * (CUMB - ALERO) / 2
gable_bruto = gable_rect + gable_tri
vidrio_frente = sum(VIDRIO_FRENTE)
abert_norte = sum(ABERT_NORTE)
muro_norte = muro_norte_bruto - abert_norte
muro_frente = gable_bruto - vidrio_frente
muro_fondo = gable_bruto
muros = muro_norte + muro_sur_bruto + muro_frente + muro_fondo
print(f'   techo PIR (2 faldones de {RAF_L:.3f} m): {techo:.2f} m²')
print(f'   muro norte {muro_norte:.2f} · muro sur {muro_sur_bruto:.2f} · frente {muro_frente:.2f} · fondo {muro_fondo:.2f} · total {muros:.2f} m²')
print(f'   vidriería frente {vidrio_frente:.2f} m² · aberturas aluminio/PVC (norte) {abert_norte:.2f} m²')
ok(abs(vidrio_frente * NAVES + abert_norte * NAVES - 188.88) < 0.1,
   f'aberturas totales {(vidrio_frente+abert_norte)*NAVES:.2f} m² (anterior 188,88)')
ok(abs(muros + vidrio_frente + abert_norte - (muro_norte_bruto + muro_sur_bruto + 2*gable_bruto)) < 0.01,
   'muros netos + aberturas = paredes brutas')


# ---- vigas de borde de la platea (pendiente de decisión: no entra en el total de hormigón) ----
PERIM_NAVE = 2 * (L + W)
VB_SECCION = (0.40, 0.40)
vb_ml = PERIM_NAVE * NAVES
vb_m3 = PERIM_NAVE * VB_SECCION[0] * VB_SECCION[1] * NAVES
GALV_KG = round(7141.8 * NAVES)

# ===== salida: cantidades.json =====
step(7, 'Escritura de cantidades.json y plano')
cant_path = RAIZ / 'computo' / 'cantidades.json'
d = json.loads(cant_path.read_text(encoding='utf-8'))
d['cimentacion'] = {
    'dados_por_nave': {'cant': len(DADOS_POR_NAVE), 'dim_m': '0.70 x 0.70 x 0.55', 'origen': 'calculada: solo bajo columnas'},
    'hormigon_dados_m3': {'valor': round(hor_dados, 3), 'origen': 'calculada'},
    'platea_m2_por_nave': {'valor': area, 'espesor_m': PLAT_E, 'origen': 'medida'},
    'hormigon_platea_m3': {'valor': round(hor_plat, 2), 'origen': 'calculada'},
    'riostres_por_nave': {'cant': len(RIOSTRES_POR_NAVE), 'long_m': rio_L, 'seccion_m': '0.40 x 0.40', 'origen': 'supuesta: uno por pórtico'},
    'hormigon_riostres_m3': {'valor': round(hor_rio, 2), 'origen': 'calculada'},
    'hormigon_total_m3': {'valor': round(hor_total, 2), 'origen': 'calculada'},
    'acero_kg': {'dados': round(kg_dados), 'riostres': round(kg_rio), 'malla_platea': round(kg_malla), 'origen': 'supuesta (armadura tentativa)'},
}
d['envolvente_por_nave_m2'] = {
    'techo_PIR': {'valor': round(techo, 2), 'origen': 'medida (faldones del modelo)'},
    'muro_PIR_neto': {'valor': round(muros, 2), 'origen': 'calculada: bruto menos aberturas'},
    'vidrieria_frente': {'valor': round(vidrio_frente, 2), 'origen': 'planilla de aberturas'},
    'aberturas_aluminio_PVC': {'valor': round(abert_norte, 2), 'origen': 'planilla de aberturas'},
}
d['envolvente_3_naves_m2'] = {
    'techo_PIR': round(techo * NAVES, 2),
    'muro_PIR_neto': round(muros * NAVES, 2),
    'vidrieria': round(vidrio_frente * NAVES, 2),
    'aberturas_aluminio_PVC': round(abert_norte * NAVES, 2),
}
d['vigas_borde_pendiente'] = {
    'longitud_ml': round(vb_ml, 1), 'seccion_m': '0.40 x 0.40 (supuesta)',
    'hormigon_m3': round(vb_m3, 2), 'origen': 'medida (perímetro de platea); no incluida en el total',
}
d['galvanizado_ISO1461_kg'] = {'valor': GALV_KG, 'origen': 'igual al acero de estructura; precio a cotizar'}
d['pendientes'] = [
    'Vigas de borde de la platea: decidir si se incluyen (32,3 m³ con 0,40 × 0,40)',
    'Armadura de dados, riostres y malla: validar con calculista',
    'Repartición de sanitaria y eléctrica por nave: validar',
    'Techo PIR: decidir si se presupuesta aparte de los muros',
]
cant_path.write_text(json.dumps(d, ensure_ascii=False, indent=2), encoding='utf-8')

# ---- plano de cimentación ----
fig = plt.figure(figsize=(16.54, 11.69))
ax = fig.add_axes([0.04, 0.10, 0.92, 0.78]); ax.set_aspect('equal'); ax.axis('off')
GAP = 3.0
for k in range(NAVES):
    o = k * (L + GAP)
    ax.add_patch(Rectangle((o, 0), L, W, fill=False, ec='black', lw=2.0))
    ax.add_patch(Rectangle((o, 0), L, W, fc='#f2f2f2', ec='none', zorder=0))
    for u in LC:
        ax.plot([o + u, o + u], [0, W], color='#7a7a7a', lw=0.8, ls=(0, (6, 3)))
    for u in LC:  # riostres transversales
        ax.plot([o + u, o + u], [0, W], color='#1f6fb4', lw=3.0, alpha=0.35, zorder=1)
    for i, (u, v) in enumerate(DADOS_POR_NAVE, 1):
        ax.add_patch(Rectangle((o + u - DADO[0] / 2, v - DADO[1] / 2), DADO[0], DADO[1],
                               fc='#cfcfcf', ec='black', lw=0.9, zorder=3))
        ax.text(o + u, v, f'D{i}', ha='center', va='center', fontsize=6.5, weight='bold', zorder=4)
    ax.text(o + L / 2, -3.4, ['NAVE 1 · COMERCIAL', 'NAVE 2 · GASTRONÓMICO', 'NAVE 3 · CONSULTORIOS'][k],
            ha='center', fontsize=11, weight='bold')
    ax.text(o + L / 2, -4.2, f'10 dados de 0,70 × 0,70 × 0,55 m · 5 riostres 0,40 × 0,40 m · platea {area:.2f} m²',
            ha='center', fontsize=8)
ax.annotate('', xy=(0, -1.0), xytext=(L, -1.0), arrowprops=dict(arrowstyle='<->', lw=0.8))
ax.text(L / 2, -1.6, f'{L:.2f} m', ha='center', fontsize=9)
ax.annotate('', xy=(-1.2, 0), xytext=(-1.2, W), arrowprops=dict(arrowstyle='<->', lw=0.8))
ax.text(-1.7, W / 2, f'{W:.2f} m', ha='center', rotation=90, fontsize=9)
ax.set_xlim(-3, NAVES * (L + GAP) - GAP + 3)
ax.set_ylim(-5.5, W + 2.5)
fig.text(0.04, 0.94, 'SMART BUILDING URUGUAY · Juan Carlos García · Pedragosa Sierra · Plano de cimentación (5 pórticos)',
         fontsize=12, weight='bold')
fig.text(0.04, 0.915, 'Dados solo bajo columnas (10 por nave). Riostres transversales en cada pórtico. Platea e = 0,15 m. '
         'Dimensiones supuestas, a validar por el calculista.', fontsize=8)
fig.text(0.04, 0.06, 'Medidas en metros · sin escala · dimensiones y armadura tentativas', fontsize=7.5)
with PdfPages(RAIZ / 'planos' / 'cimentacion_5porticos.pdf') as pp:
    pp.savefig(fig)

print('\n' + ('TODAS LAS VALIDACIONES OK' if not errores else f'FALLAS: {len(errores)}'))
for e in errores:
    print(' -', e)
