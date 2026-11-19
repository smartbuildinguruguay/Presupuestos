"""Valida cantidades.json contra la planilla original. Ejecutar: python3 checks/check_cantidades.py"""
import json, pathlib, sys

raiz = pathlib.Path(__file__).resolve().parent.parent
d = json.loads((raiz / "computo" / "cantidades.json").read_text(encoding="utf-8"))
errores = []

def suma(bloque, clave):
    return sum(v[clave] for k, v in bloque.items() if k.startswith("N"))

# Planilla original (global)
PLANILLA = {
    ("sanitaria", "inodoros"): 10, ("sanitaria", "lavatorios"): 10, ("sanitaria", "duchas"): 10,
    ("sanitaria", "desagues_kitchenette"): 6, ("sanitaria", "termotanques"): 6,
    ("electrica", "tableros"): 7, ("electrica", "medidores"): 7, ("electrica", "tomas"): 74,
    ("electrica", "bocas"): 74, ("electrica", "tomas_20A"): 16, ("electrica", "carteles_C7"): 6,
}
for (rubro, clave), esperado in PLANILLA.items():
    total = suma(d[rubro], clave)
    if total != esperado:
        errores.append(f"{rubro}.{clave}: suma {total} != planilla {esperado}")

# Dados solo bajo columnas: 2 columnas por porticos interiores/extremos => 2 * porticos
dados = d["cimentacion"]["dados_por_nave"]["cant"]
if dados != 2 * d["nave"]["porticos"]:
    errores.append(f"dados por nave {dados} != 2 x porticos")

# Columnas = 2 por portico
if d["estructura_por_nave"]["columnas_HI_240x100x6"]["cant"] != 2 * d["nave"]["porticos"]:
    errores.append("columnas != 2 x porticos")

# Area = largo x ancho
area = d["nave"]["largo_m"] * d["nave"]["ancho_m"]
if abs(area - d["nave"]["area_m2"]) > 0.01:
    errores.append(f"area {d['nave']['area_m2']} != {area:.2f}")

# Riostres = 4 x ancho
if d["cimentacion"]["riostres_por_nave"]["cant"] != d["nave"]["porticos"]:
    errores.append("riostres != porticos")
if abs(d["cimentacion"]["riostres_por_nave"]["long_m"] - d["nave"]["ancho_m"]) > 0.01:
    errores.append("riostre != ancho")

if errores:
    print("FALLAS:"); [print(" -", e) for e in errores]; sys.exit(1)
print("OK: cantidades coinciden con planilla y geometria")
